import * as React from "react";
import { cn } from "@/src/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
  pill?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--ps-green-700)] text-white shadow-sm hover:bg-[var(--ps-green-800)] focus-visible:outline-[var(--ps-green-700)]",
  secondary:
    "bg-[var(--ps-teal-700)] text-white shadow-sm hover:bg-[var(--ps-teal-800)] focus-visible:outline-[var(--ps-teal-700)]",
  outline:
    "border border-[var(--ps-border)] bg-white text-[var(--ps-text)] shadow-xs hover:bg-[var(--ps-surface-subtle)] focus-visible:outline-[var(--ps-teal-700)]",
  ghost:
    "bg-transparent text-[var(--ps-text-secondary)] hover:bg-white/75 hover:text-[var(--ps-text)] focus-visible:outline-[var(--ps-teal-700)]",
  danger:
    "border border-[var(--ps-danger-border)] bg-[var(--ps-danger-bg)] text-[var(--ps-danger-text)] hover:bg-[#fbdada] focus-visible:outline-[var(--ps-danger-text)]",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3.5 text-xs",
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-6 text-base",
  icon: "h-11 w-11 p-0",
};

// Botón reutilizable con soporte táctil y estado de progreso sin spinner
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  loadingText = "Procesando…",
  pill = true,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const isDisabled = Boolean(disabled || loading);

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2",
        pill ? "rounded-full" : "rounded-[var(--ps-radius-md)]",
        SIZE_CLASSES[size],
        isDisabled
          ? "cursor-not-allowed bg-[var(--ps-muted-bg)] text-[var(--ps-muted-text)] border border-[var(--ps-muted-border)] opacity-75 shadow-none"
          : cn("ps-pressable cursor-pointer", VARIANT_CLASSES[variant]),
        className
      )}
      {...props}
    >
      {loading ? loadingText : children}
    </button>
  );
}
