# Product Brief: Peladito Architect

**Peladito Architect** Asistente explicativo de arquitectura que permita a clientes y miembros del equipo consultar, en lenguaje coloquial, las decisiones técnicas de un proyecto.

El sistema deberá responder utilizando información versionada como:

- Documento de arquitectura.
- Documentación de producto.
- Architecture Decision Records, o ADRs.
- Decisiones técnicas registradas.
- Restricciones del proyecto.
- Glosario.
- Eventualmente, transcripciones de reuniones.

El asistente funcionará como un proxy del conocimiento documentado, no como sustituto del arquitecto.

## Usuarios

- Clientes (no tecnico)
- Equipo (PM, developers)

## Alcance:

- Explicar decisiones técnicas en lenguaje coloquial.
- Permitir expandir una explicación a un nivel técnico.
- Mostrar las fuentes utilizadas.
- Identificar el documento, sección y versión relevante.
- Explicar trade-offs documentados.
- Reconocer decisiones vigentes, reemplazadas o en revisión.
- Identificar cuando una pregunta es realmente una solicitud de cambio.
- Identificar solicitudes de estimación.
- Abstenerse cuando no exista suficiente información.
- Escalar a un humano cuando corresponda.
- Guardar feedback con nombre y apellido.
- Permitir que un engineer revise el feedback.
- Relacionar feedback con futuras versiones de la documentación.
- Registrar costo, latencia, tokens y estrategia utilizada.
- Mias
  - Identificar feedback relevante
  - Grafo de relaciones entre documentos
  - Trazabilidad decisiones, historico

### No-goals:

- Crear nuevas decisiones de arquitectura.
- Modificar automáticamente la arquitectura.
- Aprobar cambios.
- Inventar razones que no estén documentadas.
- Validar automáticamente la postura del cliente.
- Defender a una persona por encima de la evidencia.
- Responder con seguridad cuando la información sea insuficiente.
- Reemplazar reuniones de alineamiento.
- Estimar esfuerzo, costo o duración.
- Sustituir el proceso de estimación.
- Presentar una decisión técnica como inmutable cuando su documentación indique que puede revisarse.
- Mias
  - Identificar responsabilidades






