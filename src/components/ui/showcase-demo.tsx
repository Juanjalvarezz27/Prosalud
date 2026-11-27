"use client";

import * as React from "react";
import { Search } from "lucide-react";
import {
  Badge,
  BottomSheet,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  DataTable,
  EmptyState,
  Input,
  Modal,
  Pagination,
  SegmentedControl,
  Select,
  SkeletonCard,
  SkeletonChart,
  SkeletonForm,
  SkeletonStat,
  SkeletonTable,
  SkeletonText,
  Textarea,
  type DataTableColumn,
} from "@/src/components/ui";
import { notify } from "@/src/lib/notify";
import { buildPaginatedResult } from "@/src/lib/pagination";
import { convertRefCentsToBsCents, parseCents, parseRate } from "@/src/lib/money";
import { formatBs, formatRateVe, formatUsd } from "@/src/lib/format";
import { formatDateVe } from "@/src/lib/dates";

interface DemoProduct {
  id: string;
  category: string;
  description: string;
  divisas: string;
  referencial: string;
  bs: string;
  status: "completo" | "sin_precio";
}

const DEMO_PRODUCTS: DemoProduct[] = [
  {
    id: "1",
    category: "BIOTECNICA",
    description: "Ácido Úrico Directo 2x100ml",
    divisas: "$ 17,28",
    referencial: "$ 21,77",
    bs: "870,80 Bs.",
    status: "completo",
  },
  {
    id: "2",
    category: "WIENER LAB",
    description: "Glucosa Enzimática 1x500ml",
    divisas: "$ 10,00",
    referencial: "$ 12,50",
    bs: "500,00 Bs.",
    status: "completo",
  },
  {
    id: "3",
    category: "LABCARE",
    description: "Colesterol Total 2x100ml",
    divisas: "—",
    referencial: "—",
    bs: "—",
    status: "sin_precio",
  },
];

const PRODUCT_COLUMNS: Array<DataTableColumn<DemoProduct>> = [
  {
    key: "category",
    header: "Categoría",
    render: (p) => (
      <span className="text-xs font-semibold text-[var(--ps-teal-700)]">{p.category}</span>
    ),
  },
  {
    key: "description",
    header: "Producto",
    render: (p) => <span className="font-medium text-[var(--ps-text)]">{p.description}</span>,
  },
  {
    key: "divisas",
    header: "Precio Divisas",
    align: "right",
    cellClassName: "ps-tabular font-semibold text-[var(--ps-green-700)]",
    render: (p) => p.divisas,
  },
  {
    key: "referencial",
    header: "Precio Ref.",
    align: "right",
    cellClassName: "ps-tabular font-medium",
    render: (p) => p.referencial,
  },
  {
    key: "bs",
    header: "Ref. en Bs.",
    align: "right",
    cellClassName: "ps-tabular text-[var(--ps-text-secondary)]",
    render: (p) => p.bs,
  },
];

// Demostración interactiva de los componentes base de la subfase 0.4
export function ShowcaseDemo() {
  const [payMode, setPayMode] = React.useState<"productos" | "monto">("productos");
  const [category, setCategory] = React.useState("biotecnia");
  const [showEmpty, setShowEmpty] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [demoPage, setDemoPage] = React.useState(1);

  const demoPagination = React.useMemo(
    () =>
      buildPaginatedResult({
        items: [],
        total: 801,
        page: demoPage,
        pageSize: 20,
      }).pagination,
    [demoPage]
  );

  const sampleRate = parseRate("38.4567");
  const sampleRef = parseCents("1234.56");
  const sampleBs = convertRefCentsToBsCents(sampleRef, sampleRate);

  return (
    <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
      <Card layer={1} padding="lg" className="space-y-5 xl:col-span-5">
        <CardHeader>
          <CardTitle>4. Componentes interactivos y estados</CardTitle>
          <CardDescription>
            Botones, campos (normal, foco, error, deshabilitado), selectores, modales y hojas.
          </CardDescription>
        </CardHeader>

        <div className="flex flex-wrap gap-2.5">
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            Abrir modal
          </Button>
          <Button variant="secondary" onClick={() => setSheetOpen(true)}>
            Hoja inferior
          </Button>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            Anular nota
          </Button>
          <Button variant="outline">Cancelar</Button>
          <Button variant="primary" loading loadingText="Guardando…">
            Guardar
          </Button>
        </div>

        <SegmentedControl
          label="Modo de pago (control segmentado)"
          value={payMode}
          onChange={setPayMode}
          options={[
            { value: "productos", label: "Por productos" },
            { value: "monto", label: "Por monto" },
          ]}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Buscar producto (normal / foco)"
            placeholder="Ej. Glucosa Enzimática"
            leftIcon={<Search className="h-4 w-4" aria-hidden="true" />}
          />
          <Input
            label="Referencia (estado error)"
            defaultValue="12"
            error="Referencia: debe tener entre 4 y 30 caracteres."
          />
          <Select
            label="Categoría"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: "biotecnia", label: "BIOTECNICA" },
              { value: "wiener", label: "WIENER LAB" },
              { value: "labcare", label: "LABCARE" },
            ]}
          />
          <Input
            label="Tasa congelada (deshabilitado)"
            value="40,00 Bs/$"
            disabled
            hint="Se guarda al emitir la nota."
          />
        </div>

        <Textarea
          label="Observación de anulación (multilínea)"
          placeholder="Indique el motivo de anulación (10 a 500 caracteres)…"
          rows={2}
        />

        <div className="flex flex-wrap gap-2">
          <Badge variant="success">Pagada</Badge>
          <Badge variant="info">Pendiente</Badge>
          <Badge variant="warning">Vence en 2 días</Badge>
          <Badge variant="danger">Vencida</Badge>
          <Badge variant="neutral">Sin precio</Badge>
        </div>
      </Card>

      <Card layer={1} padding="lg" className="space-y-5 xl:col-span-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardHeader>
            <CardTitle>5. Tabla responsive, tarjetas móviles y estado vacío</CardTitle>
            <CardDescription>
              Alterna entre el listado con datos y el estado vacío reutilizable.
            </CardDescription>
          </CardHeader>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEmpty((prev) => !prev)}
          >
            {showEmpty ? "Ver con datos" : "Simular vacío"}
          </Button>
        </div>

        <DataTable
          data={showEmpty ? [] : DEMO_PRODUCTS}
          columns={PRODUCT_COLUMNS}
          keyExtractor={(p) => p.id}
          emptyTitle="No se encontraron productos"
          emptyDescription="Prueba otro término de búsqueda o limpia los filtros activos."
          emptyAction={
            <Button variant="secondary" size="sm" onClick={() => setShowEmpty(false)}>
              Restaurar listado
            </Button>
          }
          renderMobileCard={(p) => (
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-semibold text-[var(--ps-teal-700)]">
                    {p.category}
                  </span>
                  <p className="text-sm font-semibold text-[var(--ps-text)]">{p.description}</p>
                </div>
                {p.status === "sin_precio" && <Badge variant="neutral">Sin precio</Badge>}
              </div>
              <div className="flex items-center justify-between border-t border-[var(--ps-border)] pt-2 text-xs ps-tabular">
                <span className="font-semibold text-[var(--ps-green-700)]">
                  Divisas: {p.divisas}
                </span>
                <span>
                  Ref: {p.referencial} ({p.bs})
                </span>
              </div>
            </div>
          )}
        />

        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--ps-text-secondary)]">
            Vista directa de EmptyState independiente
          </p>
          <EmptyState
            title="Aún no hay abonos registrados"
            description="Los pagos en efectivo $, transferencia o pago móvil aparecerán aquí."
          />
        </div>
      </Card>

      <Card layer={1} padding="lg" className="space-y-5 xl:col-span-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardHeader>
            <CardTitle>6. Skeletons reutilizables y notificaciones Sonner (0.5)</CardTitle>
            <CardDescription>
              Cero spinners genéricos y feedback inmediato en español desde cualquier pantalla.
            </CardDescription>
          </CardHeader>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="primary" onClick={() => notify.success("Cotización guardada")}>
              Éxito
            </Button>
            <Button size="sm" variant="danger" onClick={() => notify.error("No tienes permiso para anular notas")}>
              Error
            </Button>
            <Button size="sm" variant="outline" onClick={() => notify.warning("La tasa BCV cambió desde la cotización")}>
              Advertencia
            </Button>
            <Button size="sm" variant="secondary" onClick={() => notify.info("Tasa BCV actualizada: 40,00 Bs/$")}>
              Información
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                notify.promise(new Promise((resolve) => setTimeout(resolve, 1200)), {
                  loading: "Generando PDF de nota…",
                  success: "PDF listo para enviar",
                  error: "No se pudo generar el PDF",
                })
              }
            >
              Proceso
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-3">
            <SkeletonStat />
            <SkeletonCard />
            <div className="ps-layer-1 rounded-[var(--ps-radius-lg)] p-4">
              <SkeletonText lines={3} />
            </div>
          </div>
          <SkeletonForm fields={3} />
          <SkeletonChart />
        </div>

        <SkeletonTable rows={2} columns={4} />
      </Card>

      <Card layer={1} padding="lg" className="space-y-4 xl:col-span-12">
        <CardHeader>
          <CardTitle>7. Paginación real, formato venezolano y zona horaria (0.7)</CardTitle>
          <CardDescription>
            Controles de paginación adaptados a móvil/escritorio y cálculos exactos sin punto flotante.
          </CardDescription>
        </CardHeader>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="ps-inset rounded-[var(--ps-radius-md)] p-3.5">
            <p className="text-[11px] font-medium text-[var(--ps-text-secondary)]">
              Monto referencial (R16)
            </p>
            <p className="mt-1 text-lg font-bold text-[var(--ps-text)] ps-tabular">
              {formatUsd(sampleRef)}
            </p>
          </div>
          <div className="ps-inset rounded-[var(--ps-radius-md)] p-3.5">
            <p className="text-[11px] font-medium text-[var(--ps-text-secondary)]">
              Equivalente exacto a tasa {formatRateVe(sampleRate)}
            </p>
            <p className="mt-1 text-lg font-bold text-[var(--ps-teal-700)] ps-tabular">
              {formatBs(sampleBs)}
            </p>
          </div>
          <div className="ps-inset rounded-[var(--ps-radius-md)] p-3.5">
            <p className="text-[11px] font-medium text-[var(--ps-text-secondary)]">
              Fecha Caracas (R17)
            </p>
            <p className="mt-1 text-lg font-bold text-[var(--ps-text)] ps-tabular">
              {formatDateVe(new Date("2026-12-02T03:30:00.000Z"))}
            </p>
          </div>
        </div>

        <React.Suspense fallback={<SkeletonText lines={1} />}>
          <Pagination
            pagination={demoPagination}
            onPageChange={setDemoPage}
            itemLabel="productos de ejemplo"
          />
        </React.Suspense>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Modal de prueba (Capa 3)"
        description="Superficie flotante translúcida con desenfoque y cierre por Escape."
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cerrar
            </Button>
            <Button variant="primary" onClick={() => setModalOpen(false)}>
              Aceptar
            </Button>
          </>
        }
      >
        <Input label="Nombre del cliente" placeholder="Ej. Laboratorio Clínico Valera" />
      </Modal>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Hoja inferior móvil"
        description="En teléfonos se desliza desde abajo para operar con el pulgar."
        footer={
          <Button variant="primary" className="w-full sm:w-auto" onClick={() => setSheetOpen(false)}>
            Listo
          </Button>
        }
      >
        <p className="text-sm text-[var(--ps-text-secondary)]">
          Ideal para seleccionar líneas de pago o mostrar totales dobles en pantalla pequeña.
        </p>
      </BottomSheet>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => setConfirmOpen(false)}
        title="¿Anular Nota de Entrega N° 07?"
        description="Esta acción dejará la nota visible como anulada y sus pagos dejarán de contar en cuentas por cobrar."
        confirmLabel="Sí, anular nota"
      />
    </section>
  );
}
