"use client";

import * as React from "react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/src/lib/cn";
import { Button } from "./button";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const MODAL_SIZES = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

// Modal flotante centrado (Capa 3) con cierre por Escape y clic externo
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: ModalProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f1d24]/45 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className={cn(
          "ps-layer-modal w-full rounded-[var(--ps-radius-xl)] bg-white/95 p-5 backdrop-blur-xl sm:p-6",
          MODAL_SIZES[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[var(--ps-text)] sm:text-lg">{title}</h2>
            {description && (
              <p className="mt-1 text-xs leading-relaxed text-[var(--ps-text-secondary)] sm:text-sm">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="ps-pressable flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/80 text-[var(--ps-text-secondary)] hover:bg-white hover:text-[var(--ps-text)]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4">{children}</div>

        {footer && (
          <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5 border-t border-[var(--ps-border)] pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

// Hoja inferior estilo iOS en móvil y panel centrado en escritorio (Capa 3)
export function BottomSheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: BottomSheetProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#0f1d24]/45 sm:items-center sm:p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="ps-layer-modal max-h-[88vh] w-full overflow-y-auto rounded-t-[var(--ps-radius-xl)] bg-white/95 px-5 pb-6 pt-3 backdrop-blur-xl sm:max-w-lg sm:rounded-[var(--ps-radius-xl)] sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[var(--ps-muted-border)] sm:hidden" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[var(--ps-text)] sm:text-lg">{title}</h2>
            {description && (
              <p className="mt-1 text-xs leading-relaxed text-[var(--ps-text-secondary)] sm:text-sm">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar panel"
            className="ps-pressable flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/80 text-[var(--ps-text-secondary)] hover:bg-white hover:text-[var(--ps-text)]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4">{children}</div>

        {footer && (
          <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5 border-t border-[var(--ps-border)] pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  loading?: boolean;
}

// Diálogo de confirmación obligatoria previo a acciones críticas o destructivas
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            loading={loading}
            loadingText="Aplicando…"
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
            variant === "danger"
              ? "bg-[var(--ps-danger-bg)] text-[var(--ps-danger-text)]"
              : "bg-[var(--ps-green-soft)] text-[var(--ps-green-800)]"
          )}
        >
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="text-sm leading-relaxed text-[var(--ps-text-secondary)]">{description}</p>
      </div>
    </Modal>
  );
}
