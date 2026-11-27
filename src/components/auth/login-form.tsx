"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button, Input } from "@/src/components/ui";
import { notify } from "@/src/lib/notify";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

// Formulario de acceso con validaciones en español y notificaciones Sonner
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});

  function validate(): boolean {
    const nextErrors: { email?: string; password?: string } = {};
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
      nextErrors.email = "Ingresa un correo electrónico válido.";
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) {
      notify.warning("Revisa los campos marcados antes de ingresar.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          next: nextPath,
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        error?: string;
        field?: "email" | "password";
        redirectTo?: string;
        user?: { name: string };
      } | null;

      if (!response.ok) {
        const message =
          data?.error ?? "No pudimos validar tus credenciales. Intenta de nuevo.";
        if (data?.field) {
          setErrors({ [data.field]: message });
        }
        notify.error(message);
        return;
      }

      notify.success(
        data?.user?.name ? `Bienvenido, ${data.user.name}` : "Sesión iniciada"
      );
      router.replace(data?.redirectTo ?? "/");
      router.refresh();
    } catch {
      notify.error("Error de conexión. Verifica tu internet e intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Input
        label="Correo electrónico"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="usuario@prosalud.local"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
        }}
        error={errors.email}
        disabled={submitting}
        leftIcon={<Mail className="h-4 w-4" aria-hidden="true" />}
      />

      <Input
        label="Contraseña"
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        placeholder="Mínimo 8 caracteres"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
        }}
        error={errors.password}
        disabled={submitting}
        leftIcon={<Lock className="h-4 w-4" aria-hidden="true" />}
        rightSlot={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
            className="rounded-full p-1 text-[var(--ps-text-secondary)] hover:text-[var(--ps-text)] focus-visible:outline-2 focus-visible:outline-[var(--ps-teal-700)]"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        }
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={submitting}
        loadingText="Ingresando…"
        className="mt-2 w-full"
      >
        Iniciar sesión
      </Button>
    </form>
  );
}
