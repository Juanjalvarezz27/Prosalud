import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildPaginatedResult,
  buildPaginationQueryString,
  DEFAULT_PAGE_SIZE,
  getPrismaPagination,
  MAX_PAGE_SIZE,
  parsePaginationParams,
} from "../src/lib/pagination.ts";

describe("Paginación real en servidor (5.6)", () => {
  it("aplica límites y valores por defecto seguros", () => {
    const params = parsePaginationParams({
      page: "-3",
      pageSize: "9999",
      q: "  glucosa  ",
      sort: "malicious",
      order: "ASC",
    }, {
      allowedSorts: ["descripcion", "createdAt"],
      defaultSort: "descripcion",
    });

    assert.equal(params.page, 1);
    assert.equal(params.pageSize, MAX_PAGE_SIZE);
    assert.equal(params.q, "glucosa");
    assert.equal(params.sort, "descripcion");
    assert.equal(params.order, "asc");
  });

  it("calcula skip/take y metadatos de paginación correctamente", () => {
    const params = parsePaginationParams(new URLSearchParams("page=3&pageSize=25"));
    assert.deepEqual(getPrismaPagination(params), { skip: 50, take: 25 });

    const res = buildPaginatedResult({
      items: ["a", "b"],
      total: 52,
      page: 3,
      pageSize: 25,
    });
    assert.deepEqual(res.pagination, {
      page: 3,
      pageSize: 25,
      total: 52,
      totalPages: 3,
      hasNextPage: false,
      hasPrevPage: true,
    });

    const empty = buildPaginatedResult({
      items: [],
      total: 0,
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
    });
    assert.equal(empty.pagination.totalPages, 0);
    assert.equal(empty.pagination.hasNextPage, false);
    assert.equal(empty.pagination.hasPrevPage, false);
  });

  it("construye query string preservando filtros y reseteando página al filtrar", () => {
    const qs1 = buildPaginationQueryString("page=4&categoria=WIENER", {
      q: "acido",
    });
    assert.equal(qs1, "page=1&categoria=WIENER&q=acido");

    const qs2 = buildPaginationQueryString("page=1&q=acido", { page: 2 });
    assert.equal(qs2, "page=2&q=acido");
  });
});
