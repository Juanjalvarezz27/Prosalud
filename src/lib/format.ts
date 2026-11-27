import type { Cents, ScaledRate } from "./money";

const RATE_FACTOR = 100_000_000n;
const RATE_SCALE = 8;

// Formatea un número entero o decimal en formato venezolano (1.234,56)
export function formatNumberVe(
  value: number | string,
  decimals = 2
): string {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) {
    throw new RangeError(`Número inválido para formatear: "${value}"`);
  }

  const isNegative = num < 0;
  const fixed = Math.abs(num).toFixed(decimals);
  const [intPart, fracPart] = fixed.split(".");
  const groupedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  const sign = isNegative && Number(fixed) !== 0 ? "-" : "";
  return decimals > 0 ? `${sign}${groupedInt},${fracPart}` : `${sign}${groupedInt}`;
}

// Formatea centavos exactos (BigInt) en formato venezolano sin pasar por float
export function formatCentsVe(cents: Cents): string {
  const isNegative = cents < 0n;
  const abs = isNegative ? -cents : cents;
  const intPart = (abs / 100n).toString();
  const fracPart = (abs % 100n).toString().padStart(2, "0");
  const groupedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${isNegative ? "-" : ""}${groupedInt},${fracPart}`;
}

export function formatUsd(cents: Cents): string {
  const isNegative = cents < 0n;
  const abs = isNegative ? -cents : cents;
  return `${isNegative ? "-" : ""}$${formatCentsVe(abs)}`;
}

export function formatBs(cents: Cents): string {
  return `${formatCentsVe(cents)} Bs.`;
}

// Formatea tasa BCV con 2 a 8 decimales sin perder precisión
export function formatRateVe(rate: ScaledRate, minDecimals = 2): string {
  const isNegative = rate < 0n;
  const abs = isNegative ? -rate : rate;
  const intPart = (abs / RATE_FACTOR).toString();
  const rawFrac = (abs % RATE_FACTOR).toString().padStart(RATE_SCALE, "0");
  const trimmedFrac = rawFrac.replace(/0+$/, "");
  const fracPart =
    trimmedFrac.length >= minDecimals
      ? trimmedFrac
      : trimmedFrac.padEnd(minDecimals, "0");

  const groupedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${isNegative ? "-" : ""}${groupedInt},${fracPart}`;
}
