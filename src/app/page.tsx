import Link from "next/link";
import { AppShell } from "@/src/components/layout/app-shell";
import { Card } from "@/src/components/ui";
import { DesignSystemOverview } from "@/src/components/ui/design-system-overview";
import { ShowcaseDemo } from "@/src/components/ui/showcase-demo";

const KPIS = [
  {
    label: "Vendido en el mes",
    value: "$ 1.650,00",
    sub: "66.000,00 Bs. · 14 notas",
    elevated: true,
    accent: "text-[var(--ps-green-700)]",
  },
  {
    label: "Total cobrado",
    value: "$ 1.240,00",
    sub: "Efectivo $780,00 · Bs. 18.400,00",
    elevated: false,
    accent: "text-[var(--ps-teal-700)]",
  },
  {
    label: "Por cobrar",
    value: "$ 410,00",
    sub: "4 notas activas a crédito",
    elevated: false,
    accent: "text-[var(--ps-text)]",
  },
  {
    label: "Deuda vencida",
    value: "$ 50,00",
    sub: "1 nota vencida · requiere gestión",
    elevated: false,
    accent: "text-[var(--ps-danger-text)]",
  },
];

export default function Home() {
  return (
    <AppShell
      title="Sistema de Diseño y Layout"
      subtitle="Ancho completo fluido · Capas de vidrio y elevación · Poppins"
      badgeText="Fase 0 completa"
      showSearchPlaceholder
      headerActions={
        <Link
          href="/galeria"
          className="ps-pressable inline-flex min-h-10 items-center justify-center rounded-full bg-[var(--ps-green-700)] px-4 text-xs font-semibold text-white shadow-sm hover:bg-[var(--ps-green-800)] sm:text-sm"
        >
          Ver galería
        </Link>
      }
    >
      {/* Grilla de KPIs ocupando todo el ancho disponible */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((kpi) => (
          <Card
            key={kpi.label}
            layer={kpi.elevated ? 2 : 1}
            interactive
            padding="md"
            className="rounded-[var(--ps-radius-lg)]"
          >
            <p className="text-xs font-medium text-[var(--ps-text-secondary)]">{kpi.label}</p>
            <p className={`mt-1.5 text-2xl font-bold tracking-tight ps-tabular sm:text-3xl ${kpi.accent}`}>
              {kpi.value}
            </p>
            <p className="mt-2 text-xs text-[var(--ps-text-secondary)] ps-tabular">{kpi.sub}</p>
          </Card>
        ))}
      </section>

      <DesignSystemOverview />
      <ShowcaseDemo />
    </AppShell>
  );
}
