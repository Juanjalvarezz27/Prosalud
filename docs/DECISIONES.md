# Decisiones y Supuestos — ProSalud

Registro vivo de decisiones técnicas, supuestos (`S1`–`S17`) y avance por fases del sistema ProSalud Servicios Integrales, C.A.

---

## 1. Decisiones de arquitectura confirmadas

| ID | Tema | Decisión | Motivo / Impacto |
|---|---|---|---|
| **D1** | Tareas programadas (Sin Vercel Cron) | No se usarán Cron Jobs en Vercel. | La expiración de cotizaciones (3 días, hora `America/Caracas`) se aplica con **filtrado estricto en servidor + limpieza perezosa (`deleteMany`)** al consultar o convertir. La tasa BCV automática se captura **bajo demanda** al entrar al sistema (con upsert idempotente por fecha valor y fallback). |
| **D2** | Numeración de documentos (R10) | Implementación lo más sencilla posible con series separadas (notas desde `00`). | Uso de secuencias nativas en PostgreSQL (`SEQUENCE`, `MINVALUE 0 START WITH 0` para notas) o contador mínimo por serie dentro de transacción. |
| **D3** | Descuentos globales (R9 / R16) | Descuento global flexible y compatible con pagos por línea. | Al guardar un documento con descuento global (% o monto en `$` ref.), se prorratea proporcionalmente sobre las líneas (absorbiendo el residuo de centavo en la última) y se conserva el registro del descuento global. Así la suma de saldos de líneas siempre equivale al saldo de la nota. |
| **D4** | ORM y PostgreSQL (Neon) | Prisma `7.10.1` + `@prisma/client@7.10.1` + `@prisma/adapter-pg@7.10.1`. | Se fijó `7.10.1` para evitar mezcla con `prisma@8.0.0-rc.x`. Configurado en `prisma7.config.ts` y cliente singleton en `src/lib/prisma.ts`. |
| **D5** | Despliegue en Vercel al final | Todo el desarrollo (Fases 0–10) corre en local; el despliegue a Vercel pasa a `11.4`. | Se eliminó `0.3 Despliegue de prueba` de Fase 0 (verificando `next build` en local) y se movió el despliegue antes de cargar datos reales en Fase 11. |
| **D6** | Estilo visual Apple aprobado (`0.3`) | Ancho completo fluido con sidebar flotante (Capa 3), fondo `.ps-canvas`, capas `.ps-inset` y `.ps-layer-1/2/3` con vidrio esmerilado, `.ps-pressable`, Poppins (`tabular-nums`) y sin dark mode. | Definido en `src/app/globals.css` y `src/app/layout.tsx`; no usar contenedores estrechos centrados (`max-w-*`) en vistas principales (solo `max-w-prose` en párrafos largos). Todas las pantallas futuras deben consumir los tokens `.ps-*` y `src/components/ui/` (`0.4`). |
| **D7** | Navbar móvil superior con menú hamburguesa (`0.6`) | En móvil y tablet se usa barra superior sticky con botón hamburguesa y drawer lateral (`.ps-layer-modal`), en lugar de barra de navegación inferior fija. | Evita colisiones con hojas inferiores de totales (como al armar cotizaciones en B.3) y aprovecha mejor el espacio vertical en pantallas pequeñas. |

---

## 2. Supuestos del Roadmap (S1–S17)

| ID | Supuesto | Estado |
|---|---|---|
| **S1** | Producto sin precio o con un solo precio se importa, pero no puede cotizarse hasta completarse. | Pendiente validación final cliente |
| **S2** | Al cotizar se puede crear un cliente nuevo al vuelo. | Pendiente validación final cliente |
| **S3** | Cotización dura 3 días (día 0 = creación) y se elimina sola al vencer; al convertir, conserva precios y toma tasa vigente avisando si cambió. | Confirmado por el cliente |
| **S4** | Nota puede tener pago parcial al emitir y el resto a crédito; pago completo al emitir = contado. | Pendiente validación final cliente |
| **S5** | Descuentos manuales aplican proporcionalmente a ambos precios; por monto se definen en `$` referenciales y se trasladan con el factor de divisas. | Existencia confirmada; cálculo supuesto + D3 |
| **S6** | Cotizaciones y notas de entrega tienen series de numeración separadas. | Pendiente validación final cliente |
| **S7** | Trabajadores crean y consultan clientes (no editan ni borran) y registran pagos/abonos. | Confirmado |
| **S8** | Trabajadores ven estadísticas en solo lectura. | Pendiente validación final cliente |
| **S9** | Registro de auditoría de acciones sensibles (anulaciones, descuentos, precios, pagos, tasa manual, usuarios). | Pendiente validación final cliente |
| **S10** | El sistema es instalable en el celular (PWA). | Pendiente validación final cliente |
| **S11** | Total vendido = suma de totales ref. de notas no anuladas; total cobrado = saldo ref. cancelado por pagos (más detalle efectivo `$` y `Bs.` por método). | Confirmado |
| **S12** | Los pagos registrados no se editan ni borran; correcciones quedan trazadas en auditoría. | Pendiente validación final cliente |
| **S13** | Crédito: día de emisión = día 0; vence a los 10 días calendario; vencida desde el día siguiente. | Confirmado |
| **S14** | Tasa cambia por día hábil; fin de semana y feriados rige tasa del siguiente día hábil (o última disponible con aviso). | Confirmado |
| **S15** | Validaciones numéricas y de texto de R18 (enteros, máx. 100 líneas, variación BCV 15%, límites Excel 5 MB / 5.000 filas). | Pendiente validación final cliente |
| **S16** | Redondeo R16: 2 decimales, mitad hacia arriba (`HALF_UP`), descuento redondeado y restado de la base. | Pendiente validación final cliente |
| **S17** | Cotizaciones eliminadas por vencimiento no dejan ningún registro (sin tasa de conversión en estadísticas). | Decisión del cliente |

---

## 3. Estado actual de avance

- **Fase actual:** Fase 1 — Autenticación, usuarios y roles (subfase `1.1` completada; siguiente: `1.2`).
- **Avance verificado:**
  - Proyecto Next.js (`16.4.6`), TypeScript y Tailwind v4 base arrancan (`next dev`) y compilan (`next build`) sin errores.
  - Prisma `7.10.1` configurado (`prisma7.config.ts`, `prisma/schema.prisma`, `src/lib/prisma.ts`) y conectado contra PostgreSQL `18.7` en Neon; prueba de lectura/escritura/limpieza verificada (`leftover: null`).
- **Insumos del cliente disponibles en el repositorio:**
  - Logos en `public/logo.png` y `public/Logoredondo.png`.
  - Catálogo en `docs/Lista_de_Precios_Agosto_2026.xlsx`.
  - Clientes en `docs/Directorio_Clientes.xlsx`.
- **Progreso de fases:**
  - [x] Fase 0 — Fundamentos y sistema de diseño (`0.1`–`0.8`)
  - [ ] Fase 1 — Autenticación, usuarios y roles (`1.1`–`1.8`)
  - [ ] Fase 2 — Tasa BCV (`2.1`–`2.7`)
  - [ ] Fase 3 — Catálogo de productos (`3.1`–`3.9`)
  - [ ] Fase 4 — Clientes (`4.1`–`4.6`)
  - [ ] Fase 5 — Cotizaciones (`5.1`–`5.9`)
  - [ ] Fase 6 — Notas de entrega (`6.1`–`6.6`)
  - [ ] Fase 7 — Pagos, crédito y cuentas por cobrar (`7.1`–`7.10`)
  - [ ] Fase 8 — Documentos PDF y envío por WhatsApp (`8.1`–`8.7`)
  - [ ] Fase 9 — Estadísticas y alertas de cobro (`9.1`–`9.6`)
  - [ ] Fase 10 — Experiencia móvil, PWA y pulido (`10.1`–`10.8`)
  - [ ] Fase 11 — Pruebas integrales, despliegue, datos reales y entrega (`11.1`–`11.8`)
