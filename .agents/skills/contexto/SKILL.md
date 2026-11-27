---
name: contexto
description: >-
  Activación ESTRICTAMENTE MANUAL: usar ÚNICAMENTE cuando el usuario escriba `/contexto` en el mensaje.
  NUNCA activar automáticamente ni por inferencia en otros prompts.
  Carga el contexto completo de ProSalud (decisiones, supuestos, reglas de negocio R1-R18 y roadmap).
---

# Carga de Contexto Completo — ProSalud

Activa esta skill **solo** cuando el usuario haya escrito `/contexto`.

## Pasos a ejecutar

1. Lee completo [DECISIONES.md](../../../docs/DECISIONES.md) y [progreso.json](../../../docs/progreso.json) para conocer las decisiones de arquitectura (`D1`–`D4`), los supuestos (`S1`–`S17`) y exactamente qué subfases y criterios están completados.
2. Lee completo [ROADMAP.md](../../../docs/ROADMAP.md) (reglas `R1`–`R18`, diseño `5.6`, fases `0`–`11`, Anexos `A` y `B`; tiene >800 líneas, así que si se trunca, lee también desde la línea 801 hasta el final).
3. Si el usuario solo pidió cargar el contexto, confirma brevemente qué fase toca a continuación y las restricciones clave vigentes, y espera sus instrucciones sin modificar código. Si acompañó `/contexto` con una instrucción concreta, ejecútala respetando todas las reglas leídas.
