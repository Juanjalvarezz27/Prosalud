import Link from "next/link";
import { AppShell } from "@/src/components/layout/app-shell";
import { DesignSystemOverview } from "@/src/components/ui/design-system-overview";
import { ShowcaseDemo } from "@/src/components/ui/showcase-demo";

// Galería interna completa de componentes, tipografía, skeletons, notificaciones y paginación (0.8)
export default function GaleriaPage() {
  return (
    <AppShell
      title="Galería de Componentes"
      subtitle="Referencia viva de UI, skeletons, notificaciones Sonner, paginación y formatos"
      badgeText="Subfase 0.8"
      headerActions={
        <Link
          href="/"
          className="ps-pressable inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--ps-border)] bg-white px-4 text-xs font-semibold text-[var(--ps-text)] shadow-xs hover:bg-[var(--ps-surface-subtle)] sm:text-sm"
        >
          Volver al panel
        </Link>
      }
    >
      <DesignSystemOverview />
      <ShowcaseDemo />
    </AppShell>
  );
}
