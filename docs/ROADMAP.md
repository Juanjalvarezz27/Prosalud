# ROADMAP — Sistema Administrativo y de Ventas Móvil para ProSalud

> Documento de planificación para ser ejecutado por agentes de desarrollo (Antigravity).
> Define **QUÉ** debe existir y cumplirse en cada fase. **El CÓMO (arquitectura, librerías, estructura de carpetas, patrones) lo decide el agente**, siempre respetando las restricciones de este documento.

---

## 0. Cómo usar este documento (instrucciones para el agente)

1. Las fases son **secuenciales**. No se inicia una fase hasta que **todos** sus criterios de cierre de la anterior estén cumplidos y verificados.
2. Cada fase se divide en **subfases** (`N.1`, `N.2`…), que son **microtareas secuenciales** que construyen la fase completa paso a paso (por ejemplo: primero el login, luego la protección de rutas). Cada subfase indica **qué debe lograr** y **cuándo está lista**. No se avanza a la siguiente subfase sin cumplir la actual.
   - Al terminar cada subfase, el sistema debe quedar funcionando (sin dejar pantallas rotas ni código a medias).
   - Las convenciones de la sección 5.6 (Poppins, skeletons, Sonner, paginación real) aplican a **todas** las subfases desde que existe lo necesario para cumplirlas.
3. Las **reglas de negocio de la sección 4 son la fuente de verdad**. Si una fase y la sección 4 parecen contradecirse, prevalece la sección 4.
4. Los puntos marcados como **[SUPUESTO Sx]** (sección 10) son decisiones razonables tomadas ante información no confirmada. Impleméntalos tal cual, déjalos fácilmente identificables y no inventes otros sin registrarlos.
5. **Ante ambigüedad:**
   - Si la duda toca **dinero** (cálculos, redondeo, saldos, tasas), **permisos**, **numeración**, **borrado o pérdida de datos**, o **cualquier regla de la sección 4**: **detente y pregunta** antes de implementar. No decidas por tu cuenta.
   - Si es un detalle menor de interfaz o de implementación que no afecta esas reglas: elige la opción más simple que no contradiga el documento y regístrala en el archivo de decisiones del proyecto.
   - **No inventes** funcionalidades, campos ni pantallas fuera del alcance (sección 9).
6. Al terminar cada fase, el agente debe entregar un resumen breve: qué subfases completó, qué criterios se verificaron y cómo, y qué supuestos aplicó.
7. Todo el texto visible para el usuario final debe estar en **español**.

---

## 1. Contexto del negocio

- **Cliente:** ProSalud Servicios Integrales, C.A. — Valera, estado Trujillo, Venezuela.
- **Qué vende:** reactivos de laboratorio, pruebas rápidas, material descartable, instrumental, pipetas y equipos.
- **Problema:** hoy cotizan y entregan con documentos manuales (nota de entrega impresa en papel), calculan a mano la conversión dólares/bolívares, y no tienen control de quién debe, cuánto, ni cuándo debe pagar.
- **Objetivo del sistema:** ser el "cerebro operativo" de la empresa: privado, a la medida, muy fácil de usar, que permita cotizar y generar notas de entrega desde el celular o la computadora, calcular automáticamente montos en $ y Bs con la tasa BCV, controlar pagos y créditos, y enviar los documentos en PDF por WhatsApp.
- **Usuarios:** una dueña (administradora) y sus trabajadores/vendedores (varios, número no fijo; el sistema no debe limitar la cantidad).
- **Dispositivos:** vendedores en la calle con celular; oficina con computadora.

---

## 2. Restricciones técnicas

- Framework: **Next.js**.
- Lenguaje: **TypeScript**.
- Estilos: **Tailwind**.
- Base de datos: **PostgreSQL en Neon**, accedida mediante **Prisma**.
- Despliegue: **Vercel**.
- Notificaciones de acciones: **Sonner**.
- Tipografía principal: **Poppins**.
- El resto de decisiones técnicas son del agente.
- Requisitos no funcionales obligatorios:
  - Rápido: ninguna pantalla común debe sentirse lenta ni "colgarse".
  - **Servidor estable:** todo listado usa **paginación real en el servidor** (sección 5.6); nunca se cargan tablas completas en memoria ni en el navegador.
  - Los montos de dinero deben manejarse con **precisión decimal exacta** (nunca errores de redondeo por punto flotante).
  - La seguridad de permisos debe aplicarse **en el servidor**, no solo ocultando botones.
  - Toda la información debe persistir en la nube; perder un dispositivo no debe perder datos.

---

## 3. Glosario de conceptos

| Término | Significado |
|---|---|
| **Precio Divisas** | Columna "PVP Divisas ($)" del Excel. Precio en dólares, **el menor de los dos**, válido solo cuando ese producto se paga en **efectivo en dólares**. |
| **Precio Referencial** | Columna "PVP Bs ($)" del Excel. Precio en dólares, **el mayor de los dos**, que se usa como referencia: se multiplica por la tasa BCV para obtener el monto en bolívares. Aplica a pagos por transferencia o pago móvil. |
| **Tasa BCV** | Bolívares por 1 dólar según el BCV. |
| **Línea** | Un producto con su cantidad dentro de una cotización o nota de entrega. |
| **Factor de divisas de una línea** | Precio Divisas ÷ Precio Referencial de ese producto. Representa cuánto "vale" cada dólar en efectivo frente a la deuda referencial. Ej.: 0,80. **No es un descuento**: ambos son precios fijos del producto, anclados al dólar. |
| **Cotización** | Equivalente a un presupuesto. No mueve dinero ni deuda. |
| **Nota de entrega** | Documento formal de venta. Es donde se registran pagos, crédito y abonos. |
| **Contado** | Nota de entrega totalmente pagada en el momento de emitirse. |
| **Crédito** | Nota con saldo pendiente. Plazo: **10 días** desde la emisión. |
| **Saldo** | Deuda pendiente, siempre expresada en **dólares referenciales**. |
| **Abono** | Pago posterior (o parcial) que reduce el saldo. |

---

## 4. Reglas de negocio globales (fuente de verdad)

### R1. Moneda y precios
- Todos los precios del catálogo están en dólares. Cada producto tiene **dos** precios: Precio Divisas y Precio Referencial.
- Un producto sin ambos precios completos **no puede agregarse a una cotización** (se marca como "sin precio" / "precio incompleto"). **[S1]**

### R2. Tasa BCV congelada
- Cada cotización, nota de entrega y cada pago **guarda la tasa BCV usada** y la fecha de esa tasa en el momento de la transacción.
- Esa tasa **nunca se recalcula** después. Todo reporte o documento histórico debe mostrar la tasa original de su transacción.
- Los pagos en Bs usan **la tasa del día en que se paga**, no la de la emisión.

### R3. Cotización
- Muestra **dos totales**: total pagando en efectivo $ (Precio Divisas) y total en Bs (Precio Referencial × tasa). El cliente decide cómo pagar.
- Es solo un presupuesto y tiene una **vigencia de 3 días**: se crea en el **día 0** y es válida hasta el final del día 3 (hora de Caracas). Si el cliente no responde afirmativamente y no se convierte en nota de entrega antes de que termine esa vigencia, se **elimina automáticamente** **[S3]**.
- Sigue sin tener estados (no hay borrador, enviada, aceptada, etc.).
- Las cotizaciones **ya convertidas no se eliminan**: quedan como historial, vinculadas a su nota.
- Al eliminarse, **no se conserva ningún registro** de la cotización: desaparece por completo **[S17]**.
- Es editable hasta que se convierte en nota de entrega. Después queda en solo lectura y **vinculada** a la nota que generó (se debe ver "Convertida en Nota N° X" y, desde la nota, de qué cotización salió). Una cotización se convierte **una sola vez**.
- Puede hacerse a un cliente no registrado, creándolo al vuelo. **[S2]**

### R4. Conversión de cotización a nota de entrega
- Cuando el cliente acepta, la cotización pasa a ser nota de entrega.
- La nota **conserva los precios de la cotización** (que tiene como máximo 3 días de antigüedad). Si la tasa BCV vigente cambió desde que se cotizó, el sistema **avisa antes de emitir**, mostrando el total en Bs de la cotización y el nuevo. **[S3]**
- La nota **siempre** toma la tasa BCV vigente al momento de emitirse.
- Una nota de entrega también puede crearse directamente, sin cotización previa.

### R5. Pago por línea (precio de divisas)
- Importante: el Precio Divisas **no es un descuento**. Cada producto tiene dos precios fijos, ambos anclados al dólar. Los **descuentos manuales** de R9 son otra cosa y se aplican además, si el trabajador o el admin los da.
- La forma de pago se decide **por línea**, no por orden completa:
  - Línea pagada en **efectivo $** → usa su Precio Divisas.
  - Línea pagada en **Bs** (transferencia o pago móvil) → usa su Precio Referencial × tasa BCV.
- Si toda la orden se paga en efectivo $, todas las líneas usan su Precio Divisas.
- Si solo algunas líneas se pagan en efectivo $, solo esas usan su Precio Divisas; las demás quedan a precio referencial.

### R6. Dos modos de registrar un pago
1. **Por productos:** se marcan las líneas que se pagan en efectivo $ (con su Precio Divisas); el resto queda en Bs a referencial o pendiente.
2. **Por monto:** se escribe un monto (ej.: "abona $50 en efectivo, el resto en Bs"). El sistema reparte ese monto entre las líneas:
   - Por defecto, el efectivo cubre las líneas **en el orden en que aparecen en la nota**, cada una a su Precio Divisas; la última cubierta puede quedar **parcial** con su descuento proporcional.
   - Opcionalmente el usuario puede **elegir manualmente** qué líneas cubre el efectivo.
- Un mismo pago puede **combinar métodos**: efectivo $, transferencia, pago móvil. Cada método registra su monto y, en transferencia/pago móvil, una **referencia**.

### R7. Cómo reduce la deuda cada pago
Sea una línea con saldo referencial `S` y factor de divisas `f`:
- **Pago en Bs:** `monto_Bs ÷ tasa_del_día_del_pago` = dólares referenciales que se cancelan (dólar por dólar).
- **Pago en efectivo $:** `monto_$ ÷ f` = dólares referenciales que se cancelan (aquí actúa el Precio Divisas, que es menor).
- Cuando un pago cubre exactamente el saldo restante de una línea, el saldo debe quedar en **0,00 exacto** (sin residuos de centavos).
- El saldo de cada línea y de cada nota se mantiene siempre en **$ referenciales**.

### R8. Crédito
- Si al emitir la nota no está totalmente pagada, es de **crédito**: vence a los **10 días** de la emisión. Puede haber un pago parcial al emitir y el resto a crédito. **[S4]**
- Una nota a crédito **requiere cliente registrado**.
- Una nota con saldo y fecha de vencimiento pasada se considera **vencida**.
- Al llegar el saldo a cero, la nota queda como **pagada** automáticamente.

### R9. Descuentos
- Son **independientes de los dos precios**: se pueden dar **a un producto (línea) o a la orden completa**, por el motivo que sea, sin motivo obligatorio.
- Pueden ser por **porcentaje** o por **monto**, sin tope (con los límites de R18).
- Pueden aplicarlos tanto el administrador como los trabajadores (único permiso de edición de precios del trabajador).
- Un descuento reduce proporcionalmente ambos precios (divisas y referencial) de la línea u orden afectada, manteniendo el factor de divisas. Un descuento por monto se define en dólares referenciales y se traslada al Precio Divisas con el mismo factor. **[S5]**
- Todo descuento queda registrado: quién lo dio, cuánto y sobre qué.

### R10. Numeración
- Cotizaciones y notas de entrega tienen **series de numeración separadas**. **[S6]**
- La nota de entrega **arranca desde 00**; cada nueva nota toma el siguiente número consecutivo, sin saltos ni duplicados, incluso con varios usuarios emitiendo a la vez.
- Los números anulados no se reutilizan.

### R11. Anulación
- Solo el **administrador** puede anular una nota de entrega, y **debe indicar un motivo**.
- La nota anulada no se borra: queda visible como anulada, con motivo, quién y cuándo. Sus pagos y saldo dejan de contar en reportes y cuentas por cobrar.

### R12. Permisos
| Acción | Admin | Trabajador |
|---|---|---|
| CRUD de productos, categorías y precios | Sí | No (solo consulta) |
| Importar/actualizar precios por Excel | Sí | No |
| CRUD de clientes | Sí | Crear y consultar; no editar ni eliminar **[S7]** |
| Crear/editar cotizaciones | Sí | Sí |
| Convertir en nota de entrega | Sí | Sí |
| Registrar pagos y abonos | Sí | Sí **[S7]** |
| Dar descuentos | Sí | Sí |
| Anular notas de entrega | Sí | No |
| Gestionar usuarios | Sí | No |
| Fijar la tasa BCV manualmente | Sí | No |
| Ver estadísticas completas | Sí | Sí, de solo lectura **[S8]** |

- **Visibilidad:** todos los usuarios ven **todas** las cotizaciones, notas, clientes y deudas, sin importar quién las creó. Cada registro conserva quién lo creó.

### R13. Sin inventario
- En esta versión **no existe control de stock**: ni cantidades disponibles, ni descuento automático, ni alertas de inventario bajo, ni lotes, SKU o vencimientos.
- El diseño de datos no debe impedir añadir inventario más adelante.

### R14. Auditoría **[S9]**
- Deben quedar registradas, con usuario y fecha: anulaciones, descuentos, cambios de precios, pagos registrados y cambios manuales de la tasa BCV.

### R15. Ejemplo de referencia obligatorio (debe comportarse exactamente así)

Nota de entrega con 3 líneas:

| Línea | Total referencial | Total divisas | Factor |
|---|---|---|---|
| 1 | $40,00 | $30,00 | 0,75 |
| 2 | $35,00 | $28,00 | 0,80 |
| 3 | $25,00 | $20,00 | 0,80 |
| **Total** | **$100,00** | **$78,00** | |

- **Caso A — todo en efectivo $:** el cliente paga $78,00 y la nota queda pagada.
- **Caso B — por productos:** líneas 1 y 2 en efectivo = $58,00; línea 3 en Bs = $25,00 × tasa. Con tasa 40 → 1.000,00 Bs. Nota pagada.
- **Caso C — por monto:** abona $50,00 en efectivo (modo por defecto):
  - Línea 1 se cubre completa con $30,00 (cancela $40,00 referenciales).
  - Quedan $20,00 de efectivo: aplicados a la línea 2 cancelan $20,00 ÷ 0,80 = $25,00 referenciales.
  - Saldo restante: línea 2 = $10,00; línea 3 = $25,00 → **saldo de la nota = $35,00 referenciales**.
- **Caso D — abono posterior en Bs:** sobre el saldo del caso C, el cliente abona 800,00 Bs con tasa 40 → cancela $20,00 referenciales → saldo = **$15,00 referenciales**.
- **Caso E — cobrar el saldo en Bs:** un saldo de $15,00 con tasa 42 equivale a 630,00 Bs.

Estos cálculos deben cumplirse al centavo y servir como pruebas de aceptación.

### R16. Redondeo y precisión (regla única; no se improvisa) **[S16]**
- El dinero se maneja con decimales exactos. Se redondea a **2 decimales, mitad hacia arriba** (0,005 → 0,01), **solo** en estos puntos:
  1. **Descuento por porcentaje:** `descuento = redondear(base × %)`; el total de la línea es `base − descuento`.
  2. **Total de línea:** `cantidad × precio unitario` (el precio ya tiene 2 decimales, por lo que es exacto) menos el descuento de la línea.
  3. **Totales de cotización o nota:** suma de los totales de línea ya redondeados, menos el descuento global (redondeado con la misma regla).
  4. **Monto en Bs:** `redondear(total referencial × tasa)`, calculado **una sola vez sobre el total**. Los montos en Bs por línea, si se muestran, son solo informativos y no deben usarse para sumar.
  5. **Abono en Bs:** `$ referenciales cancelados = redondear(monto_Bs ÷ tasa)`.
  6. **Abono en efectivo $:** `$ referenciales cancelados = redondear(monto_$ × total referencial de la línea ÷ total divisas de la línea)`. El factor de divisas **no se redondea** antes de usarse.
- Cuando un pago cubre todo lo que resta en divisas de una línea, el saldo de esa línea queda en **0,00 exacto**; cualquier diferencia de centavos se absorbe en la última línea afectada. La suma de los saldos de las líneas debe ser siempre **igual** al saldo de la nota.
- La **tasa BCV** se guarda con la precisión que publica la fuente (mínimo 4 decimales, máximo 8) y se usa **sin redondearla** en los cálculos.

### R17. Zona horaria, fechas y vencimientos
- **Zona horaria única: `America/Caracas`** (UTC−4, sin horario de verano). Las fechas se almacenan en UTC y se **calculan y muestran** en hora de Caracas.
- El "día" para la tasa vigente, la fecha de emisión, el vencimiento y los cortes de mes de las estadísticas es el **día calendario en Caracas**. Una nota emitida el 01/12 a las 23:30 hora de Caracas cuenta como del 01/12, aunque en UTC ya sea el 02/12.
- **Vencimiento (crédito):** el día de emisión es el **día 0**; vence a los **10 días calendario** **[S13, confirmado]**. La nota vence al terminar ese día y se considera **vencida desde el día siguiente**. Ejemplo: emitida el 01/12 (día 0) → vence el 11/12 → vencida desde el 12/12 a las 00:00.
- **Vigencia de la cotización:** misma convención: creada el día 0, válida hasta el final del día 3 y eliminada desde el día siguiente. Ejemplo: creada el 01/12 → válida hasta el 04/12 → eliminada desde el 05/12 a las 00:00 si no se convirtió.
- **Tasa del día [S14, confirmado]:** la tasa **cambia por día entre semana**: de lunes a viernes rige la tasa con fecha de vigencia de ese día. **Sábados y domingos rige la tasa del lunes siguiente.** Los feriados entre semana siguen el mismo criterio: rige la tasa del siguiente día hábil. Para lograrlo, el sistema debe poder obtener y guardar la tasa del siguiente día hábil apenas esté publicada (por ejemplo, el viernes), **sin aplicarla antes de su fecha de vigencia**. Si la tasa que corresponde a ese día no está disponible, se usa la última disponible y se muestra el aviso de desactualización.

### R18. Validaciones numéricas y de texto **[S15]**
| Campo | Regla |
|---|---|
| Cantidad de una línea | Entero de 1 a 99.999 |
| Precio (divisas o referencial) | Mayor que 0,00 y hasta 1.000.000,00, con 2 decimales (0 o vacío = sin precio) |
| Descuento por porcentaje | Mayor que 0 y hasta 100 |
| Descuento por monto | Mayor que 0 y no puede superar la base a la que se aplica |
| Cotización o nota | Mínimo 1 línea y máximo 100; **total mayor que 0,00** (un descuento que deje el total en cero o negativo se rechaza) |
| Monto de un pago | Mayor que 0,00, con 2 decimales, sin superar el saldo pendiente |
| Referencia de transferencia o pago móvil | Obligatoria; 4 a 30 caracteres alfanuméricos |
| Motivo de anulación | 10 a 500 caracteres |
| Tasa BCV | Mayor que 0, hasta 8 decimales; una variación mayor al **15%** respecto a la anterior se rechaza si es automática y exige confirmación del admin si es manual |
| Nombre de cliente / usuario | 2 a 150 / 2 a 100 caracteres |
| Descripción de producto / categoría | Hasta 300 / 100 caracteres |
| Dirección | Hasta 300 caracteres |
| Contraseña | Mínimo 8 caracteres |
| Archivos Excel | Formato `.xlsx`, máximo 5 MB y 5.000 filas |

- Ante un dato inválido, el sistema muestra un mensaje claro en español indicando **el campo y la regla**; **nunca corrige datos en silencio**.
- Las mismas validaciones se aplican en la interfaz y en el servidor.

---

## 5. Diseño y experiencia (transversal a TODAS las fases)

### 5.1 Identidad visual
- Marca: **ProSalud Servicios Integrales**. Colores tomados del logo: verde ≈ `#80B038` y turquesa ≈ `#30A8B8` (aproximados; el agente debe definir una paleta completa y consistente a partir de ellos, con tonos para fondos, bordes, estados y texto).
- El logo se entrega en PNG con fondo blanco. Debe usarse en el sistema y en los PDF (en documentos sobre fondo blanco).
- Tono visual: salud, limpieza, confianza, profesionalidad.
- **Contraste:** el verde y el turquesa exactos del logo **no tienen contraste suficiente** para texto pequeño ni para texto blanco sobre ellos. La paleta debe incluir **tonos más oscuros** de ambos para botones, textos y enlaces, y reservar los tonos originales para fondos suaves, acentos e ilustración.
- La guía visual detallada (capas de profundidad, uso del color y bocetos estructurales de las pantallas clave) está en el **Anexo B**.

### 5.2 Estilo
- **Muy moderno, estilo Apple.** Interfaz limpia, mucho espacio en blanco, tipografía clara y jerarquizada, esquinas redondeadas, iconografía coherente.
- **Juego de profundidades:** superficies en capas, sombras suaves, desenfoques/translucidez en elementos flotantes (barras, menús, modales, hojas inferiores), transiciones y microinteracciones sutiles que den sensación de elevación y fluidez.
- Los estados (cargando con **skeletons**, vacío, error, éxito con **notificaciones**) deben estar diseñados, no ser texto plano (ver 5.6).
- Las animaciones deben ser suaves y discretas, nunca estorbar la velocidad de trabajo.

### 5.3 Responsive 100% y doble experiencia
- Todas las pantallas deben funcionar y verse bien en **teléfono, tablet y escritorio**, sin desbordes ni scroll horizontal accidental.
- **Escritorio:** vista amplia y completa (tablas densas, paneles laterales, atajos de trabajo rápido).
- **Móvil:** vista ligera, táctil y rápida pensada para vendedores en la calle: objetivos táctiles cómodos, navegación inferior o equivalente, formularios en pasos cuando convenga, tablas convertidas en tarjetas, acciones principales al alcance del pulgar.
- El flujo crítico (buscar producto → armar cotización → generar PDF → enviar por WhatsApp) debe poder hacerse **cómodamente a una mano desde el celular**.
- El sistema debe poder **instalarse en el celular como aplicación** (PWA). **[S10]**

### 5.4 Formato y lenguaje
- Todo en español.
- Números en **formato venezolano**: separador de miles con punto y decimales con coma (ej.: `1.234,56`). Dólares con símbolo `$`, bolívares con `Bs.`.
- Fechas en formato día/mes/año.
- Mostrar siempre **2 decimales** en dinero.

### 5.5 Accesibilidad y rendimiento
- Contraste legible, foco visible con teclado, etiquetas en formularios, mensajes de error claros.
- Búsquedas y listados con muchos registros (800+ productos) deben responder de forma fluida (búsqueda instantánea y **paginación real en el servidor**, ver 5.6).

### 5.6 Convenciones de interfaz obligatorias

**Tipografía — Poppins**
- Poppins es la fuente principal de todo el sistema (y de los PDF cuando sea posible).
- Se **mezclan pesos** para crear jerarquía: **Bold/SemiBold** para títulos y cifras destacadas, **Medium** para subtítulos, etiquetas y botones, **Regular** para el cuerpo de texto; un peso ligero solo para textos secundarios si aporta.
- Debe definirse una escala tipográfica (tamaños, pesos e interlineado) adaptada a móvil y escritorio, y usarse de forma consistente.
- La fuente debe cargarse sin parpadeos ni saltos de diseño visibles.

**Paginación real (servidor estable)**
- **Todo** listado del sistema (productos, clientes, cotizaciones, notas, pagos, deudas, usuarios, tasas, auditoría, vistas previas de importación) usa **paginación real del lado del servidor**: solo se consultan y envían los registros de la página actual.
- Búsqueda, filtros y orden se ejecutan en el servidor; el orden debe ser estable entre páginas.
- Cada respuesta incluye el total de registros y de páginas; el tamaño de página tiene un **límite máximo** que el cliente no puede superar.
- La página, la búsqueda y los filtros se reflejan en la URL, para poder volver atrás o compartir un enlace sin perder el estado.
- Los buscadores internos (por ejemplo, el de productos al armar una cotización) devuelven resultados **limitados y paginados**, con espera breve al escribir para no saturar el servidor.
- En móvil, la paginación debe ser cómoda para el pulgar (por ejemplo, "cargar más" o controles táctiles), siguiendo siendo paginación real.

**Skeletons en lugar de loaders**
- **No se usan spinners ni loaders genéricos** para cargar contenido.
- Cada pantalla, listado, tarjeta, formulario o gráfico tiene un **skeleton** que imita la forma del contenido real mientras carga.
- Cuando el usuario ejecuta una acción (guardar, pagar, importar), el botón pasa a un estado deshabilitado con texto de progreso (por ejemplo, "Guardando…") y se confirma con una notificación al terminar. Para procesos largos (importaciones, generación de PDF) se usa un estado de progreso basado en skeleton y mensaje, nunca un spinner.

**Notificaciones con Sonner**
- **Toda acción relevante** del sistema notifica su resultado con **Sonner**: éxito, error, advertencia, información y procesos en curso.
- Mensajes en español, breves y claros, que digan qué pasó (por ejemplo, "Cotización guardada", "No tienes permiso para anular notas").
- No se duplican notificaciones ni se saturan; las acciones destructivas o críticas (anular una nota, desactivar un usuario) piden **confirmación previa en un diálogo**, no solo una notificación.
- Las notificaciones deben verse bien y no estorbar en móvil ni escritorio, y respetar el estilo de profundidad del sistema.

---

## 6. Datos que el sistema debe conservar (nivel conceptual)

> No es un esquema de base de datos. Es la lista de información que debe existir y persistir; el agente diseña cómo.

- **Usuario:** nombre, correo/identificador de acceso, rol (admin | trabajador), activo/inactivo.
- **Categoría/Marca:** nombre (29 en la lista actual).
- **Producto:** categoría, descripción, Precio Divisas, Precio Referencial, estado de precio (completo / incompleto / sin precio), activo/inactivo. Sin stock, SKU ni lotes.
- **Cliente:** nombre, RIF/documento, dirección, teléfono.
- **Tasa BCV:** valor, **fecha de vigencia (fecha valor)**, fuente (API principal, respaldo o manual), quién la fijó si fue manual.
- **Cotización:** número, cliente (registrado o datos del cliente ocasional), creador, fecha, **fecha de vigencia (3 días)**, tasa BCV usada, descuentos, líneas, vínculo a la nota resultante (si existe). Las no convertidas se eliminan por completo al vencer, sin dejar rastro.
- **Línea (de cotización y de nota):** producto (con copia de su descripción y de ambos precios **al momento**), cantidad, descuento, saldo referencial pendiente (solo en nota).
- **Nota de entrega:** número, cliente, creador, fecha de emisión, tasa BCV de emisión, cotización de origen (opcional), tipo (contado/crédito), fecha de vencimiento (si crédito), estado derivado (pagada / pendiente / vencida / anulada), motivo y autor de anulación.
- **Pago/Abono:** nota, fecha, tasa BCV del día del pago, quién lo registró, y uno o más **medios de pago** (efectivo $, transferencia, pago móvil) con monto y referencia; además, cómo se aplicó a las líneas y cuánto saldo referencial canceló.
- **Registro de auditoría:** acción, usuario, fecha, detalle.
- **Configuración de empresa:** razón social, RIF, dirección, teléfonos, logo (usados en PDF).

Principio clave: **los documentos históricos nunca cambian** aunque cambien los precios, la tasa o el catálogo después (se guardan copias de los valores usados).

---

## 7. Mapa de fases

| Fase | Nombre | Subfases | Depende de |
|---|---|---|---|
| 0 | Fundamentos y sistema de diseño | 0.1 – 0.9 | — |
| 1 | Autenticación, usuarios y roles | 1.1 – 1.8 | 0 |
| 2 | Tasa BCV | 2.1 – 2.7 | 1 |
| 3 | Catálogo de productos | 3.1 – 3.9 | 1 |
| 4 | Clientes | 4.1 – 4.6 | 1 |
| 5 | Cotizaciones | 5.1 – 5.9 | 2, 3, 4 |
| 6 | Notas de entrega | 6.1 – 6.6 | 5 |
| 7 | Pagos, crédito y cuentas por cobrar | 7.1 – 7.10 | 6 |
| 8 | Documentos PDF y envío por WhatsApp | 8.1 – 8.7 | 7 |
| 9 | Estadísticas y alertas de cobro | 9.1 – 9.6 | 7 |
| 10 | Experiencia móvil, PWA y pulido | 10.1 – 10.8 | 0–9 |
| 11 | Pruebas integrales, carga de datos reales y entrega | 11.1 – 11.7 | 0–10 |

Total: **12 fases y 92 subfases**.

---

## 8. Fases detalladas

> **Formato:** cada fase se divide en **subfases** numeradas (`N.1`, `N.2`…) que son **microtareas secuenciales**. Cada subfase deja el sistema en un estado funcional y verificable. Al final de cada fase hay unos **criterios de cierre** que validan la fase completa. No se pasa a la siguiente subfase sin cumplir el "Listo cuando" de la actual.

---

### FASE 0 — Fundamentos y sistema de diseño

**Objetivo:** proyecto base desplegable, conectado a su base de datos, con identidad visual, convenciones de interfaz y componentes listos para reutilizar.

#### 0.1 Proyecto base y entornos
- **Debe lograr:** proyecto **Next.js** con TypeScript y Tailwind que arranca en local; configuración separada para desarrollo y producción (variables de entorno); archivo de decisiones del proyecto creado.
- **Listo cuando:** el proyecto arranca en local sin errores y existe el archivo de decisiones con los supuestos S1–S17 registrados.

#### 0.2 Conexión a la base de datos
- **Debe lograr:** conexión funcional a PostgreSQL en Neon mediante Prisma, en local.
- **Listo cuando:** una operación de lectura/escritura de prueba funciona contra la base de datos y se elimina después.

#### 0.3 Despliegue de prueba
- **Debe lograr:** aplicación desplegada en Vercel con su conexión a la base de datos en producción.
- **Listo cuando:** la URL de prueba abre y confirma conexión a la base de datos.

#### 0.4 Identidad visual y tipografía
- **Debe lograr:** paleta completa de ProSalud a partir de los colores del logo (ver 5.1 y Anexo B); **Poppins** cargada como fuente principal con sus pesos y jerarquía definida (sección 5.6); escala de espacios, radios, sombras y capas de profundidad.
- **Listo cuando:** existe un conjunto de estilos reutilizables y la fuente se ve aplicada sin parpadeos al cargar.

#### 0.5 Componentes base de interfaz
- **Debe lograr:** botones, campos, selectores, tarjetas, tablas con su versión móvil en tarjetas, insignias de estado, modales y hojas inferiores, diálogos de confirmación, estados vacíos.
- **Listo cuando:** cada componente existe con sus variantes y estados (normal, foco, deshabilitado, error).

#### 0.6 Sistema de carga (skeletons) y de notificaciones (Sonner)
- **Debe lograr:** biblioteca de **skeletons** reutilizables (texto, tarjeta, fila de tabla, formulario, gráfico, indicador) y sistema de **notificaciones con Sonner** con convención de mensajes en español (éxito, error, advertencia, información, proceso en curso).
- **Listo cuando:** ambos sistemas se pueden usar desde cualquier pantalla y respetan las reglas de la sección 5.6.

#### 0.7 Layout y navegación responsive
- **Debe lograr:** estructura general con logo; en escritorio, barra lateral; en móvil, navegación inferior; adaptable a todos los anchos.
- **Listo cuando:** la navegación funciona y se ve bien en teléfono, tablet y escritorio.

#### 0.8 Utilidades transversales y paginación base
- **Debe lograr:** formato venezolano de números, dinero y fechas; manejo de dinero con **decimales exactos** y la regla de **redondeo R16**; utilidades de fechas con la **zona horaria R17**; **componente y convención de paginación real** (página, tamaño, total, orden estable, estado en la URL, límite máximo de tamaño de página).
- **Listo cuando:** pruebas automatizadas de formato, redondeo (Anexo A.4) y aritmética monetaria pasan; la paginación base se puede enchufar a cualquier listado.

#### 0.9 Galería de componentes y cierre
- **Debe lograr:** una página interna que muestre todos los componentes, skeletons, notificaciones y estilos tipográficos.
- **Listo cuando:** se cumplen los criterios de cierre.

**Criterios de cierre de la Fase 0**
- [ ] La aplicación está desplegada en una URL de prueba y conectada a la base de datos en local y en producción.
- [ ] El layout se adapta a teléfono, tablet y escritorio.
- [ ] La galería muestra todos los componentes, skeletons y notificaciones.
- [ ] Los montos salen en formato `1.234,56` y las pruebas de redondeo del Anexo A.4 pasan.
- [ ] Poppins se aplica en todo el sistema con la jerarquía definida.
- [ ] Existe el archivo de decisiones con los supuestos S1–S17.

---

### FASE 1 — Autenticación, usuarios y roles

**Objetivo:** acceso seguro al sistema con los dos roles definidos.

#### 1.1 Modelo de usuarios y primer administrador
- **Debe lograr:** almacenamiento de usuarios con rol (admin/trabajador) y estado activo/inactivo; creación del primer administrador en la puesta en marcha.
- **Listo cuando:** existe un admin inicial en la base de datos y no hay registro público.

#### 1.2 Pantalla de inicio de sesión
- **Debe lograr:** login con validaciones, mensajes de error claros y notificaciones; diseño acorde al sistema, adaptado a móvil.
- **Listo cuando:** un usuario válido entra; uno inválido o inactivo recibe un mensaje claro sin revelar detalles sensibles.

#### 1.3 Sesión y cierre de sesión
- **Debe lograr:** sesión persistente razonable en celular, expiración controlada y cierre de sesión manual.
- **Listo cuando:** la sesión se mantiene al recargar y se destruye al cerrarla.

#### 1.4 Protección de rutas
- **Debe lograr:** todas las pantallas del sistema exigen sesión; sin sesión se redirige al login y, tras entrar, se vuelve al destino original.
- **Listo cuando:** ninguna pantalla ni dato es accesible sin sesión.

#### 1.5 Autorización por rol
- **Debe lograr:** reglas de R12 aplicadas **en el servidor** a cada operación; menú y pantallas que muestran solo lo permitido por rol.
- **Listo cuando:** un trabajador que intenta una acción de admin (incluso directamente) recibe rechazo y notificación clara.

#### 1.6 Listado de usuarios (admin)
- **Debe lograr:** listado **paginado** de usuarios con rol y estado, con skeleton de carga.
- **Listo cuando:** el admin ve los usuarios paginados; el trabajador no accede.

#### 1.7 Crear, editar y desactivar usuarios
- **Debe lograr:** crear, editar, desactivar/reactivar usuarios y restablecer acceso, con notificaciones de cada acción.
- **Listo cuando:** un usuario desactivado no puede entrar ni mantener sesión activa.

#### 1.8 Auditoría base
- **Debe lograr:** registro de acciones sensibles con usuario, fecha y detalle (R14) y vista **paginada** para el admin.
- **Listo cuando:** las acciones de usuarios aparecen en la auditoría.

**Criterios de cierre de la Fase 1**
- [ ] Un visitante sin sesión no ve ni consume nada del sistema.
- [ ] Un trabajador no puede ejecutar acciones reservadas al admin.
- [ ] El admin gestiona usuarios; un usuario desactivado queda fuera.
- [ ] La sesión funciona bien en celular.
- [ ] Menú y pantallas respetan el rol.
- [ ] Las acciones de usuarios quedan auditadas y todos los listados están paginados.

---

### FASE 2 — Tasa BCV

**Objetivo:** disponer siempre de una tasa confiable, con respaldo y con historial.

#### 2.1 Almacenamiento e historial de tasas
- **Debe lograr:** guardar cada tasa con su valor, su **fecha de vigencia (fecha valor)**, fuente y autor (si es manual); debe poder guardarse una tasa **antes** de que entre en vigencia (por ejemplo, la del lunes si ya está publicada el viernes) sin aplicarse antes de su fecha; el historial no se altera retroactivamente.
- **Listo cuando:** se puede guardar y consultar una tasa con todos sus datos.

#### 2.2 Fuente principal automática
- **Debe lograr:** obtención automática de la tasa BCV del día desde una fuente principal.
- **Listo cuando:** el sistema obtiene y guarda la tasa del día sin intervención.

#### 2.3 Fuente de respaldo y lógica de fallback
- **Debe lograr:** segunda fuente que se usa si la principal falla o devuelve datos inválidos; el uso del respaldo queda registrado.
- **Listo cuando:** al simular la caída de la principal, se usa el respaldo y se registra.

#### 2.4 Actualización diaria y validaciones
- **Debe lograr:** actualización automática programada con la frecuencia necesaria para capturar cada tasa apenas se publique (incluida la del siguiente día hábil); rechazo de valores no numéricos, cero, negativos o variaciones superiores al umbral de R18 respecto a la anterior (rechazo en modo automático; confirmación del admin en modo manual).
- **Listo cuando:** una tasa inválida no se guarda y la tasa se refresca sola cada día.

#### 2.5 Entrada manual (admin)
- **Debe lograr:** el admin puede fijar la tasa manualmente (con confirmación si la variación es grande); queda auditado; el trabajador no puede.
- **Listo cuando:** una tasa manual queda con su autor y un trabajador no puede fijarla.

#### 2.6 Indicador global de tasa y aviso de desactualización
- **Debe lograr:** indicador visible en toda la aplicación con valor, fecha y fuente; aviso destacado de desactualización según R17 (cuando no hay una tasa disponible para el día, incluidos fines de semana y feriados); si fallan todas las fuentes, se sigue operando con la última tasa válida marcada como desactualizada.
- **Listo cuando:** el indicador se ve bien en móvil y escritorio y el aviso aparece al simular falta de tasa.

#### 2.7 Pantalla de historial de tasas
- **Debe lograr:** historial **paginado** con valor, fecha, fuente y autor.
- **Listo cuando:** el historial es consultable y paginado.

**Criterios de cierre de la Fase 2**
- [ ] La tasa del día se obtiene sola.
- [ ] Si falla la principal, entra el respaldo; si fallan ambas, se usa la última tasa con aviso y el admin puede fijarla.
- [ ] Un trabajador no puede fijar la tasa.
- [ ] Cada tasa indica su fuente y autor si fue manual.
- [ ] El historial es consultable y no alterable.

---

### FASE 3 — Catálogo de productos

**Objetivo:** catálogo completo con dos precios por producto, mantenible por el admin y consultable por todos.

#### 3.1 Modelo de categorías y productos
- **Debe lograr:** almacenar categorías y productos con Precio Divisas, Precio Referencial y estado de precio (completo / incompleto / sin precio); sin stock, SKU ni lotes.
- **Listo cuando:** se pueden guardar productos con ambos precios y con estados de precio correctos.

#### 3.2 Listado paginado con búsqueda y filtros
- **Debe lograr:** listado de productos con **paginación real en el servidor**, búsqueda instantánea por descripción y categoría, filtros por categoría y estado de precio; skeletons de carga; en móvil, tarjetas.
- **Listo cuando:** con 800+ productos el listado responde fluido y solo se traen los registros de la página actual.

#### 3.3 Detalle de producto
- **Debe lograr:** vista con ambos precios y el equivalente en Bs a la tasa vigente.
- **Listo cuando:** el detalle muestra los valores correctos al centavo.

#### 3.4 Gestión de categorías (admin)
- **Debe lograr:** crear, editar y desactivar categorías.
- **Listo cuando:** el admin gestiona categorías; el trabajador no.

#### 3.5 Gestión de productos (admin)
- **Debe lograr:** crear, editar y desactivar productos (no se eliminan si ya están en documentos); cambios de precio auditados.
- **Listo cuando:** el admin cambia precios y queda auditado; el trabajador solo consulta.

#### 3.6 Importación: carga y lectura del Excel
- **Debe lograr:** subir el Excel con la estructura de `Lista_de_Precios_Agosto_2026.xlsx` (N°, Categoría/Marca, Descripción, PVP Divisas ($), PVP Bs ($); se ignora la columna de estado por fórmula) y leerlo validando formato.
- **Listo cuando:** un archivo válido se lee completo y uno con formato incorrecto produce un mensaje claro sin afectar datos.

#### 3.7 Importación: vista previa
- **Debe lograr:** antes de aplicar, mostrar cuántos productos se crearán, actualizarán, quedarán sin cambios o tienen problemas; los cambios de precio detectados; duplicados dentro del archivo; filas inválidas con fila y motivo. Vista previa **paginada**.
- **Listo cuando:** la vista previa es fiel a lo que se aplicará.

#### 3.8 Importación: aplicación y reporte final
- **Debe lograr:** al confirmar, crear/actualizar sin duplicar (identificación por categoría + descripción); importar todos los productos incluidos los sin precio (quedan "sin precio") y los de un solo precio (quedan "incompleto") **[S1]**; reporte final de creados, actualizados, omitidos y errores; notificación de resultado.
- **Listo cuando:** importar el archivo de prueba del **Anexo A.1** produce exactamente los resultados esperados, y luego importar el Excel real carga ~801 productos y 29 categorías, con 92 sin precio marcados y los de un solo precio incompletos. Se respetan los límites de archivo de R18.

#### 3.9 Actualización masiva repetible
- **Debe lograr:** reimportar el mismo archivo no duplica nada; un archivo con precios modificados actualiza solo lo que cambió.
- **Listo cuando:** ambas pruebas pasan y los cambios de precio quedan auditados.

**Criterios de cierre de la Fase 3**
- [ ] El Excel real se importa completo con el estado de precio correcto.
- [ ] Reimportar no duplica; actualizar solo modifica lo que cambió, con vista previa.
- [ ] Un archivo inválido no corrompe datos y da reporte claro.
- [ ] La búsqueda y la paginación son fluidas con el catálogo completo, en móvil y escritorio.
- [ ] El trabajador solo consulta.
- [ ] Cambiar un precio no altera documentos existentes (se verifica en fases 5 y 6).

---

### FASE 4 — Clientes

**Objetivo:** base de clientes completa, buscable y lista para cotizar y llevar crédito.

#### 4.1 Modelo de clientes
- **Debe lograr:** almacenar nombre, RIF/documento, dirección y teléfono, con estado activo/inactivo.
- **Listo cuando:** se pueden guardar y recuperar clientes con todos sus datos.

#### 4.2 Listado paginado con búsqueda
- **Debe lograr:** listado con **paginación real en el servidor** y búsqueda instantánea por nombre, RIF o teléfono; skeletons; tarjetas en móvil.
- **Listo cuando:** la búsqueda y la paginación son fluidas.

#### 4.3 Crear cliente con validaciones
- **Debe lograr:** alta (admin y trabajador **[S7]**) con validación de RIF/documento venezolano (V, E, J, G, P o C + número), bloqueo de duplicados por RIF y normalización del teléfono para WhatsApp.
- **Listo cuando:** `0414-1234567` y `414 1234567` quedan normalizados; no se puede duplicar un RIF.

#### 4.4 Editar y desactivar (admin)
- **Debe lograr:** edición y desactivación solo para admin; los clientes con documentos no se eliminan.
- **Listo cuando:** el trabajador no puede editar ni eliminar.

#### 4.5 Ficha del cliente
- **Debe lograr:** vista con datos y espacio preparado para historial de compras y estado de cuenta (se completan en fases 6 y 7).
- **Listo cuando:** la ficha existe y está lista para recibir esas secciones.

#### 4.6 Importación de clientes desde Excel
- **Debe lograr:** importar nombre, RIF, dirección y teléfono con vista previa **paginada**, detección de duplicados y filas inválidas, y reporte final.
- **Listo cuando:** el Excel real de clientes se importa con reporte claro.

**Criterios de cierre de la Fase 4**
- [ ] El Excel de clientes se importa con reporte de creados, duplicados y errores.
- [ ] Es imposible duplicar un RIF.
- [ ] Los teléfonos quedan normalizados.
- [ ] El trabajador crea y consulta pero no edita ni elimina.
- [ ] Búsqueda y paginación fluidas en móvil.

---

### FASE 5 — Cotizaciones

**Objetivo:** que un vendedor arme una cotización completa desde el celular en pocos pasos.

#### 5.1 Modelo de cotización y numeración
- **Debe lograr:** almacenar cotizaciones y líneas con copia de descripción y de ambos precios al momento; serie de numeración propia **[S6]**, segura ante concurrencia.
- **Listo cuando:** dos usuarios creando a la vez nunca obtienen el mismo número.

#### 5.2 Listado paginado de cotizaciones
- **Debe lograr:** listado **paginado en el servidor** con búsqueda y filtros (cliente, fecha, creador, convertida o no); todos ven todas.
- **Listo cuando:** el listado es fluido, muestra al creador y para cada cotización indica cuánto le queda de vigencia (por ejemplo, "vence en 2 días").

#### 5.3 Selección o alta de cliente
- **Debe lograr:** elegir un cliente existente o crear uno al vuelo **[S2]**.
- **Listo cuando:** se puede iniciar una cotización con cliente nuevo sin salir del flujo.

#### 5.4 Agregar productos y cantidades
- **Debe lograr:** buscador de productos (resultados limitados y paginados) y alta de líneas con cantidad; solo productos con ambos precios completos (R1).
- **Listo cuando:** un producto sin precio completo no puede agregarse.

#### 5.5 Totales dobles y tasa
- **Debe lograr:** mostrar siempre los **dos totales** (efectivo $ y Bs) y la tasa con su fecha (R3), con cálculos exactos.
- **Listo cuando:** los totales coinciden al centavo con los casos de prueba.

#### 5.6 Descuentos
- **Debe lograr:** descuentos por porcentaje o monto, por línea y/o a toda la orden (R9, S5), registrados.
- **Listo cuando:** los descuentos recalculan ambos totales correctamente y quedan auditados.

#### 5.7 Guardar, ver, editar y duplicar
- **Debe lograr:** guardar la cotización; ver su detalle; editarla mientras no esté convertida; duplicarla; mostrar "Convertida en Nota N° X" cuando aplique.
- **Listo cuando:** cambiar precios del catálogo o la tasa después no altera cotizaciones ya guardadas.

#### 5.8 Flujo móvil de la cotización
- **Debe lograr:** el proceso completo (cliente → productos → descuentos → guardar) cómodo a una mano en el celular, con totales siempre visibles, siguiendo el boceto del **Anexo B.3**.
- **Listo cuando:** se crea una cotización completa desde un teléfono en un flujo corto.

#### 5.9 Expiración automática de cotizaciones
- **Debe lograr:** eliminar automáticamente, con un proceso diario, toda cotización no convertida cuya vigencia de 3 días ya terminó (R3, R17); las convertidas se conservan; no se conserva ningún registro de las eliminadas **[S17]**; la vigencia se muestra en el detalle, el listado y el PDF.
- **Listo cuando:** el caso del **Anexo A.3** (punto 4) se cumple: una cotización creada el 01/12 desaparece el 05/12 a las 00:00 si no se convirtió, y una convertida a tiempo se conserva.

**Criterios de cierre de la Fase 5**
- [ ] Una cotización completa se crea cómodamente desde un teléfono.
- [ ] Los dos totales y la tasa se muestran siempre y son exactos.
- [ ] No se agregan productos sin precio completo.
- [ ] Los descuentos funcionan y quedan registrados.
- [ ] Cambios posteriores de precio o tasa no alteran cotizaciones existentes.
- [ ] La numeración no se duplica con uso simultáneo.
- [ ] Todos los usuarios ven todas las cotizaciones y el listado está paginado.
- [ ] Las cotizaciones no convertidas desaparecen solas tras su vigencia de 3 días, y las convertidas se conservan.

---

### FASE 6 — Notas de entrega

**Objetivo:** convertir cotizaciones aceptadas (o crear ventas directas) en notas de entrega formales, numeradas y con valores congelados.

#### 6.1 Modelo de nota y numeración desde 00
- **Debe lograr:** almacenar notas y líneas (con copia de descripción, cantidad, ambos precios, descuentos y **saldo referencial** inicial igual al total referencial de la línea); tasa de emisión congelada; serie propia que **arranca en 00**, consecutiva y segura ante concurrencia (R10).
- **Listo cuando:** la primera nota es la N° 00 y emisiones simultáneas no duplican ni saltan números.

#### 6.2 Crear nota directa
- **Debe lograr:** crear una nota sin cotización previa (cliente, productos, descuentos, totales dobles).
- **Listo cuando:** la nota se emite con la tasa vigente y los valores correctos.

#### 6.3 Convertir cotización en nota
- **Debe lograr:** botón de conversión desde la cotización; la nota queda vinculada a su cotización de origen y viceversa; la cotización pasa a solo lectura y no puede convertirse dos veces (R3, R4).
- **Listo cuando:** la conversión genera la nota con todas las líneas y el intento de segunda conversión es imposible.

#### 6.4 Aviso de cambio de tasa al convertir
- **Debe lograr:** la nota conserva los precios de la cotización; si la tasa BCV cambió desde que se cotizó, mostrar antes de emitir el total en Bs de la cotización y el nuevo, para que el vendedor lo comunique al cliente **[S3]**.
- **Listo cuando:** una prueba con la tasa modificada muestra el aviso y la nota se emite con los precios de la cotización y la tasa vigente.

#### 6.5 Listado y detalle de notas
- **Debe lograr:** listado **paginado en el servidor** con búsqueda y filtros (cliente, fecha, creador, estado: pagada / pendiente / vencida / anulada); detalle con líneas, totales dobles, tasa congelada, origen y espacio para pagos (Fase 7). Todos ven todas.
- **Listo cuando:** el listado es fluido y el detalle muestra todo correctamente.

#### 6.6 Anulación
- **Debe lograr:** solo el admin puede anular, con **motivo obligatorio** (R11); la nota anulada sigue visible con motivo, autor y fecha; su número no se reutiliza; las notas emitidas no se editan; todo auditado.
- **Listo cuando:** un trabajador no puede anular y el admin sí, con confirmación y notificación.

**Criterios de cierre de la Fase 6**
- [ ] Convertir una cotización genera la nota y deja ambas vinculadas; no se puede convertir dos veces.
- [ ] Si la tasa cambió desde la cotización, el sistema avisa y la nota conserva los precios de la cotización.
- [ ] La primera nota es la N° 00 y la numeración es consecutiva sin duplicados con uso simultáneo.
- [ ] La tasa de emisión queda guardada y no cambia.
- [ ] Solo el admin anula, con motivo; la anulada sigue visible.
- [ ] Cambios posteriores de precios o tasa no alteran notas emitidas.
- [ ] Todos ven todas las notas y el listado está paginado.

---

### FASE 7 — Pagos, crédito y cuentas por cobrar

**Objetivo:** registrar cómo y cuánto paga cada cliente y llevar con exactitud quién debe, cuánto y desde cuándo.

#### 7.1 Motor de cálculo de pagos (primero, con pruebas)
- **Debe lograr:** implementar la lógica de R5, R6 y R7 (pago por línea, Precio Divisas, conversión de Bs con la tasa del día del pago, saldo en $ referenciales, saldo exacto en 0,00 al cubrir) **antes** de cualquier pantalla, respaldada por pruebas automatizadas.
- **Listo cuando:** el ejemplo **R15 (casos A a E) y los casos de redondeo del Anexo A.4 pasan exactamente al centavo** como pruebas automatizadas.

#### 7.2 Modelo de pagos y medios de pago
- **Debe lograr:** almacenar pagos con fecha, tasa BCV del día, autor y uno o más medios (efectivo $, transferencia, pago móvil) con monto y referencia; y cómo se aplicó cada pago a las líneas y cuánto saldo referencial canceló.
- **Listo cuando:** un pago se guarda de forma atómica (completo o no se aplica) y no permite superar el saldo.

#### 7.3 Pantalla de pago — modo por productos
- **Debe lograr:** (siguiendo el boceto del **Anexo B.4**) el usuario marca qué líneas paga en efectivo $ (precio de divisas) y el resto en Bs; resumen previo a confirmar con saldo pendiente en $ referenciales y su equivalente en Bs a la tasa del día.
- **Listo cuando:** coincide con los casos A y B de R15.

#### 7.4 Pantalla de pago — modo por monto
- **Debe lograr:** el usuario escribe un monto; el sistema reparte por defecto según el orden de líneas con la última parcial (R6); opción de elegir manualmente las líneas que cubre el efectivo.
- **Listo cuando:** coincide con los casos C y D de R15 y el resumen muestra el efecto antes de confirmar.

#### 7.5 Combinación de métodos y referencias
- **Debe lograr:** un mismo pago puede combinar efectivo $, transferencia y pago móvil, con referencia obligatoria donde aplique.
- **Listo cuando:** un pago combinado se reparte y registra correctamente.

#### 7.6 Pago al emitir, contado y crédito
- **Debe lograr:** registrar pagos en el momento de emitir la nota: totalmente pagada = contado; con saldo = crédito con vencimiento a 10 días **[S4]**; una nota a crédito exige cliente registrado (R8).
- **Listo cuando:** emitir una nota con pago parcial deja saldo, tipo crédito y fecha de vencimiento correctos, incluyendo el caso de zona horaria del **Anexo A.3**.

#### 7.7 Abonos posteriores y estado derivado
- **Debe lograr:** registrar abonos después de la emisión con la tasa del día del abono; el estado de la nota se deriva solo: pagada, pendiente, vencida o anulada.
- **Listo cuando:** al llegar el saldo a cero la nota pasa a pagada sola; si pasa el vencimiento con saldo, aparece vencida.

#### 7.8 Historial de pagos y estado de cuenta por cliente
- **Debe lograr:** historial de pagos por nota y por cliente (con quién lo registró); estado de cuenta con notas pendientes, saldos, abonos, vencimientos y total adeudado, integrado a la ficha del cliente.
- **Listo cuando:** el estado de cuenta es correcto y el historial de compras del cliente ya aparece.

#### 7.9 Panel de cuentas por cobrar
- **Debe lograr:** lista **paginada** de todas las deudas, con orden por vencimiento, filtros por cliente, vencidas y próximas a vencer, y totales.
- **Listo cuando:** filtros y totales son correctos y las notas anuladas no cuentan.

#### 7.10 Robustez y cierre
- **Debe lograr:** verificación de concurrencia (dos usuarios pagando la misma nota), de no sobrepago y de auditoría completa de pagos **[S12]**.
- **Listo cuando:** se cumplen los criterios de cierre.

**Criterios de cierre de la Fase 7**
- [ ] R15 (casos A a E) se reproduce exactamente al centavo en pruebas automatizadas.
- [ ] Un pago combinado se registra y reparte bien.
- [ ] Un abono usa la tasa del día del abono.
- [ ] El saldo queda en 0,00 exacto y la nota pasa a pagada sola.
- [ ] No se puede pagar más que el saldo.
- [ ] Una nota con saldo y vencimiento pasado aparece como vencida.
- [ ] Estado de cuenta y cuentas por cobrar muestran datos correctos y paginados.
- [ ] El trabajador registra pagos pero no anula notas.
- [ ] Pagos simultáneos sobre la misma nota no generan saldos incorrectos.

---

### FASE 8 — Documentos PDF y envío por WhatsApp

**Objetivo:** generar documentos formales con la identidad de ProSalud y compartirlos con el cliente en un clic.

#### 8.1 Configuración de empresa
- **Debe lograr:** datos de la empresa editables por el admin (razón social, RIF, dirección, teléfonos, logo) para usarlos en los documentos.
- **Listo cuando:** los datos precargados son **ProSalud Servicios Integrales, C.A.**, RIF **J-50435652-2** y dirección *Av 6 Edif Chama Piso 1 Apt A-1, Sector Las Acacias, Pquia Juan Ignacio Montilla, Mcipio Valera, Trujillo, Zona Postal 3101*.

#### 8.2 PDF de la cotización
- **Debe lograr:** documento con encabezado de empresa, datos del cliente, líneas, **ambos totales** (efectivo $ y Bs) y la tasa con su fecha, sin pagos; indica claramente hasta qué fecha es válida (3 días); tipografía Poppins cuando sea posible.
- **Listo cuando:** se ve profesional y los valores son los originales congelados.

#### 8.3 PDF de la nota de entrega
- **Debe lograr:** (siguiendo el boceto del **Anexo B.6**) basado en el formato impreso actual: logo, razón social, RIF, dirección, título "NOTA DE ENTREGA", número, fecha, cliente, tabla de líneas, totales en ambas modalidades, tasa usada, pagos registrados, saldo y vencimiento si es crédito, y marca de agua discreta del logo.
- **Listo cuando:** se imprime bien en tamaño carta y reabrirla meses después muestra los mismos valores.

#### 8.4 Estados del documento y descarga
- **Debe lograr:** marca clara de **ANULADA** cuando corresponda; descarga e impresión siempre disponibles; generación que se siente inmediata, con skeleton mientras se prepara.
- **Listo cuando:** una nota anulada muestra la marca y la descarga funciona en móvil y escritorio.

#### 8.5 Envío por WhatsApp en celular
- **Debe lograr:** botón que abre WhatsApp con el cliente ya seleccionado (teléfono normalizado) y un mensaje prellenado, usando el mecanismo nativo de compartir para adjuntar el PDF. **No** se usa la API de WhatsApp Business.
- **Listo cuando:** desde un celular, "generar → enviar" abre el chat del cliente con el PDF listo.

#### 8.6 Alternativa en escritorio y casos límite
- **Debe lograr:** en escritorio o si el dispositivo no soporta compartir archivos: descargar el PDF, abrir el chat del cliente con el mensaje e indicar que se adjunte el archivo; si el cliente no tiene teléfono válido, avisar y permitir escribirlo.
- **Listo cuando:** ambos casos funcionan con notificaciones claras.

#### 8.7 Recordatorio de cobro
- **Debe lograr:** botón en el estado de cuenta del cliente que abre WhatsApp con un mensaje prellenado con saldo y vencimiento.
- **Listo cuando:** el mensaje incluye saldo y vencimiento correctos.

**Criterios de cierre de la Fase 8**
- [ ] El PDF de la nota incluye todos los elementos y se ve profesional impreso.
- [ ] El PDF de la cotización muestra los dos totales y la tasa.
- [ ] Reabrir un PDF muestra valores idénticos a los originales.
- [ ] En celular, el flujo hasta WhatsApp funciona con el PDF listo.
- [ ] Sin teléfono válido, el sistema lo indica y permite corregirlo.
- [ ] Las notas anuladas muestran ANULADA.
- [ ] El recordatorio de cobro es correcto.

---

### FASE 9 — Estadísticas y alertas de cobro

**Objetivo:** que la dueña vea de un vistazo cómo va el negocio y qué debe cobrar.

#### 9.1 Indicadores del mes
- **Debe lograr:** (siguiendo el boceto del **Anexo B.5**) total vendido y total cobrado **[S11]**, cantidad de notas emitidas y de cotizaciones convertidas en notas (no hay tasa de conversión, porque las cotizaciones vencidas no dejan registro); comparativo con el mes anterior; con skeletons de carga.
- **Listo cuando:** las cifras coinciden con el conjunto de datos de prueba del **Anexo A.2**.

#### 9.2 Ventas mensuales
- **Debe lograr:** gráfico de evolución mensual de ventas.
- **Listo cuando:** el gráfico es correcto y legible en móvil.

#### 9.3 Rankings
- **Debe lograr:** productos más vendidos, clientes que más compran y ventas por trabajador.
- **Listo cuando:** los rankings coinciden con los datos de prueba.

#### 9.4 Cobros y cuentas por cobrar
- **Debe lograr:** cobros por método de pago; total por cobrar, deuda vencida y próxima a vencer.
- **Listo cuando:** los totales coinciden con el panel de cuentas por cobrar.

#### 9.5 Alertas de cobro
- **Debe lograr:** al entrar, alertas de notas vencidas y próximas a vencer (por ejemplo, en los próximos 3 días), con acceso directo al cliente y al recordatorio por WhatsApp. No hay alertas de inventario (R13).
- **Listo cuando:** las alertas aparecen correctamente y llevan al cliente.

#### 9.6 Filtros por fecha y permisos
- **Debe lograr:** filtros por rango de fechas con recálculo de totales; los trabajadores ven el panel en solo lectura **[S8]**; las notas anuladas no cuentan.
- **Listo cuando:** los filtros y permisos funcionan.

**Criterios de cierre de la Fase 9**
- [ ] Las cifras coinciden con los datos reales de notas y pagos.
- [ ] Las notas anuladas no afectan ningún indicador.
- [ ] Las alertas de vencidas y próximas a vencer son correctas.
- [ ] El panel es usable en móvil, con gráficos adaptados y skeletons de carga.
- [ ] Los filtros por fecha recalculan los totales.

---

### FASE 10 — Experiencia móvil, PWA y pulido

**Objetivo:** que el sistema se sienta como una aplicación nativa, rápida y refinada en cualquier dispositivo.

#### 10.1 Auditoría responsive completa
- **Debe lograr:** revisar todas las pantallas en teléfono pequeño y grande, tablet, portátil y monitor ancho.
- **Listo cuando:** no hay desbordes, textos cortados ni elementos inalcanzables.

#### 10.2 Instalación como aplicación (PWA)
- **Debe lograr:** instalable en el celular con ícono y nombre de ProSalud y pantalla completa **[S10]**.
- **Listo cuando:** se instala y abre como aplicación.

#### 10.3 Pulido visual y profundidad
- **Debe lograr:** refinar el estilo Apple: transiciones, hojas inferiores en móvil, desenfoques, sombras y capas coherentes en todas las pantallas.
- **Listo cuando:** el estilo es consistente y moderno en todo el sistema.

#### 10.4 Rendimiento
- **Debe lograr:** carga inicial rápida, listados grandes fluidos, sin parpadeos; consultas eficientes que mantengan el servidor estable bajo uso simultáneo.
- **Listo cuando:** las pantallas principales cargan rápido en conexión móvil normal.

#### 10.5 Skeletons, notificaciones y paginación — auditoría de consistencia
- **Debe lograr:** verificar que **ningún** lugar use spinners, que **todo** listado esté paginado en el servidor y que **toda** acción relevante notifique con Sonner.
- **Listo cuando:** la revisión no encuentra excepciones.

#### 10.6 Accesibilidad básica
- **Debe lograr:** contraste legible, foco visible, etiquetas en formularios y mensajes de error claros.
- **Listo cuando:** la revisión de accesibilidad no encuentra fallos básicos.

#### 10.7 Errores y conectividad
- **Debe lograr:** mensajes amables ante fallas de red o servidor, sin perder lo que el usuario estaba escribiendo (por ejemplo, una cotización a medio armar).
- **Listo cuando:** al simular una falla de red no se pierde el trabajo en curso.

#### 10.8 Revisión de textos y formatos
- **Debe lograr:** coherencia de textos en español y de formatos de números, fechas y monedas.
- **Listo cuando:** no hay inconsistencias.

**Criterios de cierre de la Fase 10**
- [ ] No hay desbordes en ningún ancho soportado.
- [ ] El sistema se instala y abre como aplicación.
- [ ] El flujo completo (cotizar → convertir → cobrar → enviar PDF) se hace cómodamente a una mano desde el celular.
- [ ] Las pantallas principales cargan rápido.
- [ ] Una falla de red no destruye el trabajo en curso.
- [ ] Estilo consistente, con profundidad, Poppins, skeletons y Sonner en todas las pantallas.

---

### FASE 11 — Pruebas integrales, carga de datos reales y entrega

**Objetivo:** validar todo el sistema con datos y escenarios reales y dejarlo listo para operar.

#### 11.1 Pruebas automatizadas de reglas críticas
- **Debe lograr:** pruebas de dinero (R5–R9, R15, R16), fechas y vencimientos (R17, Anexo A.3), validaciones (R18), numeración concurrente y permisos; y verificación de los conjuntos de prueba del Anexo A.
- **Listo cuando:** todas pasan.

#### 11.2 Flujos de extremo a extremo
- **Debe lograr:** probar los 7 flujos: (1) cotización → nota → pago total en efectivo $; (2) cotización → nota → pago por productos mixto; (3) nota a crédito → abonos en Bs y efectivo $ → saldo cero; (4) anulación por el admin con motivo; (5) fallo de la fuente de tasa y uso del respaldo y de la manual; (6) importación inicial y actualización masiva de precios; (7) permisos: toda acción prohibida al trabajador falla en el servidor.
- **Listo cuando:** los 7 flujos pasan sin errores.

#### 11.3 Revisión de seguridad
- **Debe lograr:** rutas y datos protegidos, sin datos sensibles expuestos, secretos fuera del código.
- **Listo cuando:** la revisión no encuentra fallos.

#### 11.4 Carga de datos reales en producción
- **Debe lograr:** importar el catálogo (Excel de precios) y los clientes (Excel de clientes); crear los usuarios iniciales; configurar los datos de empresa.
- **Listo cuando:** producción contiene los datos reales y se verifican por muestreo.

#### 11.5 Verificación de persistencia
- **Debe lograr:** comprobar que los datos persisten y se conservan correctamente tras reinicios y nuevos despliegues.
- **Listo cuando:** no se pierde ningún dato.

#### 11.6 Documentación
- **Debe lograr:** guía de uso breve para la dueña y los trabajadores (crear cotización, convertir, cobrar, enviar por WhatsApp, actualizar precios con Excel, qué hacer si la tasa falla) y documentación técnica del proyecto; lista de mejoras futuras (incluido el inventario).
- **Listo cuando:** ambos documentos existen y cubren los flujos principales.

#### 11.7 Entrega final
- **Debe lograr:** sistema desplegado y operativo en su dirección final.
- **Listo cuando:** se cumple la definición de "terminado" global.

**Criterios de cierre de la Fase 11**
- [ ] Los 7 flujos de extremo a extremo pasan.
- [ ] Las pruebas automatizadas de dinero, numeración y permisos pasan, incluido R15.
- [ ] Producción contiene los datos reales y los usuarios iniciales.
- [ ] Ninguna acción restringida es posible para un trabajador.
- [ ] La guía de uso existe.
- [ ] El sistema está desplegado y operativo.

---

## 9. Fuera de alcance (versión 1)

- Control de inventario: stock, descuento automático, alertas de inventario bajo, entradas de mercancía, lotes, SKU, fechas de vencimiento. *(Se agregará más adelante solo si la dueña lo solicita; el diseño de datos no debe impedirlo.)*
- Factura fiscal, recibos de pago o cualquier documento distinto de cotización y nota de entrega.
- API de WhatsApp Business o envío automático sin intervención del usuario.
- Estados en las cotizaciones (la eliminación automática a los 3 días sí está dentro del alcance).
- Multi-sucursal, multi-empresa o multi-moneda más allá de $ y Bs.
- Pasarelas de pago o integración bancaria.
- Impuestos (IVA/IGTF) en los documentos.

---

## 10. Supuestos registrados (validar con el cliente cuando sea posible)

| ID | Supuesto |
|---|---|
| S1 | Un producto sin precio, o con solo uno de los dos precios, no puede cotizarse hasta completarse. Se importa igualmente. |
| S2 | Al cotizar se puede crear un cliente nuevo al vuelo. |
| S3 | **(Corregido por el cliente)** La cotización dura 3 días (día 0 = creación) y se elimina sola si no se convierte. Al convertirla, la nota conserva sus precios y toma la tasa vigente, avisando si la tasa cambió. |
| S4 | Una nota puede tener un pago parcial al emitirse y el resto a crédito. Pagada por completo al emitir = contado. |
| S5 | **(Existencia confirmada por el cliente; la forma de aplicarlo es supuesto)** Los descuentos manuales (R9) se dan a una línea o a la orden; se aplican proporcionalmente a ambos precios; uno por monto se define en $ referenciales y se traslada con el factor de divisas. Aclarado: el Precio Divisas **no** es un descuento, son dos precios fijos. |
| S6 | Cotizaciones y notas de entrega tienen series de numeración separadas. |
| S7 | **(Confirmado)** Los trabajadores pueden crear y consultar clientes (no editarlos ni borrarlos) y registrar pagos y abonos. |
| S8 | Los trabajadores ven las estadísticas en solo lectura. |
| S9 | Existe un registro de auditoría de acciones sensibles (anulaciones, descuentos, precios, pagos, tasa manual, usuarios). |
| S10 | El sistema es instalable en el celular (PWA). |
| S11 | **(Confirmado: ambas medidas)** "Total vendido" = suma de totales referenciales de notas no anuladas. "Total cobrado" = saldo referencial cancelado por pagos. También se muestra el efectivo $ y los Bs realmente recibidos, por método. No hay tasa de conversión: las cotizaciones vencidas no dejan registro, así que solo se cuenta cuántas cotizaciones se convirtieron en notas. |
| S12 | Los pagos registrados no se editan ni se borran; las correcciones quedan trazadas en auditoría. |
| S13 | **(Confirmado)** Día de emisión = día 0; el crédito vence a los 10 días calendario; vencida desde el día siguiente. |
| S14 | **(Confirmado; feriados por analogía)** La tasa cambia por día entre semana; sábados y domingos rige la tasa del lunes siguiente (y en feriados, la del siguiente día hábil). Si no está disponible, se usa la última con aviso. |
| S15 | Límites de validación de R18 (cantidades enteras, máximo 100 líneas, variación de tasa del 15%, tamaños de texto y de archivo). |
| S16 | Regla de redondeo de R16 (2 decimales, mitad hacia arriba, descuento redondeado y restado de la base). |
| S17 | **(Decisión del cliente)** Las cotizaciones eliminadas por vencimiento no dejan ningún registro; por eso no hay tasa de conversión en las estadísticas. |

---

## 11. Definición de "terminado" global

El proyecto está terminado cuando:
1. Las 12 fases (0 a 11) y sus 92 subfases cumplen todos sus criterios.
2. El ejemplo de referencia R15 se reproduce exactamente al centavo.
3. Todas las reglas de la sección 4 se cumplen y están cubiertas por pruebas donde aplica.
4. La interfaz es completamente utilizable en teléfono, tablet y escritorio, con el estilo definido en la sección 5, incluida la sección 5.6: Poppins, skeletons sin spinners, notificaciones con Sonner y paginación real en todos los listados.
5. Los datos reales (catálogo y clientes) están cargados y el sistema está desplegado y operativo.
6. Existe la guía de uso y el archivo de decisiones con todos los supuestos.
7. Los conjuntos de prueba del Anexo A producen exactamente los resultados esperados.
8. Las reglas R16 (redondeo), R17 (zona horaria y vencimientos) y R18 (validaciones) están implementadas y cubiertas por pruebas.

---

## 12. Anexo A — Datos de prueba y resultados esperados

> Los agentes deben convertir estos conjuntos en pruebas automatizadas. Los nombres de productos y clientes son ejemplos de prueba.

### A.1 Importación de productos

Archivo de prueba (10 filas de datos):

| # | Categoría | Descripción | PVP Divisas | PVP Bs ($) | Resultado esperado |
|---|---|---|---|---|---|
| 1 | BIOTECNICA | Acido Urico Directo 2x100ml | 17,28 | 21,77 | Creado, precio completo |
| 2 | WIENER LAB | Glucosa Enzimatica 1x500ml | 10,00 | 12,50 | Creado, precio completo |
| 3 | LABCARE | Colesterol Total 2x100ml | *(vacío)* | *(vacío)* | Creado, **sin precio** |
| 4 | LABCARE | Trigliceridos 2x100ml | 8,00 | *(vacío)* | Creado, **precio incompleto** |
| 5 | LIQUIDOS | Alcohol Isopropilico 1L | *(vacío)* | 5,00 | Creado, **precio incompleto** |
| 6 | EQUIPOS | Microscopio Binocular | 300,00 | 380,00 | Creado, precio completo |
| 7 | EQUIPOS | Microscopio Binocular | 300,00 | 380,00 | **Duplicado en el archivo**: se reporta y no se crea otro |
| 8 | PIPETAS | Pipeta 10ul | 4,50 | 6,00 | Creado, precio completo |
| 9 | PIPETAS | Pipeta 100ul | abc | 6,00 | **Error de fila** (precio no numérico) |
| 10 | DESCARTABLE | *(vacío)* | 1,00 | 1,50 | **Error de fila** (sin descripción) |

**Resultado esperado de la primera importación:** 7 productos creados (4 con precio completo, 1 sin precio, 2 incompletos), 1 duplicado reportado, 2 errores reportados con fila y motivo.

**Reimportar el mismo archivo:** 0 creados, 0 actualizados, 7 sin cambios, 1 duplicado, 2 errores.

**Importar una segunda versión** donde la fila 2 pasa a 11,00 / 13,75 y se agrega `WIENER LAB | Hemoglobina 1x100ml | 15,00 | 18,00`: 1 actualizado (con el cambio de precio visible en la vista previa), 1 creado, 6 sin cambios, 1 duplicado, 2 errores. Total de productos: 8.

### A.2 Estadísticas

Condiciones: diciembre 2026, tasa constante de 40,00 Bs/$, **"hoy" = 18/12/2026**, tres productos P1, P2 y P3, trabajadores T1 y T2.

| Nota | Emisión | Cliente | Trabajador | Total ref. | Pago / situación | Productos |
|---|---|---|---|---|---|---|
| 00 | 02/12 | Ana | T1 | 100,00 | Efectivo $78,00 (caso A de R15). **Pagada** | P1×2, P2×1, P3×5 |
| 01 | 03/12 | Carla | T2 | 50,00 | Crédito, sin abonos. Saldo 50,00; vence 13/12 → **vencida** | P1×1 |
| 02 | 05/12 | Beto | T2 | 200,00 | Transferencia de 8.000,00 Bs. **Pagada** | P1×5 |
| 03 | 06/12 | Beto | T1 | 500,00 | **ANULADA** | P3×50 |
| 04 | 10/12 | Ana | T1 | 300,00 | Crédito; abono de 4.000,00 Bs por pago móvil el 12/12. Saldo 200,00; vence 20/12 | P2×6, P3×1 |

Además, las cotizaciones de diciembre que no se convirtieron ya expiraron y fueron eliminadas sin dejar registro; **5** cotizaciones se convirtieron en las notas 00 a 04.

**Resultados esperados:**
- Notas válidas del mes: **4** (la anulada no cuenta en ningún indicador).
- Total vendido: **$650,00** referenciales. Total cobrado: **$400,00** referenciales.
- Total por cobrar: **$250,00**. Vencido: **$50,00** (nota 01). Próximo a vencer (en 3 días o menos): **$200,00** (nota 04).
- Cotizaciones convertidas en notas: **5** (notas 00 a 04; incluye la de la nota anulada, porque sí se convirtió).
- Ventas por trabajador: **T1 = $400,00**, **T2 = $250,00**.
- Clientes que más compran: **Ana $400,00**, **Beto $200,00**, **Carla $50,00**.
- Productos más vendidos (unidades): **P1 = 8**, **P2 = 7**, **P3 = 6**.
- Cobros recibidos por método: **efectivo $78,00**, **transferencia 8.000,00 Bs**, **pago móvil 4.000,00 Bs**.
- Comparativo con el mes anterior: sin datos previos, debe mostrarse "sin datos" y no un porcentaje inventado.

### A.3 Fechas, zona horaria y vencimientos
1. Nota emitida el **01/12 a las 23:30 (Caracas)**: su fecha es 01/12 (aunque en UTC ya sea 02/12), vence el **11/12** y es **vencida desde el 12/12 a las 00:00** (Caracas).
2. Nota emitida el **31/12 a las 22:00 (Caracas)** (ya es 01/01 en UTC): cuenta en las estadísticas de **diciembre**.
3. **Fin de semana:** un **sábado** o **domingo** usa la tasa con fecha de vigencia del **lunes siguiente**, guardada desde el viernes sin aplicarse antes. Si la tasa del lunes aún no está disponible, se usa la última (la del viernes) y aparece el aviso de desactualización. Un **día hábil** sin su tasa: también aparece el aviso.
4. **Vigencia de cotizaciones:** una cotización creada el **01/12** (día 0) es válida hasta el final del **04/12**. Si no se convirtió, desaparece por completo desde el **05/12 a las 00:00** (Caracas), sin dejar registro. Una cotización creada el 01/12 y **convertida el 04/12 a las 23:00** se conserva, vinculada a su nota.

### A.4 Redondeo (R16)
1. **Descuento por porcentaje:** línea de 3 unidades a $11,15 = 33,45; descuento 10 % = 3,345 → **3,35**; total de línea = **30,10**.
2. **Monto en Bs:** 30,10 × tasa 38,4567 = 1.157,54667 → **1.157,55 Bs**.
3. **Abono en Bs:** 1.157,55 ÷ 38,4567 = 30,1000866… → **30,10** referenciales cancelados → saldo **0,00**.
4. **Efectivo $ con factor no exacto:** línea con total referencial 30,10 y total divisas 26,00.
   - Abona **$10,00** en efectivo → cancela `10 × 30,10 ÷ 26` = 11,5769… → **11,58**; saldo = **18,52**.
   - Luego abona **$16,00** en efectivo (todo lo que resta en divisas) → cancela 18,52 y el saldo queda en **0,00 exacto**, sin residuos.

---

## 13. Anexo B — Referencia visual

> Es una guía de **intención visual y estructura**, no un diseño final de píxeles. El agente debe respetar la jerarquía y la disposición, y aplicar el estilo Apple, la paleta y Poppins de las secciones 5.1 a 5.6.

### B.1 Capas de profundidad
| Capa | Uso | Tratamiento |
|---|---|---|
| **0 — Fondo** | Fondo general | Gris/blanco muy suave, sin ruido visual |
| **1 — Superficie** | Tarjetas, tablas, formularios | Blanco, esquinas muy redondeadas, sombra suave y difusa |
| **2 — Elevado** | Elementos que sobresalen: totales fijos, tarjetas seleccionadas, botón principal | Sombra más marcada, ligera elevación al interactuar |
| **3 — Flotante** | Barra superior e inferior, menús, hojas inferiores, modales, notificaciones | Translucidez con desenfoque del fondo, borde sutil, sombra amplia |

- La profundidad comunica **jerarquía y foco**: lo más importante está más elevado. No se usa sombra decorativa sin función.
- Las animaciones de entrada y salida de capas deben ser suaves y breves.

### B.2 Uso del color y estados
- **Verde (tono oscuro derivado):** acción principal, confirmaciones, estado "pagada".
- **Turquesa (tono oscuro derivado):** información, selección, enlaces, elementos activos de la navegación.
- **Tonos originales del logo:** fondos suaves, acentos, ilustración y marca de agua.
- **Rojo suave:** errores, "vencida", "anulada". **Ámbar:** advertencias y "próxima a vencer". **Gris:** inactivo o sin precio.
- Los estados deben distinguirse también por **texto o ícono**, no solo por color.
- Cifras de dinero siempre alineadas y con jerarquía clara; el **total** es el elemento visual más prominente de cada documento.

### B.3 Armar cotización (móvil)

```
┌───────────────────────────────┐
│ ←  Nueva cotización           │  barra superior translúcida
├───────────────────────────────┤
│ Cliente                       │
│ [ Ana Pérez              ▾ ]  │  buscar o + crear cliente
│                               │
│ [ Buscar producto…          ] │  resultados paginados, al escribir
│                               │
│ ┌───────────────────────────┐ │
│ │ Acido Urico Directo 2x100 │ │  tarjeta de línea
│ │ Divisas $17,28 · Ref $21,77│ │
│ │ [ − ]  2  [ + ]      [🗑] │ │
│ └───────────────────────────┘ │
│ ┌───────────────────────────┐ │
│ │ …                         │ │
│ └───────────────────────────┘ │
│ Descuento   [ % | $ ]  [ __ ] │
├───────────────────────────────┤  ← hoja inferior flotante, SIEMPRE visible
│ Pagando en efectivo $  78,00  │
│ Pagando en Bs   4.000,00 Bs   │
│ Tasa 40,00 · 26/11/2026       │
│ [        Guardar          ]   │
└───────────────────────────────┘
```
- Los **dos totales** y la tasa están siempre a la vista; el botón principal queda al alcance del pulgar.
- Mientras carga, la lista de productos y las tarjetas se muestran como **skeletons**.

### B.4 Pantalla de pago (móvil)

```
┌───────────────────────────────┐
│ ←  Registrar pago             │
│ Nota N° 07 · Ana Pérez        │
│ Saldo  $100,00 ref.           │
│        ≈ 4.000,00 Bs (tasa 40)│
│                               │
│ [ Por productos | Por monto ] │  selector segmentado
│                               │
│ Por monto                     │
│  Efectivo $        [ 50,00 ]  │
│  Pago móvil Bs     [  ____ ]  │
│   Referencia       [  ____ ]  │
│  Transferencia Bs  [  ____ ]  │
│   Referencia       [  ____ ]  │
│                               │
│ ┌ Resumen ──────────────────┐ │  tarjeta elevada
│ │ Cancela        $65,00     │ │
│ │ Saldo resultante $35,00   │ │
│ └───────────────────────────┘ │
│ [      Confirmar pago      ]  │
└───────────────────────────────┘
```
- En el modo **"Por productos"**, se listan las líneas con un interruptor "Pagar en efectivo $" por cada una y el resumen se actualiza al instante.
- El resumen siempre muestra el efecto **antes** de confirmar. La confirmación notifica con Sonner.

### B.5 Panel principal (escritorio)

```
┌────────────┬──────────────────────────────────────────────┐
│ [Logo]     │  Resumen · Diciembre 2026    [ rango fechas ] │
│            ├──────────┬──────────┬──────────┬─────────────┤
│ Panel      │ Vendido  │ Cobrado  │ Por      │ Vencido     │
│ Cotizar    │ $650,00  │ $400,00  │ cobrar   │ $50,00      │
│ Notas      │          │          │ $250,00  │             │
│ Cobranza   ├──────────┴──────────┴──────────┴─────────────┤
│ Productos  │ Ventas por mes (gráfico)  │ Alertas de cobro  │
│ Clientes   │                           │ • Carla  vencida  │
│ Usuarios   │                           │ • Ana  vence en 2d│
│            ├───────────────────────────┴───────────────────┤
│ Tasa BCV   │ Más vendidos │ Mejores clientes │ Por trabajador│
│ 40,00      │              │                  │              │
└────────────┴───────────────────────────────────────────────┘
```
- Barra lateral con navegación; indicador de **tasa BCV** siempre visible.
- Cuatro indicadores principales arriba; gráfico y alertas en el centro; rankings abajo. En móvil, todo se apila en una columna con la navegación inferior.

### B.6 Nota de entrega (PDF, tamaño carta)

```
┌──────────────────────────────────────────────┐
│ [Logo]  PROSALUD SERVICIOS INTEGRALES, C.A.  │
│         RIF J-50435652-2                     │
│         Av 6 Edif Chama Piso 1 Apt A-1 …     │
│ ──────────────────────────────────────────── │
│ NOTA DE ENTREGA            N° 07             │
│ Fecha 26/11/2026   Tasa BCV 40,00 (26/11)    │
│ Cliente: Ana Pérez   RIF: V-12345678         │
│ ──────────────────────────────────────────── │
│ Cant │ Descripción          │ Divisas │ Ref.  │
│  2   │ Acido Urico…         │  34,56  │ 43,54 │
│  …                                            │
│ ──────────────────────────────────────────── │
│ Total en efectivo $:          $ 78,00        │
│ Total en Bs (ref. × tasa):  4.000,00 Bs      │
│ Pagos registrados … Saldo … Vence …          │
│                                              │
│          ( marca de agua del logo )          │
│ Datos de la empresa · pie de página          │
└──────────────────────────────────────────────┘
```
- Si la nota es a crédito, se muestran saldo y fecha de vencimiento; si está anulada, una marca **ANULADA** en diagonal.
- Jerarquía: número de nota y total son lo más destacado; la marca de agua es discreta y no afecta la lectura.
