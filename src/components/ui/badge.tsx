import * as React from "react";
import { AlertTriangle, CheckCircle2, Clock, MinusCircle, XCircle } from "lucide-react";
import { cn } from "@/src/lib/cn";

export type BadgeVariant = "success" | "info" | "warning" | "danger" | "neutral";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  hideDefaultIcon?: boolean;
}

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  success: "border-[var(--ps-green-border)] bg-[var(--ps-green-soft)] text-[var(--ps-green-800)]",
  info: "border-[var(--ps-teal-border)] bg-[var(--ps-teal-soft)] text-[var(--ps-teal-800)]",
  warning: "border-[var(--ps-warn-border)] bg-[var(--ps-warn-bg)] text-[var(--ps-warn-text)]",
  danger: "border-[var(--ps-danger-border)] bg-[var(--ps-danger-bg)] text-[var(--ps-danger-text)]",
  neutral: "border-[var(--ps-muted-border)] bg-[var(--ps-muted-bg)] text-[var(--ps-muted-text)]",
};

const DEFAULT_ICONS: Record<BadgeVariant, React.ReactNode> = {
  success: <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />,
  info: <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />,
  warning: <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />,
  danger: <XCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />,
  neutral: <MinusCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />,
};

// Insignia de estado con ícono + texto obligatorio según Anexo B.2
export function Badge({
  variant = "neutral",
  icon,
  hideDefaultIcon = false,
  className,
  children,
  ...props
}: BadgeProps) {
  const resolvedIcon = icon ?? (hideDefaultIcon ? null : DEFAULT_ICONS[variant]);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap",
        BADGE_CLASSES[variant],
        className
      )}
      {...props}
    >
      {resolvedIcon}
      <span>{children}</span>
    </span>
  );
}
