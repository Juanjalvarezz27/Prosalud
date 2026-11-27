import * as React from "react";
import { AppShell } from "@/src/components/layout/app-shell";
import { AccessDenied } from "@/src/components/auth/access-denied";
import { Card, CardDescription, CardHeader, CardTitle, SkeletonTable } from "@/src/components/ui";
import { checkPagePermission } from "@/src/lib/auth/current-user";

async function AuthorizedUsersPage() {
  const { user, allowed, deniedMessage } = await checkPagePermission(
    "/usuarios",
    "users:manage"
  );

  return (
    <AppShell
      title="Usuarios y Roles"
      subtitle="Administración de accesos del sistema (R12)"
      userName={user.name}
      userRole={user.role === "ADMIN" ? "admin" : "trabajador"}
    >
      {!allowed ? (
        <AccessDenied message={deniedMessage} />
      ) : (
        <Card layer={1} padding="lg">
          <CardHeader>
            <CardTitle>Gestión de usuarios habilitada para administrador</CardTitle>
            <CardDescription>
              El control de permisos ya está activo en el servidor. En las siguientes subfases (1.6 y 1.7) verás aquí el listado paginado y la creación/edición de usuarios.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </AppShell>
  );
}

// Ruta protegida por rol ADMIN en servidor (1.5)
export default function UsuariosPage() {
  return (
    <React.Suspense
      fallback={
        <div className="ps-canvas min-h-screen w-full p-4 sm:p-6">
          <SkeletonTable rows={4} columns={4} />
        </div>
      }
    >
      <AuthorizedUsersPage />
    </React.Suspense>
  );
}
