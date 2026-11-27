import { Card } from "./card";

const PALETTE_TOKENS = [
  {
    name: "Verde Marca",
    hex: "#80B038",
    role: "Fondos suaves y acentos",
    bg: "bg-[var(--ps-green-brand)]",
    text: "text-[#111D24]",
  },
  {
    name: "Verde Acción (AA)",
    hex: "#4A7312",
    role: "Acción principal y pagada",
    bg: "bg-[var(--ps-green-700)]",
    text: "text-white",
  },
  {
    name: "Turquesa Marca",
    hex: "#30A8B8",
    role: "Foco, detalles e ilustración",
    bg: "bg-[var(--ps-teal-brand)]",
    text: "text-[#111D24]",
  },
  {
    name: "Turquesa Info (AA)",
    hex: "#146E7B",
    role: "Navegación, enlaces e info",
    bg: "bg-[var(--ps-teal-700)]",
    text: "text-white",
  },
];

// Bloques base del sistema visual: paleta, capas de profundidad y jerarquía Poppins
export function DesignSystemOverview() {
  return (
    <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
      <Card layer={1} padding="lg" className="xl:col-span-4">
        <h2 className="text-base font-semibold text-[var(--ps-text)]">1. Paleta ProSalud</h2>
        <p className="mt-1 text-xs leading-relaxed text-[var(--ps-text-secondary)]">
          Acentos originales del logo y tonos oscuros accesibles para acciones y lectura.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {PALETTE_TOKENS.map((item) => (
            <div
              key={item.hex}
              className="overflow-hidden rounded-[var(--ps-radius-md)] border border-[var(--ps-border)] bg-[var(--ps-surface-subtle)]"
            >
              <div className={`${item.bg} ${item.text} px-3 py-4`}>
                <p className="text-xs font-semibold">{item.name}</p>
                <p className="text-[11px] opacity-90 ps-tabular">{item.hex}</p>
              </div>
              <p className="p-2.5 text-[11px] leading-snug text-[var(--ps-text-secondary)]">
                {item.role}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card layer={1} padding="lg" className="xl:col-span-4">
        <h2 className="text-base font-semibold text-[var(--ps-text)]">2. Juego de profundidades</h2>
        <p className="mt-1 text-xs leading-relaxed text-[var(--ps-text-secondary)]">
          Contraste entre riel hundido, superficie, tarjeta elevada y vidrio flotante.
        </p>

        <div className="ps-inset relative mt-4 space-y-3 rounded-[var(--ps-radius-lg)] p-4">
          <div className="flex items-center justify-between text-[11px] font-medium text-[var(--ps-text-secondary)]">
            <span>Capa 0 / Riel hundido</span>
            <span>Sombra interior</span>
          </div>
          <div className="ps-layer-1 rounded-[var(--ps-radius-md)] p-3">
            <p className="text-xs font-semibold text-[var(--ps-text)]">Capa 1 · Superficie</p>
            <p className="text-[11px] text-[var(--ps-text-secondary)]">Reflejo superior y borde sutil.</p>
          </div>
          <div className="ps-layer-2 rounded-[var(--ps-radius-md)] p-3">
            <p className="text-xs font-semibold text-[var(--ps-text)]">Capa 2 · Elevado</p>
            <p className="text-[11px] text-[var(--ps-text-secondary)]">Sombra amplia para foco principal.</p>
          </div>
          <div className="ps-layer-3 rounded-[var(--ps-radius-md)] p-3">
            <p className="text-xs font-semibold text-[var(--ps-teal-800)]">Capa 3 · Vidrio flotante</p>
            <p className="text-[11px] text-[var(--ps-text-secondary)]">Desenfoque translúcido sobre el contenido.</p>
          </div>
        </div>
      </Card>

      <Card layer={1} padding="lg" className="xl:col-span-4">
        <h2 className="text-base font-semibold text-[var(--ps-text)]">3. Jerarquía Poppins</h2>
        <p className="mt-1 text-xs leading-relaxed text-[var(--ps-text-secondary)]">
          Combinación de pesos y cifras tabulares en formato venezolano.
        </p>
        <div className="mt-4 divide-y divide-[var(--ps-border)]">
          <div className="pb-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ps-text-secondary)]">
              Bold 700 · Totales
            </span>
            <p className="text-lg font-bold text-[var(--ps-text)] ps-tabular">
              Nota N° 07 · $ 78,00
            </p>
          </div>
          <div className="py-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ps-text-secondary)]">
              SemiBold 600 · Equivalentes
            </span>
            <p className="text-sm font-semibold text-[var(--ps-teal-700)] ps-tabular">
              3.120,00 Bs. (Tasa 40,00)
            </p>
          </div>
          <div className="py-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ps-text-secondary)]">
              Medium 500 · Etiquetas
            </span>
            <p className="text-sm font-medium text-[var(--ps-text)]">
              Laboratorio Clínico Las Acacias
            </p>
          </div>
          <div className="py-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ps-text-secondary)]">
              Regular 400 · Descripción
            </span>
            <p className="text-xs text-[var(--ps-text)]">
              Reactivos, pruebas rápidas e instrumental médico.
            </p>
          </div>
          <div className="pt-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ps-text-secondary)]">
              Light 300 · Secundario
            </span>
            <p className="text-xs font-light text-[var(--ps-text-secondary)]">
              Válida hasta 30/11/2026 (hora Caracas).
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
}
