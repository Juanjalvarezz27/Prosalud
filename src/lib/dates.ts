// Utilidades de fechas y vencimientos en zona horaria única America/Caracas (R17)

export const CARACAS_TIMEZONE = "America/Caracas";
const CARACAS_UTC_OFFSET_HOURS = 4; // UTC-4 fijo, sin horario de verano
const MS_PER_DAY = 86_400_000;

export interface CaracasCalendarDate {
  year: number;
  month: number; // 1..12
  day: number; // 1..31
}

function toDate(input: Date | string | number): Date {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) {
    throw new RangeError(`Fecha inválida: "${String(input)}"`);
  }
  return date;
}

// Obtiene año, mes y día calendario en hora de Caracas
export function getCaracasCalendarDate(
  input: Date | string | number = new Date()
): CaracasCalendarDate {
  const date = toDate(input);
  // Desplazamos -4h sobre UTC para leer directamente año/mes/día calendario en Caracas
  const shifted = new Date(date.getTime() - CARACAS_UTC_OFFSET_HOURS * 3_600_000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

export function formatCaracasIsoDate(
  input: Date | string | number = new Date()
): string {
  const { year, month, day } = getCaracasCalendarDate(input);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function parseIsoDateString(isoDate: string): CaracasCalendarDate {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!match) {
    throw new RangeError(`Formato de fecha ISO esperado YYYY-MM-DD: "${isoDate}"`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() + 1 !== month ||
    check.getUTCDate() !== day
  ) {
    throw new RangeError(`Fecha calendario inválida: "${isoDate}"`);
  }
  return { year, month, day };
}

// Devuelve el instante UTC correspondiente a las 00:00:00.000 en Caracas de ese día
export function getCaracasDayStartUtc(
  cal: CaracasCalendarDate | string
): Date {
  const { year, month, day } =
    typeof cal === "string" ? parseIsoDateString(cal) : cal;
  return new Date(Date.UTC(year, month - 1, day, CARACAS_UTC_OFFSET_HOURS, 0, 0, 0));
}

// Devuelve el instante UTC correspondiente a las 23:59:59.999 en Caracas de ese día
export function getCaracasDayEndUtc(
  cal: CaracasCalendarDate | string
): Date {
  const start = getCaracasDayStartUtc(cal);
  return new Date(start.getTime() + MS_PER_DAY - 1);
}

export function addCaracasDays(
  cal: CaracasCalendarDate | string,
  days: number
): CaracasCalendarDate {
  const { year, month, day } =
    typeof cal === "string" ? parseIsoDateString(cal) : cal;
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

export function formatCalendarDateIso(cal: CaracasCalendarDate): string {
  return `${cal.year}-${String(cal.month).padStart(2, "0")}-${String(cal.day).padStart(2, "0")}`;
}

// R17 / S13: Crédito — día de emisión = día 0; vence a los 10 días calendario
export function getCreditDueDate(issuedAt: Date | string): Date {
  const issuedCal = getCaracasCalendarDate(issuedAt);
  const dueCal = addCaracasDays(issuedCal, 10);
  return getCaracasDayEndUtc(dueCal);
}

// Vencida desde las 00:00 (Caracas) del día siguiente al vencimiento (día 11)
export function isCreditOverdue(
  issuedAt: Date | string,
  now: Date | string = new Date()
): boolean {
  const issuedCal = getCaracasCalendarDate(issuedAt);
  const overdueStart = getCaracasDayStartUtc(addCaracasDays(issuedCal, 11));
  return toDate(now).getTime() >= overdueStart.getTime();
}

export function getCreditDaysRemaining(
  issuedAt: Date | string,
  now: Date | string = new Date()
): number {
  const issuedDayStart = getCaracasDayStartUtc(getCaracasCalendarDate(issuedAt));
  const nowDayStart = getCaracasDayStartUtc(getCaracasCalendarDate(now));
  const elapsedDays = Math.round(
    (nowDayStart.getTime() - issuedDayStart.getTime()) / MS_PER_DAY
  );
  return 10 - elapsedDays;
}

// R17 / S3: Cotización — día 0 = creación; válida hasta el final del día 3
export function getQuoteValidUntil(createdAt: Date | string): Date {
  const createdCal = getCaracasCalendarDate(createdAt);
  return getCaracasDayEndUtc(addCaracasDays(createdCal, 3));
}

// Eliminada/expirada desde las 00:00 (Caracas) del día 4
export function isQuoteExpired(
  createdAt: Date | string,
  now: Date | string = new Date()
): boolean {
  const createdCal = getCaracasCalendarDate(createdAt);
  const expiredStart = getCaracasDayStartUtc(addCaracasDays(createdCal, 4));
  return toDate(now).getTime() >= expiredStart.getTime();
}

// R17 / S14: Lunes a viernes usa su fecha; sábado y domingo usan la del lunes siguiente
export function getEffectiveBcvRateDateIso(
  input: Date | string | number = new Date()
): string {
  const cal = getCaracasCalendarDate(input);
  const dayOfWeek = new Date(
    Date.UTC(cal.year, cal.month - 1, cal.day)
  ).getUTCDay(); // 0=Dom, 6=Sáb

  if (dayOfWeek === 6) {
    return formatCalendarDateIso(addCaracasDays(cal, 2));
  }
  if (dayOfWeek === 0) {
    return formatCalendarDateIso(addCaracasDays(cal, 1));
  }
  return formatCalendarDateIso(cal);
}

// Rango UTC [start, endExclusive) de un mes calendario en Caracas (A.3.2)
export function getCaracasMonthRange(
  year: number,
  month: number
): { start: Date; endExclusive: Date } {
  if (month < 1 || month > 12) {
    throw new RangeError(`Mes inválido: ${month}`);
  }
  const start = getCaracasDayStartUtc({ year, month, day: 1 });
  const nextMonth = month === 12 ? { year: year + 1, month: 1, day: 1 } : { year, month: month + 1, day: 1 };
  const endExclusive = getCaracasDayStartUtc(nextMonth);
  return { start, endExclusive };
}

// Formato venezolano dd/MM/yyyy en hora de Caracas
export function formatDateVe(input: Date | string | number): string {
  const { year, month, day } = getCaracasCalendarDate(input);
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

export function formatDateTimeVe(input: Date | string | number): string {
  const date = toDate(input);
  const shifted = new Date(date.getTime() - CARACAS_UTC_OFFSET_HOURS * 3_600_000);
  const hh = String(shifted.getUTCHours()).padStart(2, "0");
  const mm = String(shifted.getUTCMinutes()).padStart(2, "0");
  return `${formatDateVe(date)} ${hh}:${mm}`;
}
