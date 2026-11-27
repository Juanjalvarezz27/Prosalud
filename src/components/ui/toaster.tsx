"use client";

import { Toaster } from "sonner";

// Contenedor global de notificaciones Sonner con estilo Capa 3 y fuente Poppins
export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      visibleToasts={3}
      closeButton
      richColors
      toastOptions={{
        style: {
          fontFamily: "var(--font-poppins), ui-sans-serif, system-ui, sans-serif",
          borderRadius: "1rem",
          backdropFilter: "blur(20px) saturate(180%)",
          boxShadow:
            "0 8px 20px rgba(15, 29, 36, 0.08), 0 22px 48px -12px rgba(15, 29, 36, 0.16)",
        },
      }}
    />
  );
}
