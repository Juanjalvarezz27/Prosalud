---
name: prosalud-spec
description: >-
  Consulta las especificaciones, fases del roadmap, decisiones de arquitectura y reglas de negocio de ProSalud (R1-R18, Anexos A y B).
  Usar SOLO cuando la tarea trate sobre fases del roadmap, lógica de negocio (precios divisas/referencial, tasa BCV, cotizaciones, notas, pagos, crédito, redondeo, permisos, auditoría, importación Excel, PDF/WhatsApp, estadísticas) o arquitectura del sistema.
  NO activar para cambios cosméticos simples (colores, espaciado, textos menores o ajustes puntuales de UI sin reglas de negocio).
---

# Especificación ProSalud (Carga bajo demanda)

Este proyecto sigue una especificación estricta almacenada en `docs/` para evitar cargar contexto innecesario en tareas simples.

## Archivos de referencia

- **Roadmap y reglas completas:** [ROADMAP.md](../../../docs/ROADMAP.md)
- **Decisiones, supuestos y avance actual:** [DECISIONES.md](../../../docs/DECISIONES.md)

## Cómo consultar eficientemente

1. Lee primero [DECISIONES.md](../../../docs/DECISIONES.md) para ver en qué fase está el proyecto y qué decisiones aplican (`D1`–`D4`, `S1`–`S17`).
2. Localiza con búsqueda (`rg -n`) la sección exacta en [ROADMAP.md](../../../docs/ROADMAP.md) y lee **únicamente** ese bloque:
   - `## 4. Reglas de negocio globales` (`R1`–`R18`, fuente de verdad si algo contradice a una fase).
   - `## 5. Diseño y experiencia` (Poppins, paginación real en servidor, skeletons sin spinners, Sonner, formato venezolano).
   - `### FASE N` (criterios de cada subfase `N.1`–`N.x` y criterios de cierre).
   - `## 12. Anexo A` (casos de prueba automatizados obligatorios) y `## 13. Anexo B` (bocetos y capas visuales).

## Invariantes clave que no deben violarse

- **Sin Cron Jobs en Vercel (`D1`):** expiración de cotizaciones (3 días, `America/Caracas`) por filtro estricto + limpieza perezosa; tasa BCV bajo demanda.
- **Dinero exacto (`R16`):** nunca usar punto flotante nativo; redondeo `HALF_UP` a 2 decimales en los puntos definidos y absorción de centavos al liquidar una línea.
- **UI obligatoria (`5.6`):** Poppins, skeletons (nunca spinners), notificaciones con Sonner y paginación real en servidor para todo listado.
- **Ante ambigüedad en dinero, permisos, numeración, borrado o `R1`–`R18`:** detenerse y preguntar al usuario antes de implementar.
