import * as React from "react";
import { cn } from "@/src/lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

// Campo de texto con superficie hundida y estados foco/error/deshabilitado
export function Input({
  label,
  hint,
  error,
  leftIcon,
  rightSlot,
  id,
  disabled,
  className,
  ...props
}: InputProps) {
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={fieldId} className="block text-xs font-medium text-[var(--ps-text)]">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3.5 text-[var(--ps-text-secondary)]">
            {leftIcon}
          </span>
        )}
        <input
          id={fieldId}
          disabled={disabled}
          aria-invalid={Boolean(error) || undefined}
          className={cn(
            "min-h-11 w-full rounded-[var(--ps-radius-md)] px-3.5 text-sm transition focus:outline-none",
            leftIcon ? "pl-10" : "",
            rightSlot ? "pr-11" : "",
            disabled
              ? "cursor-not-allowed bg-[var(--ps-muted-bg)] text-[var(--ps-muted-text)] border border-[var(--ps-muted-border)] opacity-75"
              : error
                ? "border border-[var(--ps-danger-text)] bg-[var(--ps-danger-bg)]/40 text-[var(--ps-text)] focus:bg-white focus:ring-3 focus:ring-[var(--ps-danger-border)]"
                : "ps-inset text-[var(--ps-text)] placeholder:text-[var(--ps-text-secondary)]/75 focus:bg-white focus:ring-3 focus:ring-[var(--ps-teal-soft)] focus:outline-1 focus:outline-[var(--ps-teal-700)]",
            className
          )}
          {...props}
        />
        {rightSlot && <div className="absolute right-2.5 flex items-center">{rightSlot}</div>}
      </div>
      {error ? (
        <p className="text-xs font-medium text-[var(--ps-danger-text)]">{error}</p>
      ) : (
        hint && <p className="text-xs text-[var(--ps-text-secondary)]">{hint}</p>
      )}
    </div>
  );
}

// Área de texto multilínea coherente con la paleta y validación en español
export function Textarea({
  label,
  hint,
  error,
  id,
  disabled,
  className,
  rows = 3,
  ...props
}: TextareaProps) {
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={fieldId} className="block text-xs font-medium text-[var(--ps-text)]">
          {label}
        </label>
      )}
      <textarea
        id={fieldId}
        rows={rows}
        disabled={disabled}
        aria-invalid={Boolean(error) || undefined}
        className={cn(
          "w-full rounded-[var(--ps-radius-md)] px-3.5 py-2.5 text-sm transition focus:outline-none",
          disabled
            ? "cursor-not-allowed bg-[var(--ps-muted-bg)] text-[var(--ps-muted-text)] border border-[var(--ps-muted-border)] opacity-75"
            : error
              ? "border border-[var(--ps-danger-text)] bg-[var(--ps-danger-bg)]/40 text-[var(--ps-text)] focus:bg-white focus:ring-3 focus:ring-[var(--ps-danger-border)]"
              : "ps-inset text-[var(--ps-text)] placeholder:text-[var(--ps-text-secondary)]/75 focus:bg-white focus:ring-3 focus:ring-[var(--ps-teal-soft)] focus:outline-1 focus:outline-[var(--ps-teal-700)]",
          className
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs font-medium text-[var(--ps-danger-text)]">{error}</p>
      ) : (
        hint && <p className="text-xs text-[var(--ps-text-secondary)]">{hint}</p>
      )}
    </div>
  );
}
