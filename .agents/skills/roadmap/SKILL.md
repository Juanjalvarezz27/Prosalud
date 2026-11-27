---
name: roadmap
description: >-
  Activación ESTRICTAMENTE MANUAL: usar ÚNICAMENTE cuando el usuario escriba `/roadmap` en el mensaje.
  NUNCA activar automáticamente ni por inferencia en otros prompts.
  Consulta o ejecuta fases, subfases, reglas (R1-R18) o anexos del roadmap de ProSalud.
---

# Consulta y Ejecución del Roadmap — ProSalud

Activa esta skill **solo** cuando el usuario haya escrito `/roadmap`.

## Pasos a ejecutar

1. Lee [DECISIONES.md](../../../docs/DECISIONES.md) y [progreso.json](../../../docs/progreso.json) para ubicar exactamente qué subfases están completadas y respetar las decisiones confirmadas (`D1`–`D4`).
2. Localiza con búsqueda (`rg -n`) en [ROADMAP.md](../../../docs/ROADMAP.md) solo la sección pertinente al pedido del usuario y léela:
   - Si pide una fase o subfase (ej. `/roadmap fase 0` o `/roadmap 1.2`): lee `### FASE N`, `## 4. Reglas de negocio globales` y `## 5.6 Convenciones de interfaz obligatorias`.
   - Si no especifica fase (ej. solo `/roadmap`): lee `## 7. Mapa de fases` y la fase actual pendiente según `progreso.json`.
   - Si pide una regla o anexo (ej. `/roadmap R16` o `/roadmap anexo A`): lee exactamente esa sección.
3. Respeta el orden secuencial de fases/subfases, detente a preguntar ante cualquier ambigüedad en dinero, permisos, numeración, borrado o `R1`–`R18`.
4. Cuando el usuario pida **"actualiza roadmap"** (o al completar una subfase/fase), ejecuta `node scripts/sync-roadmap.mjs --done <subfases>` (o `--phase-done <fase>` / `--undone <subfases>`) para marcarla como lista en `docs/progreso.json`, `docs/DECISIONES.md` y el HTML de lectura `roadmap.html`.
