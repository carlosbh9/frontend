# Stabilization Roadmap

Fecha: 2026-04-17

## Estado general

Avance reportado:

- Fase 1 completada
- Fase 2 completada
- Fase 3 en progreso
- Fase 4 pendiente

## Fase 1: base segura

Estado:

- completada

Tickets ejecutados:

- `TKT-001`
- `TKT-002`
- `TKT-004`
- `TKT-005`

Resultado:

- base backend mas predecible
- mejor hardening inicial

## Fase 2: coherencia del core

Estado:

- completada

Tickets ejecutados:

- `TKT-006`
- `TKT-007`
- `TKT-008`

Resultado:

- quoter mas consistente
- menor fragilidad entre frontend y backend
- mejor relacion con `Tariff`

## Fase 3: robustez operativa

Estado:

- en progreso

Tickets ejecutados:

- `TKT-009`
- `TKT-010`

Ticket pendiente:

- `TKT-011`

Objetivo restante:

- completar la base financiera minima sobre `ServiceOrder` y `BookingFile`

## Fase 4: soporte y continuidad

Estado:

- pendiente

Tickets previstos:

- `TKT-012`
- `TKT-013`
- `TKT-014`

Objetivo:

- dejar el sistema mas sostenible para el equipo que lo recibira

## Frente transversal nuevo: integracion con Pipedrive

Estado:

- recomendado
- no encontre evidencia actual de codigo de integracion

Objetivo:

- dejar claro que el CRM es externo
- evitar duplicar pipeline comercial dentro del sistema

Cambios sugeridos:

- definir ownership de datos
- agregar referencias externas minimas
- encapsular integracion en adapter interno
- documentar sincronizacion inicial

## Arranque recomendado desde hoy

1. `TKT-011`
2. `TKT-012`
3. `TKT-013`
4. `TKT-014`
5. frontera de integracion con Pipedrive
6. `TKT-003` cuando los flujos se estabilicen
