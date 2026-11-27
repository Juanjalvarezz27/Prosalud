import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/src/components/layout/app-shell";
import { SkeletonCard, SkeletonTable } from "@/src/components/ui";
import { DesignSystemOverview } from "@/src/components/ui/design-system-overview";
import { ShowcaseDemo } from "@/src/components/ui/showcase-demo";
import { AccessDenied } from "@/src/components/auth/access-denied";
import { checkPagePermission } from "@/src/lib/auth/current-user";

async function AuthenticatedGaleria() {
  const { user, allowed } = await checkPagePermission("/galeria", "users:manage");

  return (
    <AppShell
      title="Galería de Componentes"
      subtitle="Referencia viva de UI, skeletons, notificaciones Sonner, paginación y formatos"
      badgeText="Fase 0"
      userName={user.name}
      userRole={user.role === "ADMIN" ? "admin" : "trabajador"}
      headerActions={
        <Link
          href="/"
          className="ps-pressable inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--ps-border)] bg-white px-4 text-xs font-semibold text-[var(--ps-text)] shadow-xs hover:bg-[var(--ps-surface-subtle)] sm:text-sm"
        >
          Volver al panel
        </Link>
      }
    >
      {!allowed ? (
        <AccessDenied message="Solo el administrador puede acceder a la galería interna de componentes." />
      ) : (
        <>
          <DesignSystemOverview />
          <ShowcaseDemo />
        </>
      )}
    </AppShell>
  );
}

// Galería interna protegida de componentes, tipografía, skeletons y paginación
export default function GaleriaPage() {
  return (
    <React.Suspense
      fallback={
        <div className="ps-canvas min-h-screen w-full space-y-4 p-4 sm:p-6">
          <SkeletonCard />
          <SkeletonTable rows={3} columns={4} />
        </div>
      }
    >
      <AuthenticatedGaleria />
    </React.Suspense>
  );
}
