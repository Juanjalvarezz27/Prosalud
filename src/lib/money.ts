// Motor de aritmética decimal exacta basado en BigInt (R16, sin punto flotante)

export type Cents = bigint;
export type ScaledRate = bigint; // Escala fija de 8 decimales (10^8)

export const RATE_SCALE = 8;
const RATE_FACTOR = 100_000_000n;
const CENTS_FACTOR = 100n;

// Redondea una fracción num/den a targetScale decimales usando HALF_UP (0,005 -> 0,01)
export function roundHalfUp(
  numerator: bigint,
  denominator: bigint,
  targetScale = 2
): bigint {
  if (denominator === 0n) {
    throw new RangeError("División por cero en cálculo monetario");
  }
  if (numerator === 0n) return 0n;

  const isNegative = (numerator < 0n) !== (denominator < 0n);
  const absNum = numerator < 0n ? -numerator : numerator;
  const absDen = denominator < 0n ? -denominator : denominator;

  const scaleFactor = 10n ** BigInt(targetScale);
  const scaled = absNum * scaleFactor;
  let quotient = scaled / absDen;
  const remainder = scaled % absDen;

  if (remainder * 2n >= absDen) {
    quotient += 1n;
  }

  return isNegative ? -quotient : quotient;
}

// Convierte string o número decimal a entero escalado exacto sin pérdida binaria
export function parseDecimalToScaled(
  input: string | number | bigint,
  scale: number
): bigint {
  if (typeof input === "bigint") {
    return input * 10n ** BigInt(scale);
  }

  const raw = typeof input === "number" ? input.toString() : input.trim();
  if (!raw) {
    throw new Error("Valor decimal vacío");
  }

  // Soporta formato estándar ("1234.56") o venezolano ("1.234,56")
  let normalized = raw.replace(/\s+/g, "");
  if (normalized.includes(",") && normalized.includes(".")) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else if (normalized.includes(",")) {
    normalized = normalized.replace(",", ".");
  }

  if (!/^[+-]?\d+(\.\d+)?$/.test(normalized)) {
    throw new Error(`Valor decimal inválido: "${input}"`);
  }

  const isNegative = normalized.startsWith("-");
  const unsigned = normalized.replace(/^[+-]/, "");
  const [intPart, fracPart = ""] = unsigned.split(".");

  if (fracPart.length > scale) {
    throw new Error(
      `El valor "${input}" excede el máximo de ${scale} decimales permitidos`
    );
  }

  const paddedFrac = fracPart.padEnd(scale, "0");
  const result = BigInt(intPart + paddedFrac);
  return isNegative ? -result : result;
}

export function parseCents(input: string | number | bigint): Cents {
  return parseDecimalToScaled(input, 2);
}

export function parseRate(input: string | number | bigint): ScaledRate {
  return parseDecimalToScaled(input, RATE_SCALE);
}

export function centsToNumber(cents: Cents): number {
  return Number(cents) / 100;
}

export function centsToDecimalString(cents: Cents): string {
  const isNegative = cents < 0n;
  const abs = isNegative ? -cents : cents;
  const intPart = abs / CENTS_FACTOR;
  const fracPart = (abs % CENTS_FACTOR).toString().padStart(2, "0");
  return `${isNegative ? "-" : ""}${intPart}.${fracPart}`;
}

export function rateToDecimalString(rate: ScaledRate): string {
  const isNegative = rate < 0n;
  const abs = isNegative ? -rate : rate;
  const intPart = abs / RATE_FACTOR;
  const fracPart = (abs % RATE_FACTOR)
    .toString()
    .padStart(RATE_SCALE, "0")
    .replace(/0+$/, "");
  const formattedFrac = fracPart.length >= 2 ? fracPart : fracPart.padEnd(2, "0");
  return `${isNegative ? "-" : ""}${intPart}.${formattedFrac}`;
}

// R16.1: Descuento por porcentaje = redondear(base * %); total = base - descuento
export function applyPercentageDiscount(
  baseCents: Cents,
  percent: string | number
): { discountCents: Cents; totalCents: Cents } {
  const percentScaled = parseDecimalToScaled(percent, 4); // hasta 4 decimales de %
  // baseCents (10^2) * percentScaled (10^4) / (100 * 10^4) -> redondear a escala 0 de centavos
  const discountCents = roundHalfUp(baseCents * percentScaled, 1_000_000n, 0);
  return {
    discountCents,
    totalCents: baseCents - discountCents,
  };
}

// R16.2: Total de línea = cantidad * precio unitario - descuento
export function calculateLineTotal(
  quantity: number,
  unitPriceCents: Cents,
  discountCents: Cents = 0n
): Cents {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new RangeError("La cantidad debe ser un entero no negativo");
  }
  return BigInt(quantity) * unitPriceCents - discountCents;
}

// R16.4: Monto en Bs = redondear(total referencial * tasa), una sola vez sobre el total
export function convertRefCentsToBsCents(
  refCents: Cents,
  rate: ScaledRate
): Cents {
  if (rate <= 0n) {
    throw new RangeError("La tasa BCV debe ser mayor que cero");
  }
  // refCents (escala 2) * rate (escala 8) / 10^8 -> centavos de Bs (escala 2)
  return roundHalfUp(refCents * rate, RATE_FACTOR, 0);
}

// R16.5: Abono en Bs -> $ referenciales cancelados = redondear(monto_Bs / tasa)
export function calculateRefCanceledByBs(
  bsCents: Cents,
  rate: ScaledRate
): Cents {
  if (rate <= 0n) {
    throw new RangeError("La tasa BCV debe ser mayor que cero");
  }
  // bsCents (escala 2) * 10^8 / rate (escala 8) -> centavos ref (escala 2)
  return roundHalfUp(bsCents * RATE_FACTOR, rate, 0);
}

// R16.6: Abono en efectivo $ -> $ ref. cancelados = redondear(monto_$ * total_ref / total_divisas)
// Si el pago cubre todo lo que resta en divisas, el saldo queda en 0,00 exacto
export function calculateRefCanceledByCashUsd(params: {
  cashUsdCents: Cents;
  lineTotalRefCents: Cents;
  lineTotalDivisasCents: Cents;
  lineRemainingRefCents: Cents;
}): {
  refCanceledCents: Cents;
  newRemainingRefCents: Cents;
} {
  const {
    cashUsdCents,
    lineTotalRefCents,
    lineTotalDivisasCents,
    lineRemainingRefCents,
  } = params;

  if (lineTotalDivisasCents <= 0n || lineTotalRefCents <= 0n) {
    throw new RangeError("Los totales de la línea deben ser mayores que cero");
  }
  if (cashUsdCents <= 0n || lineRemainingRefCents <= 0n) {
    return {
      refCanceledCents: 0n,
      newRemainingRefCents: lineRemainingRefCents,
    };
  }

  // Equivalente exacto en divisas necesario para saldar la línea restante
  const remainingDivisasNeeded = roundHalfUp(
    lineRemainingRefCents * lineTotalDivisasCents,
    lineTotalRefCents,
    0
  );

  if (cashUsdCents >= remainingDivisasNeeded) {
    return {
      refCanceledCents: lineRemainingRefCents,
      newRemainingRefCents: 0n,
    };
  }

  const refCanceledCents = roundHalfUp(
    cashUsdCents * lineTotalRefCents,
    lineTotalDivisasCents,
    0
  );

  if (refCanceledCents >= lineRemainingRefCents) {
    return {
      refCanceledCents: lineRemainingRefCents,
      newRemainingRefCents: 0n,
    };
  }

  return {
    refCanceledCents,
    newRemainingRefCents: lineRemainingRefCents - refCanceledCents,
  };
}

// Calcula cuánto efectivo $ se necesita para cubrir exactamente el saldo referencial restante de una línea
export function calculateCashUsdNeededForRemainingRef(params: {
  lineRemainingRefCents: Cents;
  lineTotalRefCents: Cents;
  lineTotalDivisasCents: Cents;
}): Cents {
  const { lineRemainingRefCents, lineTotalRefCents, lineTotalDivisasCents } =
    params;
  if (lineRemainingRefCents <= 0n) return 0n;
  return roundHalfUp(
    lineRemainingRefCents * lineTotalDivisasCents,
    lineTotalRefCents,
    0
  );
}
