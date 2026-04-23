# Implementation Backlog

Fecha: 2026-04-17

## Objetivo

Traducir el plan de mejora en un backlog tecnico ejecutable para el equipo.

Este backlog esta ordenado por:

- impacto
- riesgo
- dependencia tecnica
- valor para estabilizacion de la entrega

## Convenciones

- Prioridad `P1`: hacer primero
- Prioridad `P2`: hacer despues de estabilizar la base
- Prioridad `P3`: mejora importante pero no bloqueante

Estados usados:

- `done`
- `pending`
- `postponed`
- `proposed`

## Estado de avance al 2026-04-17

Ejecutados:

- `TKT-001`
- `TKT-002`
- `TKT-004`
- `TKT-005`
- `TKT-006`
- `TKT-007`
- `TKT-008`
- `TKT-009`
- `TKT-010`

Diferido:

- `TKT-003`

Pendientes principales:

- `TKT-011`
- `TKT-012`
- `TKT-013`
- `TKT-014`
- `TKT-015`
- `TKT-016`
- `TKT-017`

## P1. Base segura

### TKT-001: Estandarizar contrato de errores backend

Estado:

- done

Objetivo:

- definir un formato uniforme para errores HTTP

### TKT-002: Agregar validacion consistente en rutas criticas

Estado:

- done

Objetivo:

- evitar datos invalidos o incompletos en puntos criticos

### TKT-003: Revisar y endurecer permisos backend

Estado:

- postponed

Motivo:

- el modelo funcional y los flujos sensibles siguen cambiando, por lo que endurecer permisos ahora puede introducir friccion o retrabajo innecesario

Objetivo:

- alinear permisos backend con lo que el frontend ya asume

Areas impactadas:

- `back-end/src/middlewares/auth.js`
- `back-end/src/security/permissions.js`
- `back-end/src/security/access-policies.js`
- rutas criticas de `contacts`, `quoter-v2`, `booking-files`, `roles`, `users`

Riesgo:

- medio

### TKT-004: Agregar `health` endpoint y revision minima de hardening

Estado:

- done

Objetivo:

- mejorar soporte y readiness de operacion

### TKT-005: Incorporar `rate limiting` basico

Estado:

- done

Objetivo:

- proteger endpoints sensibles y publicos

## P1. Coherencia del core

### TKT-006: Unificar contrato de `Quoter V2` entre frontend y backend

Estado:

- done

Objetivo:

- reducir inconsistencias que generaban deuda y bugs silenciosos

### TKT-007: Reducir normalizacion manual fragil del form del quoter

Estado:

- done

Objetivo:

- simplificar el form mas delicado del sistema sin reescribirlo

### TKT-008: Fortalecer relacion `Tariff -> Quoter`

Estado:

- done

Objetivo:

- mejorar consistencia entre catalogo de costos y cotizacion

## P2. Robustez operativa

### TKT-009: Endurecer transiciones y auditoria en `ServiceOrder`

Estado:

- done

Objetivo:

- volver mas confiable el modulo operativo mas importante

### TKT-010: Revisar summary y riesgo de `BookingFile`

Estado:

- done

Objetivo:

- asegurar que el expediente central refleje mejor el estado operativo

### TKT-011: Mejorar controles financieros minimos

Estado:

- pending

Objetivo:

- reforzar la base financiera existente sin crear un modulo contable nuevo

Areas impactadas:

- `back-end/src/models/service_order.schema.js`
- `back-end/src/Services/service-orders/service-order.service.js`
- `frontend/src/app/features/service-orders/...`

Enfoque:

- payment status
- expected cost
- paid amount
- invoice data
- consistencia de estados financieros

Dependencias:

- `TKT-009`

Riesgo:

- medio

Criterio de aceptacion:

- financial controls mas utiles y menos ambiguos

## P2. Soporte y continuidad

### TKT-012: Agregar smoke tests minimos

Estado:

- pending

Objetivo:

- tener una red basica de seguridad antes de cambios mas amplios

Cobertura minima sugerida:

- login
- create contact
- create quoter
- confirm sale
- create service orders
- fetch booking file

### TKT-013: Logging tecnico minimo util

Estado:

- pending

Objetivo:

- mejorar trazabilidad operativa y soporte

Areas impactadas:

- `back-end/index.js`
- middlewares
- puntos criticos de venta, file, service orders y public booking

### TKT-014: Documentacion tecnica operativa minima

Estado:

- pending

Objetivo:

- reducir dependencia de conocimiento tacito

Entregables sugeridos:

- variables de entorno requeridas
- flujo venta -> file -> orders
- endpoints criticos
- permisos base
- ownership de datos entre este sistema y Pipedrive

## P3. Refactors de mejora continua

### TKT-015: Reducir `any` y mejorar tipado frontend

Estado:

- pending

Areas impactadas:

- `quoter-v2`
- `contacts`
- modulos legacy de booking form

Riesgo:

- medio

### TKT-016: Migracion gradual de logica legacy a servicios

Estado:

- pending

Areas impactadas:

- `contact.route.js`
- `user.route.js`
- otras rutas legacy con demasiada logica

Riesgo:

- medio

### TKT-017: Revision de indices Mongo segun filtros reales

Estado:

- pending

Areas impactadas:

- `QuoterV2`
- `BookingFile`
- `ServiceOrder`
- `Contact`

Riesgo:

- bajo

## P3. Integraciones y alineacion de frontera

### TKT-018: Definir frontera de integracion con Pipedrive

Estado:

- proposed

Objetivo:

- dejar claro que el CRM es externo y evitar duplicidad funcional dentro del sistema

Problema actual:

- no encontre evidencia de integracion con Pipedrive en el codigo
- `Contact` todavia arrastra parte de una logica comercial local
- no esta documentado que datos viven en Pipedrive y cuales deben vivir aqui

Areas impactadas:

- `Contact`
- `QuoterV2`
- documentacion tecnica
- capa de integraciones backend
- configuracion por ambiente

Enfoque recomendado:

- definir ids externos o `externalRefs`
- encapsular cliente Pipedrive en un adapter interno
- decidir sincronizacion inicial de solo lectura o importacion controlada
- evitar recrear leads/deals/activities internamente

Dependencias:

- `TKT-014` recomendable

Riesgo:

- medio

Criterio de aceptacion:

- existe definicion clara de ownership de datos y base tecnica minima para la integracion

## Orden recomendado de ejecucion desde hoy

1. `TKT-011`
2. `TKT-012`
3. `TKT-013`
4. `TKT-014`
5. `TKT-018`
6. `TKT-015`
7. `TKT-016`
8. `TKT-017`
9. `TKT-003` cuando el modelo y los flujos sensibles se estabilicen
