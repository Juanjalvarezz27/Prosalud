import * as React from "react";
import { cn } from "@/src/lib/cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: "sm" | "md" | "lg" | "full";
}

const ROUNDED_CLASSES = {
  sm: "rounded-md",
  md: "rounded-[var(--ps-radius-sm)]",
  lg: "rounded-[var(--ps-radius-md)]",
  full: "rounded-full",
};

// Bloque base de carga con animación shimmer (sin spinners)
export function Skeleton({ rounded = "full", className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("ps-skeleton", ROUNDED_CLASSES[rounded], className)}
      {...props}
    />
  );
}

// Líneas de texto simuladas con anchos escalonados
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div aria-hidden="true" className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton
          key={idx}
          className={cn("h-3.5", idx === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

// Tarjeta genérica de carga imitando contenido real
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("ps-layer-1 rounded-[var(--ps-radius-xl)] p-4 sm:p-5 space-y-3", className)}
    >
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <SkeletonText lines={2} />
    </div>
  );
}

// Indicador/KPI en carga para paneles de métricas
export function SkeletonStat({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("ps-layer-1 rounded-[var(--ps-radius-lg)] p-5 space-y-2.5", className)}
    >
      <Skeleton className="h-3.5 w-28" />
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
}

// Fila de tabla en carga para escritorios
export function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
  return (
    <tr aria-hidden="true" className="border-t border-[var(--ps-border)]">
      {Array.from({ length: columns }).map((_, idx) => (
        <td key={idx} className="px-4 py-3.5">
          <Skeleton className={cn("h-4", idx === 0 ? "w-24" : idx === columns - 1 ? "ml-auto w-20" : "w-full max-w-[180px]")} />
        </td>
      ))}
    </tr>
  );
}

// Listado completo en carga (tabla en escritorio y tarjetas en móvil)
export function SkeletonTable({
  rows = 4,
  columns = 4,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div aria-busy="true" aria-label="Cargando listado" className={className}>
      <div className="hidden overflow-hidden rounded-[var(--ps-radius-lg)] border border-[var(--ps-border)] bg-white md:block">
        <table className="w-full border-collapse">
          <thead className="bg-[var(--ps-surface-subtle)]">
            <tr>
              {Array.from({ length: columns }).map((_, idx) => (
                <th key={idx} className="px-4 py-3 text-left">
                  <Skeleton className="h-3.5 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, idx) => (
              <SkeletonTableRow key={idx} columns={columns} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {Array.from({ length: Math.min(rows, 3) }).map((_, idx) => (
          <SkeletonCard key={idx} />
        ))}
      </div>
    </div>
  );
}

// Formulario en carga (campos y botón de envío)
export function SkeletonForm({ fields = 3, className }: { fields?: number; className?: string }) {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando formulario"
      className={cn("ps-layer-1 rounded-[var(--ps-radius-xl)] p-5 space-y-4", className)}
    >
      {Array.from({ length: fields }).map((_, idx) => (
        <div key={idx} className="space-y-1.5">
          <Skeleton className="h-3 w-28" />
          <Skeleton rounded="lg" className="h-11 w-full" />
        </div>
      ))}
      <div className="flex justify-end pt-2">
        <Skeleton className="h-11 w-36" />
      </div>
    </div>
  );
}

// Gráfico de barras simulado para estadísticas
export function SkeletonChart({ className }: { className?: string }) {
  const heights = ["h-16", "h-28", "h-20", "h-36", "h-24", "h-32"];
  return (
    <div
      aria-busy="true"
      aria-label="Cargando gráfico"
      className={cn("ps-layer-1 rounded-[var(--ps-radius-xl)] p-5 space-y-4", className)}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex h-40 items-end justify-between gap-3 pt-2">
        {heights.map((height, idx) => (
          <Skeleton key={idx} rounded="md" className={cn("flex-1", height)} />
        ))}
      </div>
    </div>
  );
}
