"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

// Selector desplegable accesible con soporte para error y estado deshabilitado
export function Select({
  label,
  hint,
  error,
  options,
  placeholder,
  id,
  disabled,
  className,
  ...props
}: SelectProps) {
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={fieldId} className="block text-xs font-medium text-[var(--ps-text)]">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={fieldId}
          disabled={disabled}
          aria-invalid={Boolean(error) || undefined}
          className={cn(
            "min-h-11 w-full appearance-none rounded-[var(--ps-radius-md)] px-3.5 pr-10 text-sm transition focus:outline-none",
            disabled
              ? "cursor-not-allowed bg-[var(--ps-muted-bg)] text-[var(--ps-muted-text)] border border-[var(--ps-muted-border)] opacity-75"
              : error
                ? "border border-[var(--ps-danger-text)] bg-[var(--ps-danger-bg)]/40 text-[var(--ps-text)] focus:bg-white focus:ring-3 focus:ring-[var(--ps-danger-border)]"
                : "ps-inset cursor-pointer text-[var(--ps-text)] focus:bg-white focus:ring-3 focus:ring-[var(--ps-teal-soft)] focus:outline-1 focus:outline-[var(--ps-teal-700)]",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ps-text-secondary)]"
        />
      </div>
      {error ? (
        <p className="text-xs font-medium text-[var(--ps-danger-text)]">{error}</p>
      ) : (
        hint && <p className="text-xs text-[var(--ps-text-secondary)]">{hint}</p>
      )}
    </div>
  );
}

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  label?: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<SegmentedOption<T>>;
  disabled?: boolean;
  className?: string;
}

// Control segmentado estilo Apple sobre riel hundido
export function SegmentedControl<T extends string>({
  label,
  value,
  onChange,
  options,
  disabled = false,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <span className="block text-xs font-medium text-[var(--ps-text)]">{label}</span>}
      <div
        role="radiogroup"
        aria-label={label}
        className={cn(
          "ps-inset grid rounded-[var(--ps-radius-md)] p-1",
          disabled && "opacity-65"
        )}
        style={{ gridTemplateColumns: `repeat(${Math.max(1, options.length)}, minmax(0, 1fr))` }}
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => onChange(opt.value)}
              className={cn(
                "min-h-9 rounded-[var(--ps-radius-sm)] px-3 py-1.5 text-center text-xs transition sm:text-sm",
                disabled ? "cursor-not-allowed" : "cursor-pointer",
                active
                  ? "ps-layer-1 font-semibold text-[var(--ps-teal-800)]"
                  : "font-medium text-[var(--ps-text-secondary)] hover:text-[var(--ps-text)]"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
