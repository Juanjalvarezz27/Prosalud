import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatCaracasIsoDate,
  formatDateTimeVe,
  formatDateVe,
  getCaracasMonthRange,
  getCreditDaysRemaining,
  getCreditDueDate,
  getEffectiveBcvRateDateIso,
  getQuoteValidUntil,
  isCreditOverdue,
  isQuoteExpired,
} from "../src/lib/dates.ts";

describe("Fechas, zona horaria America/Caracas y vencimientos (R17 / Anexo A.3)", () => {
  it("A.3.1: nota emitida el 01/12 a las 23:30 Caracas (02/12 03:30 UTC)", () => {
    const issuedAt = new Date("2026-12-02T03:30:00.000Z"); // 01/12 23:30 Caracas
    assert.equal(formatCaracasIsoDate(issuedAt), "2026-12-01");
    assert.equal(formatDateVe(issuedAt), "01/12/2026");
    assert.equal(formatDateTimeVe(issuedAt), "01/12/2026 23:30");

    const dueDate = getCreditDueDate(issuedAt);
    assert.equal(formatCaracasIsoDate(dueDate), "2026-12-11");

    // El 11/12 a las 23:59 Caracas todavía NO está vencida
    assert.equal(
      isCreditOverdue(issuedAt, new Date("2026-12-12T03:59:59.000Z")),
      false
    );
    assert.equal(
      getCreditDaysRemaining(issuedAt, new Date("2026-12-12T03:59:59.000Z")),
      0
    );

    // El 12/12 a las 00:00 Caracas (04:00 UTC) ya está vencida
    assert.equal(
      isCreditOverdue(issuedAt, new Date("2026-12-12T04:00:00.000Z")),
      true
    );
  });

  it("A.3.2: nota del 31/12 22:00 Caracas (01/01 02:00 UTC) cae dentro de diciembre", () => {
    const { start, endExclusive } = getCaracasMonthRange(2026, 12);
    const noteDate = new Date("2027-01-01T02:00:00.000Z"); // 31/12 22:00 Caracas
    assert.equal(noteDate >= start && noteDate < endExclusive, true);
  });

  it("A.3.3: sábado y domingo usan tasa del lunes siguiente", () => {
    // Viernes 2026-11-27
    assert.equal(
      getEffectiveBcvRateDateIso(new Date("2026-11-27T15:00:00.000Z")),
      "2026-11-27"
    );
    // Sábado 2026-11-28 -> Lunes 2026-11-30
    assert.equal(
      getEffectiveBcvRateDateIso(new Date("2026-11-28T15:00:00.000Z")),
      "2026-11-30"
    );
    // Domingo 2026-11-29 -> Lunes 2026-11-30
    assert.equal(
      getEffectiveBcvRateDateIso(new Date("2026-11-29T15:00:00.000Z")),
      "2026-11-30"
    );
  });

  it("A.3.4: cotización del 01/12 válida hasta 04/12 23:59 y expirada desde 05/12 00:00", () => {
    const createdAt = new Date("2026-12-01T14:00:00.000Z"); // 01/12 10:00 Caracas
    const validUntil = getQuoteValidUntil(createdAt);
    assert.equal(formatCaracasIsoDate(validUntil), "2026-12-04");

    // 04/12 23:00 Caracas (05/12 03:00 UTC) sigue vigente
    assert.equal(
      isQuoteExpired(createdAt, new Date("2026-12-05T03:00:00.000Z")),
      false
    );
    // 05/12 00:00 Caracas (05/12 04:00 UTC) expiró
    assert.equal(
      isQuoteExpired(createdAt, new Date("2026-12-05T04:00:00.000Z")),
      true
    );
  });
});
