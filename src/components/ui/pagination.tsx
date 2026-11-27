"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/src/lib/cn";
import {
  buildPaginationQueryString,
  type PaginationMeta,
} from "@/src/lib/pagination";
import { formatNumberVe } from "@/src/lib/format";
import { Button } from "./button";

export interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange?: (page: number) => void;
  className?: string;
  itemLabel?: string;
}

// Calcula qué números de página mostrar en escritorio (con elipsis)
function getVisiblePages(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, idx) => idx + 1);
  }

  const pages: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push("ellipsis");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push("ellipsis");

  pages.push(total);
  return pages;
}

// Paginación real sincronizada con la URL (y opcionalmente controlada por callback)
export function Pagination({
  pagination,
  onPageChange,
  className,
  itemLabel = "registros",
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { page, pageSize, total, totalPages, hasNextPage, hasPrevPage } =
    pagination;

  if (total === 0 || totalPages <= 1) {
    return null;
  }

  const startRecord = (page - 1) * pageSize + 1;
  const endRecord = Math.min(page * pageSize, total);
  const visiblePages = getVisiblePages(page, totalPages);

  function goToPage(targetPage: number) {
    if (targetPage < 1 || targetPage > totalPages || targetPage === page) return;

    if (onPageChange) {
      onPageChange(targetPage);
      return;
    }

    const qs = buildPaginationQueryString(
      searchParams,
      { page: targetPage },
      { resetPageOnFilterChange: false }
    );
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <nav
      aria-label="Paginación"
      className={cn(
        "flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <p className="text-center text-xs text-[var(--ps-text-secondary)] sm:text-left tabular-nums">
        Mostrando{" "}
        <span className="font-semibold text-[var(--ps-text)]">
          {formatNumberVe(startRecord, 0)}–{formatNumberVe(endRecord, 0)}
        </span>{" "}
        de{" "}
        <span className="font-semibold text-[var(--ps-text)]">
          {formatNumberVe(total, 0)}
        </span>{" "}
        {itemLabel}
      </p>

      {/* Controles táctiles para móvil */}
      <div className="flex items-center justify-between gap-2 sm:hidden">
        <Button
          variant="outline"
          size="md"
          disabled={!hasPrevPage}
          onClick={() => goToPage(page - 1)}
          aria-label="Página anterior"
          className="flex-1"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Anterior
        </Button>
        <span className="px-2 text-xs font-medium text-[var(--ps-text-secondary)] tabular-nums whitespace-nowrap">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="md"
          disabled={!hasNextPage}
          onClick={() => goToPage(page + 1)}
          aria-label="Página siguiente"
          className="flex-1"
        >
          Siguiente
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      {/* Controles completos para tablet y escritorio */}
      <div className="hidden items-center gap-1.5 sm:flex">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPrevPage}
          onClick={() => goToPage(page - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Anterior
        </Button>

        {visiblePages.map((entry, index) =>
          entry === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-xs text-[var(--ps-text-muted)]"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              onClick={() => goToPage(entry)}
              aria-current={entry === page ? "page" : undefined}
              className={cn(
                "min-h-9 min-w-9 rounded-full px-3 text-xs font-semibold transition tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ps-teal-700)]",
                entry === page
                  ? "bg-[var(--ps-teal-700)] text-white shadow-xs"
                  : "border border-[var(--ps-border)] bg-white text-[var(--ps-text)] hover:bg-[var(--ps-surface-subtle)]"
              )}
            >
              {entry}
            </button>
          )
        )}

        <Button
          variant="outline"
          size="sm"
          disabled={!hasNextPage}
          onClick={() => goToPage(page + 1)}
          aria-label="Página siguiente"
        >
          Siguiente
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
