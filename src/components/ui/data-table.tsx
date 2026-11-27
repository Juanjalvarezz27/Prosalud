import * as React from "react";
import { cn } from "@/src/lib/cn";
import { EmptyState } from "./empty-state";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  headerClassName?: string;
  cellClassName?: string;
  render: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Array<DataTableColumn<T>>;
  keyExtractor: (row: T) => string;
  renderMobileCard?: (row: T) => React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  className?: string;
}

const ALIGN_CLASSES = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

// Tabla responsive: vista tabular en escritorio y tarjetas táctiles en móvil
export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  renderMobileCard,
  emptyTitle = "No hay registros disponibles",
  emptyDescription = "Ajusta los filtros o crea un nuevo registro para empezar.",
  emptyAction,
  className,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        className={className}
      />
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Tabla agrupada para escritorio */}
      <div className="hidden overflow-x-auto rounded-[var(--ps-radius-lg)] border border-[var(--ps-border)] bg-white md:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-[var(--ps-surface-subtle)] text-xs font-semibold text-[var(--ps-text-secondary)]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    "px-4 py-3 whitespace-nowrap",
                    ALIGN_CLASSES[col.align ?? "left"],
                    col.headerClassName
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--ps-border)]">
            {data.map((row) => (
              <tr
                key={keyExtractor(row)}
                className="transition-colors hover:bg-[var(--ps-surface-subtle)]"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-3 text-[var(--ps-text)]",
                      ALIGN_CLASSES[col.align ?? "left"],
                      col.cellClassName
                    )}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tarjetas apiladas para móvil */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {data.map((row) => (
          <div
            key={keyExtractor(row)}
            className="ps-layer-1 rounded-[var(--ps-radius-lg)] p-4"
          >
            {renderMobileCard ? (
              renderMobileCard(row)
            ) : (
              <dl className="space-y-2 text-xs">
                {columns.map((col) => (
                  <div key={col.key} className="flex items-start justify-between gap-3">
                    <dt className="font-medium text-[var(--ps-text-secondary)]">{col.header}</dt>
                    <dd className="text-right font-medium text-[var(--ps-text)]">
                      {col.render(row)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
