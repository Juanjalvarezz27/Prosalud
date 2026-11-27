import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/src/components/layout/app-shell";
import {
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  SkeletonCard,
  SkeletonStat,
} from "@/src/components/ui";
import { requireUser } from "@/src/lib/auth/current-user";

async function AuthenticatedHome() {
  const user = await requireUser("/");
  const roleLabel = user.role === "ADMIN" ? "Administrador" : "Trabajador";

  return (
    <AppShell
      title="Panel Principal"
      subtitle={`Sesión activa: ${user.name} · ${roleLabel}`}
      userName={user.name}
      userRole={user.role === "ADMIN" ? "admin" : "trabajador"}
      headerActions={
        <Link
          href="/galeria"
          className="ps-pressable inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--ps-border)] bg-white px-4 text-xs font-semibold text-[var(--ps-text)] shadow-xs hover:bg-[var(--ps-surface-subtle)] sm:text-sm"
        >
          Componentes
        </Link>
      }
    >
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card layer={2} padding="lg" className="lg:col-span-8">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>Bienvenido, {user.name}</CardTitle>
              <Badge variant={user.role === "ADMIN" ? "success" : "info"}>
                {roleLabel}
              </Badge>
            </div>
            <CardDescription>
              Sistema operativo privado de ProSalud Servicios Integrales, C.A.
              A medida que avancemos en las siguientes fases verás aquí la tasa BCV real,
              cotizaciones, notas de entrega y alertas de cobro.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card layer={1} padding="lg" className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Acceso y seguridad</CardTitle>
            <CardDescription>
              Tu sesión está protegida con cookie HttpOnly firmada y verificación de usuario activo en servidor.
            </CardDescription>
          </CardHeader>
          <p className="mt-3 text-xs text-[var(--ps-text-secondary)]">
            Correo: <span className="font-medium text-[var(--ps-text)]">{user.email}</span>
          </p>
        </Card>
      </section>
    </AppShell>
  );
}

function HomeSkeleton() {
  return (
    <div className="ps-canvas min-h-screen w-full p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <SkeletonStat />
        </div>
        <div className="lg:col-span-4">
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}

// Panel principal autenticado (sin sesión redirige a /login)
export default function Home() {
  return (
    <React.Suspense fallback={<HomeSkeleton />}>
      <AuthenticatedHome />
    </React.Suspense>
  );
}
