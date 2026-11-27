// Convención transversal de paginación real en el servidor (sección 5.6)

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export type SortOrder = "asc" | "desc";

export type RawSearchParams =
  | URLSearchParams
  | Record<string, string | string[] | undefined>;

export interface PaginationParams {
  page: number;
  pageSize: number;
  q: string;
  sort?: string;
  order: SortOrder;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface ParsePaginationOptions {
  defaultPageSize?: number;
  maxPageSize?: number;
  defaultSort?: string;
  defaultOrder?: SortOrder;
  allowedSorts?: readonly string[];
}

function getParam(
  params: RawSearchParams | undefined,
  key: string
): string | undefined {
  if (!params) return undefined;
  if (params instanceof URLSearchParams) {
    return params.get(key) ?? undefined;
  }
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return parsed;
}

// Normaliza parámetros de paginación, búsqueda y orden en servidor
export function parsePaginationParams(
  searchParams?: RawSearchParams,
  options: ParsePaginationOptions = {}
): PaginationParams {
  const maxPageSize = Math.min(
    options.maxPageSize ?? MAX_PAGE_SIZE,
    MAX_PAGE_SIZE
  );
  const defaultPageSize = Math.min(
    options.defaultPageSize ?? DEFAULT_PAGE_SIZE,
    maxPageSize
  );

  const page = parsePositiveInt(getParam(searchParams, "page"), DEFAULT_PAGE);
  const requestedPageSize = parsePositiveInt(
    getParam(searchParams, "pageSize"),
    defaultPageSize
  );
  const pageSize = Math.min(Math.max(1, requestedPageSize), maxPageSize);

  const q = (getParam(searchParams, "q") ?? "").trim();

  const rawSort = getParam(searchParams, "sort")?.trim();
  const sort =
    rawSort &&
    (!options.allowedSorts || options.allowedSorts.includes(rawSort))
      ? rawSort
      : options.defaultSort;

  const rawOrder = getParam(searchParams, "order")?.toLowerCase();
  const order: SortOrder =
    rawOrder === "asc" || rawOrder === "desc"
      ? rawOrder
      : options.defaultOrder ?? "desc";

  return { page, pageSize, q, sort, order };
}

// Traduce parámetros normalizados a skip/take para Prisma
export function getPrismaPagination(
  params: Pick<PaginationParams, "page" | "pageSize">
): { skip: number; take: number } {
  const safePage = Math.max(1, params.page);
  const safePageSize = Math.min(Math.max(1, params.pageSize), MAX_PAGE_SIZE);
  return {
    skip: (safePage - 1) * safePageSize,
    take: safePageSize,
  };
}

// Construye la respuesta paginada estándar con metadatos consistentes
export function buildPaginatedResult<T>(params: {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}): PaginatedResult<T> {
  const safeTotal = Math.max(0, params.total);
  const safePageSize = Math.min(Math.max(1, params.pageSize), MAX_PAGE_SIZE);
  const totalPages = safeTotal === 0 ? 0 : Math.ceil(safeTotal / safePageSize);
  const safePage =
    totalPages === 0 ? 1 : Math.min(Math.max(1, params.page), totalPages);

  return {
    items: params.items,
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      total: safeTotal,
      totalPages,
      hasNextPage: totalPages > 0 && safePage < totalPages,
      hasPrevPage: totalPages > 0 && safePage > 1,
    },
  };
}

// Actualiza URLSearchParams preservando filtros activos y limpiando valores vacíos
export function buildPaginationQueryString(
  current: URLSearchParams | string,
  updates: Record<string, string | number | null | undefined>,
  options: { resetPageOnFilterChange?: boolean } = {}
): string {
  const next = new URLSearchParams(
    typeof current === "string" ? current : current.toString()
  );
  const shouldResetPage =
    options.resetPageOnFilterChange !== false && !("page" in updates);

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === null || value === "") {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
  }

  if (shouldResetPage) {
    next.set("page", "1");
  } else if (next.get("page") === "1") {
    next.delete("page");
  }

  return next.toString();
}
