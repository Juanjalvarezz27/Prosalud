import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  applyPercentageDiscount,
  calculateCashUsdNeededForRemainingRef,
  calculateLineTotal,
  calculateRefCanceledByBs,
  calculateRefCanceledByCashUsd,
  centsToDecimalString,
  convertRefCentsToBsCents,
  parseCents,
  parseRate,
  roundHalfUp,
} from "../src/lib/money.ts";
import {
  formatBs,
  formatCentsVe,
  formatNumberVe,
  formatRateVe,
  formatUsd,
} from "../src/lib/format.ts";

describe("Formato venezolano (5.4)", () => {
  it("formatea números y montos con punto de miles y coma decimal", () => {
    assert.equal(formatNumberVe(1234.56), "1.234,56");
    assert.equal(formatNumberVe(0), "0,00");
    assert.equal(formatNumberVe(801, 0), "801");
    assert.equal(formatCentsVe(parseCents("1234.56")), "1.234,56");
    assert.equal(formatUsd(parseCents("1234.56")), "$1.234,56");
    assert.equal(formatUsd(parseCents("-50.00")), "-$50,00");
    assert.equal(formatBs(parseCents("1157.55")), "1.157,55 Bs.");
    assert.equal(formatRateVe(parseRate("38.4567")), "38,4567");
    assert.equal(formatRateVe(parseRate("40")), "40,00");
  });
});

describe("Redondeo R16 — Anexo A.4", () => {
  it("A.4.1: descuento por porcentaje HALF_UP (3,345 -> 3,35)", () => {
    const lineBase = calculateLineTotal(3, parseCents("11.15"));
    assert.equal(lineBase, 3345n);

    const { discountCents, totalCents } = applyPercentageDiscount(lineBase, 10);
    assert.equal(discountCents, 335n);
    assert.equal(totalCents, 3010n);
    assert.equal(centsToDecimalString(totalCents), "30.10");
  });

  it("A.4.2: monto en Bs con tasa de 4 decimales sin redondear tasa", () => {
    const bs = convertRefCentsToBsCents(parseCents("30.10"), parseRate("38.4567"));
    assert.equal(bs, 115755n);
    assert.equal(formatBs(bs), "1.157,55 Bs.");
  });

  it("A.4.3: abono en Bs cancela 30,10 referenciales exactos", () => {
    const canceled = calculateRefCanceledByBs(
      parseCents("1157.55"),
      parseRate("38.4567")
    );
    assert.equal(canceled, 3010n);
  });

  it("A.4.4: efectivo $ con factor no exacto salda a 0,00 sin residuos", () => {
    const lineTotalRefCents = parseCents("30.10");
    const lineTotalDivisasCents = parseCents("26.00");

    const step1 = calculateRefCanceledByCashUsd({
      cashUsdCents: parseCents("10.00"),
      lineTotalRefCents,
      lineTotalDivisasCents,
      lineRemainingRefCents: lineTotalRefCents,
    });
    assert.equal(step1.refCanceledCents, 1158n);
    assert.equal(step1.newRemainingRefCents, 1852n);

    const step2 = calculateRefCanceledByCashUsd({
      cashUsdCents: parseCents("16.00"),
      lineTotalRefCents,
      lineTotalDivisasCents,
      lineRemainingRefCents: step1.newRemainingRefCents,
    });
    assert.equal(step2.refCanceledCents, 1852n);
    assert.equal(step2.newRemainingRefCents, 0n);
  });

  it("roundHalfUp maneja positivos, negativos y mitades exactas", () => {
    assert.equal(roundHalfUp(5n, 1000n, 2), 1n); // 0.005 -> 0.01
    assert.equal(roundHalfUp(4n, 1000n, 2), 0n); // 0.004 -> 0.00
    assert.equal(roundHalfUp(-5n, 1000n, 2), -1n);
  });
});

describe("Ejemplo de referencia R15 (al centavo)", () => {
  const lines = [
    { ref: parseCents("40.00"), div: parseCents("30.00") },
    { ref: parseCents("35.00"), div: parseCents("28.00") },
    { ref: parseCents("25.00"), div: parseCents("20.00") },
  ];

  it("Casos A, B, C, D y E de R15", () => {
    const totalRef = lines.reduce((acc, l) => acc + l.ref, 0n);
    const totalDiv = lines.reduce((acc, l) => acc + l.div, 0n);
    assert.equal(totalRef, 10000n);
    assert.equal(totalDiv, 7800n);

    // Caso B: líneas 1 y 2 en efectivo ($58), línea 3 en Bs ($25 * 40 = 1.000,00 Bs)
    assert.equal(lines[0].div + lines[1].div, 5800n);
    assert.equal(convertRefCentsToBsCents(lines[2].ref, parseRate(40)), 100000n);

    // Caso C: abona $50,00 en efectivo por defecto
    const payL1 = calculateRefCanceledByCashUsd({
      cashUsdCents: 3000n,
      lineTotalRefCents: lines[0].ref,
      lineTotalDivisasCents: lines[0].div,
      lineRemainingRefCents: lines[0].ref,
    });
    assert.equal(payL1.refCanceledCents, 4000n);
    assert.equal(payL1.newRemainingRefCents, 0n);

    const payL2 = calculateRefCanceledByCashUsd({
      cashUsdCents: 2000n,
      lineTotalRefCents: lines[1].ref,
      lineTotalDivisasCents: lines[1].div,
      lineRemainingRefCents: lines[1].ref,
    });
    assert.equal(payL2.refCanceledCents, 2500n);
    assert.equal(payL2.newRemainingRefCents, 1000n);

    const remainingTotalC = payL1.newRemainingRefCents + payL2.newRemainingRefCents + lines[2].ref;
    assert.equal(remainingTotalC, 3500n);

    // Caso D: abona 800,00 Bs con tasa 40 -> cancela $20,00 ref -> saldo $15,00
    const canceledBs = calculateRefCanceledByBs(parseCents("800.00"), parseRate(40));
    assert.equal(canceledBs, 2000n);
    const remainingTotalD = remainingTotalC - canceledBs;
    assert.equal(remainingTotalD, 1500n);

    // Caso E: saldo $15,00 con tasa 42 -> 630,00 Bs
    assert.equal(convertRefCentsToBsCents(remainingTotalD, parseRate(42)), 63000n);

    // Efectivo necesario para liquidar saldo restante de línea 2 ($10,00 ref * 0,80 = $8,00 div)
    assert.equal(
      calculateCashUsdNeededForRemainingRef({
        lineRemainingRefCents: payL2.newRemainingRefCents,
        lineTotalRefCents: lines[1].ref,
        lineTotalDivisasCents: lines[1].div,
      }),
      800n
    );
  });
});
