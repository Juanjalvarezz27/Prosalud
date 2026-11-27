"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, Search, X } from "lucide-react";
import { APP_NAV_ITEMS } from "@/src/config/navigation";
import { cn } from "@/src/lib/cn";
import { notify } from "@/src/lib/notify";

export interface AppShellProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  headerActions?: React.ReactNode;
  showSearchPlaceholder?: boolean;
  bcvRateLabel?: string;
  bcvDateLabel?: string;
  userName?: string;
  userRole?: "admin" | "trabajador";
  children: React.ReactNode;
}

function isRouteActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Estructura responsive global: sidebar flotante en escritorio y navbar superior con menú hamburguesa en móvil
export function AppShell({
  title,
  subtitle,
  badgeText,
  headerActions,
  showSearchPlaceholder = false,
  bcvRateLabel = "40,00 Bs/$",
  bcvDateLabel = "27/11/2026",
  userName,
  userRole = "admin",
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      notify.success("Sesión cerrada");
      setMenuOpen(false);
      router.replace("/login");
      router.refresh();
    } catch {
      notify.error("No pudimos cerrar sesión. Intenta de nuevo.");
    } finally {
      setLoggingOut(false);
    }
  }

  const visibleItems = React.useMemo(
    () => APP_NAV_ITEMS.filter((item) => !item.adminOnly || userRole === "admin"),
    [userRole]
  );

  React.useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <div className="ps-canvas min-h-screen w-full overflow-x-hidden pb-6">
      <div className="flex min-h-screen w-full gap-5 p-3 sm:p-5">
        {/* Barra lateral flotante en escritorio (Capa 3 · Vidrio esmerilado) */}
        <aside className="ps-layer-3 sticky top-5 hidden h-[calc(100vh-2.5rem)] w-64 shrink-0 flex-col justify-between gap-3 rounded-[var(--ps-radius-xl)] p-3.5 lg:flex">
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-0.5">
            <Link
              href="/"
              className="ps-pressable flex items-center justify-center rounded-[var(--ps-radius-md)] border border-white bg-white/90 px-3 py-2.5 shadow-xs"
            >
              <Image
                src="/logo.png"
                alt="ProSalud Servicios Integrales"
                width={634}
                height={184}
                priority
                className="h-10 w-auto object-contain"
              />
            </Link>

            <div className="rounded-[var(--ps-radius-md)] border border-[var(--ps-border)] bg-white/75 px-3 py-2">
              <p className="truncate text-xs font-semibold text-[var(--ps-text)]">
                {userName ?? "Usuario"}
              </p>
              <p className="text-[11px] text-[var(--ps-text-secondary)]">
                {userRole === "admin" ? "Administrador" : "Trabajador"}
              </p>
            </div>

            <nav aria-label="Navegación principal" className="space-y-0.5">
              {visibleItems.map((item) => {
                const active = isRouteActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "ps-pressable flex items-center justify-between rounded-[var(--ps-radius-sm)] px-3 py-2 text-sm transition",
                      active
                        ? "bg-[var(--ps-teal-700)] font-semibold text-white shadow-sm"
                        : "font-medium text-[var(--ps-text-secondary)] hover:bg-white/80 hover:text-[var(--ps-text)]"
                    )}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {active && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--ps-green-brand)]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Indicador permanente de Tasa BCV + sesión en escritorio */}
          <div className="shrink-0 space-y-2">
            <div className="ps-layer-2 rounded-[var(--ps-radius-lg)] p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ps-text-secondary)]">
                  Tasa BCV
                </span>
                <span className="rounded-full bg-[var(--ps-green-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--ps-green-800)]">
                  Vigente
                </span>
              </div>
              <p className="mt-1 text-xl font-bold tracking-tight text-[var(--ps-text)] ps-tabular">
                {bcvRateLabel}
              </p>
              <p className="text-[11px] text-[var(--ps-text-secondary)]">
                Fecha valor: {bcvDateLabel}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="ps-pressable flex min-h-10 w-full cursor-pointer items-center justify-between rounded-[var(--ps-radius-md)] border border-[var(--ps-border)] bg-white/80 px-3.5 py-2 text-xs font-semibold text-[var(--ps-text-secondary)] hover:bg-[var(--ps-danger-bg)] hover:text-[var(--ps-danger-text)] disabled:opacity-60"
            >
              <span>{loggingOut ? "Saliendo…" : "Cerrar sesión"}</span>
              <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            </button>
          </div>
        </aside>

        {/* Área de contenido principal a ancho completo */}
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <header className="ps-layer-3 sticky top-3 z-20 flex flex-wrap items-center justify-between gap-3 rounded-[var(--ps-radius-lg)] px-3.5 py-2.5 sm:top-5 sm:px-6 sm:py-3">
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              {/* Botón hamburguesa arriba en móvil/tablet */}
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Abrir menú de navegación"
                aria-expanded={menuOpen}
                className="ps-pressable flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[var(--ps-radius-sm)] border border-[var(--ps-border)] bg-white text-[var(--ps-text)] shadow-xs hover:bg-[var(--ps-surface-subtle)] lg:hidden"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>

              <Link
                href="/"
                className="flex h-10 w-12 shrink-0 items-center justify-center rounded-[var(--ps-radius-sm)] bg-white p-1 shadow-xs lg:hidden"
              >
                <Image
                  src="/logo.png"
                  alt="Logo ProSalud"
                  width={634}
                  height={184}
                  priority
                  className="h-full w-auto object-contain"
                />
              </Link>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-base font-bold tracking-tight text-[var(--ps-text)] sm:text-xl">
                    {title}
                  </h1>
                  {badgeText && (
                    <span className="hidden rounded-full border border-[var(--ps-green-border)] bg-[var(--ps-green-soft)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--ps-green-800)] sm:inline-flex">
                      {badgeText}
                    </span>
                  )}
                </div>
                {subtitle && (
                  <p className="hidden truncate text-xs text-[var(--ps-text-secondary)] sm:block">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5">
              {showSearchPlaceholder && (
                <div className="ps-inset hidden items-center gap-2 rounded-full px-3.5 py-2 text-xs text-[var(--ps-text-secondary)] md:flex">
                  <Search className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>Buscar producto, cliente o nota…</span>
                </div>
              )}
              <div className="rounded-full border border-[var(--ps-teal-border)] bg-[var(--ps-teal-soft)] px-2.5 py-1.5 text-xs font-semibold text-[var(--ps-teal-800)] ps-tabular sm:px-3 lg:hidden">
                {bcvRateLabel}
              </div>
              {headerActions}
            </div>
          </header>

          <main className="flex min-w-0 flex-1 flex-col">
            <div
              key={pathname}
              className="ps-route-enter flex min-w-0 flex-1 flex-col gap-5"
            >
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Menú lateral desplegable (Drawer) para móvil y tablet */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 flex bg-[#0f1d24]/45 backdrop-blur-sm lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="ps-layer-modal flex h-full w-72 max-w-[84vw] flex-col justify-between rounded-r-[var(--ps-radius-xl)] bg-white/95 p-4 backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-5 overflow-y-auto">
              <div className="flex items-center justify-between gap-2">
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center"
                >
                  <div className="flex h-10 items-center justify-center rounded-[var(--ps-radius-sm)] border border-[var(--ps-border)] bg-white px-2.5 py-1">
                    <Image
                      src="/logo.png"
                      alt="ProSalud Servicios Integrales"
                      width={634}
                      height={184}
                      className="h-full w-auto object-contain"
                    />
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Cerrar menú"
                  className="ps-pressable flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[var(--ps-muted-bg)] text-[var(--ps-text-secondary)] hover:text-[var(--ps-text)]"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <nav aria-label="Menú móvil" className="space-y-1">
                {visibleItems.map((item) => {
                  const active = isRouteActive(pathname, item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "ps-pressable flex min-h-11 items-center justify-between rounded-[var(--ps-radius-sm)] px-3.5 py-2.5 text-sm transition",
                        active
                          ? "bg-[var(--ps-teal-700)] font-semibold text-white shadow-sm"
                          : "font-medium text-[var(--ps-text-secondary)] hover:bg-[var(--ps-surface-subtle)] hover:text-[var(--ps-text)]"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>{item.label}</span>
                      </span>
                      {active && (
                        <span className="h-2 w-2 rounded-full bg-[var(--ps-green-brand)]" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-2.5">
              <div className="ps-layer-2 rounded-[var(--ps-radius-lg)] p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ps-text-secondary)]">
                    Tasa BCV
                  </span>
                  <span className="rounded-full bg-[var(--ps-green-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--ps-green-800)]">
                    Vigente
                  </span>
                </div>
                <p className="mt-1 text-lg font-bold text-[var(--ps-text)] ps-tabular">
                  {bcvRateLabel}
                </p>
                <p className="text-[11px] text-[var(--ps-text-secondary)]">
                  Fecha valor: {bcvDateLabel}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="ps-pressable flex min-h-11 w-full cursor-pointer items-center justify-between rounded-[var(--ps-radius-md)] border border-[var(--ps-border)] bg-[var(--ps-surface-subtle)] px-3.5 py-2 text-left text-sm font-medium text-[var(--ps-text)] hover:bg-[var(--ps-danger-bg)] hover:text-[var(--ps-danger-text)] disabled:opacity-60"
              >
                <span className="truncate">
                  {loggingOut ? "Saliendo…" : `Cerrar sesión (${userName ?? "Usuario"})`}
                </span>
                <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
