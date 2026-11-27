"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Card, EmptyState } from "@/src/components/ui";
import { notify } from "@/src/lib/notify";

export interface AccessDeniedProps {
  message?: string;
}

// Vista de rechazo en servidor con notificación Sonner clara cuando un rol no tiene permiso
export function AccessDenied({
  message = "No tienes permiso para acceder a esta sección.",
}: AccessDeniedProps) {
  const notifiedRef = React.useRef(false);

  React.useEffect(() => {
    if (notifiedRef.current) return;
    notifiedRef.current = true;
    notify.error(message);
  }, [message]);

  return (
    <Card layer={1} padding="lg">
      <EmptyState
        icon={<ShieldAlert className="h-6 w-6 text-[var(--ps-danger-text)]" aria-hidden="true" />}
        title="Acceso restringido"
        description={message}
        action={
          <Link
            href="/"
            className="ps-pressable inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--ps-teal-700)] px-5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--ps-teal-800)]"
          >
            Volver al panel
          </Link>
        }
      />
    </Card>
  );
}
