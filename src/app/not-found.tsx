import Link from "next/link";
import { Compass } from "lucide-react";
import { AppShell } from "@/src/components/layout/app-shell";
import { Card, EmptyState } from "@/src/components/ui";

// Página de respaldo en español para rutas aún no implementadas o inexistentes
export default function NotFound() {
  return (
    <AppShell
      title="Ruta en preparación"
      subtitle="Este módulo pertenece a una fase posterior del roadmap"
    >
      <Card layer={1} padding="lg">
        <EmptyState
          icon={<Compass className="h-6 w-6" aria-hidden="true" />}
          title="Esta sección aún no está habilitada"
          description="La navegación ya está conectada. Este módulo se construirá en su fase correspondiente."
          action={
            <Link
              href="/"
              className="ps-pressable inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--ps-green-700)] px-5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--ps-green-800)]"
            >
              Volver al inicio
            </Link>
          }
        />
      </Card>
    </AppShell>
  );
}
