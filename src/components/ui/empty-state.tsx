import * as React from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/src/lib/cn";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

// Estado vacío estructurado sin texto plano para listados y búsquedas
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "ps-inset flex flex-col items-center justify-center rounded-[var(--ps-radius-xl)] px-6 py-10 text-center",
        className
      )}
    >
      <div className="ps-layer-1 flex h-12 w-12 items-center justify-center rounded-2xl text-[var(--ps-teal-700)]">
        {icon ?? <Inbox className="h-6 w-6" aria-hidden="true" />}
      </div>
      <h4 className="mt-3.5 text-sm font-semibold text-[var(--ps-text)] sm:text-base">{title}</h4>
      {description && (
        <p className="mt-1 max-w-md text-xs leading-relaxed text-[var(--ps-text-secondary)] sm:text-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
