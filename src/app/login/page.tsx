import * as React from "react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { SkeletonForm } from "@/src/components/ui";
import { LoginForm } from "@/src/components/auth/login-form";
import { getCurrentUser } from "@/src/lib/auth/current-user";

async function LoginGate() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }
  return <LoginForm />;
}

// Pantalla de inicio de sesión adaptada a móvil y escritorio
export default function LoginPage() {
  return (
    <main className="ps-canvas flex min-h-dvh flex-col items-center justify-center px-4 py-8 sm:px-6">
      <div className="ps-layer-2 w-full max-w-md rounded-[var(--ps-radius-xl)] p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/logo.png"
            alt="ProSalud Servicios Integrales"
            width={634}
            height={184}
            className="h-auto w-56 max-w-full object-contain sm:w-64"
            priority
          />
          <h1 className="sr-only">Iniciar sesión en ProSalud</h1>
          <p className="mt-4 text-xs font-medium text-[var(--ps-text-secondary)] sm:text-sm">
            Sistema administrativo, cotizaciones y cobranza
          </p>
        </div>

        <div className="mt-6">
          <React.Suspense fallback={<SkeletonForm fields={2} />}>
            <LoginGate />
          </React.Suspense>
        </div>

        <p className="mt-6 text-center text-[11px] text-[var(--ps-text-muted)]">
          Acceso privado · ProSalud Servicios Integrales, C.A.
        </p>
      </div>
    </main>
  );
}
