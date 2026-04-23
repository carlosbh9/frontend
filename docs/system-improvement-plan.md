# System Improvement Plan

Fecha: 2026-04-17

## 1. Objetivo

Este plan esta enfocado en mejorar el sistema actual para su entrega a una empresa que recibira el codigo fuente.

El objetivo no es convertirlo en CRM ni productizarlo como SaaS en esta etapa. El sistema comercial principal estara en Pipedrive, y este producto debe concentrarse en:

- quoter
- tariff
- booking file
- service orders
- biblia como vista derivada
- controles operativos y financieros basicos
- integraciones externas necesarias

## 2. Aclaracion de alcance

No encontre evidencia de una integracion actual con Pipedrive en el codigo revisado.

Por lo tanto, desde este documento se asume lo siguiente:

- Pipedrive sera el CRM externo
- este sistema no debe duplicar leads, deals, activities ni pipeline comercial
- `Contact` debe quedar como referencia local minima para cotizacion y operacion
- cualquier dato comercial avanzado debe entrar por integracion, no por un mini-CRM interno nuevo

## 3. Estado general del sistema

## Lo mejor resuelto hoy

- `Tariff V2`
- `BookingFile`
- `ServiceOrder`
- `BookingFileSummaryService`
- `BookingFileBibliaService`
- flujo `quote sold -> booking file -> service orders`

## Lo que esta usable pero necesita mejora

- `Quoter V2`
- `Master Quoter V2`
- `Contact` como referencia local comercial/operativa
- usuarios y permisos
- public booking flow

## Lo mas debil hoy

- permisos backend transversales
- tests automaticos
- observabilidad
- documentacion operativa
- base financiera consolidada
- frontera de integracion con Pipedrive

## 4. Estado de avance del plan

Segun el avance indicado, ya se ejecutaron:

- `TKT-001`
- `TKT-002`
- `TKT-004`
- `TKT-005`
- `TKT-006`
- `TKT-007`
- `TKT-008`
- `TKT-009`
- `TKT-010`

Sigue diferido:

- `TKT-003`

Pendientes mas inmediatos:

- `TKT-011`
- `TKT-012`
- `TKT-013`
- `TKT-014`

## 5. Prioridades reales de mejora desde este punto

## Prioridad alta

### A. Controles financieros minimos

Por que importa:

- el sistema ya vende y opera
- sin una base financiera minima, el seguimiento queda incompleto
- `ServiceOrder` y `BookingFile` ya tienen suficiente madurez para soportar esta capa

Enfoque recomendado:

- `paymentStatus`
- `expectedCost`
- `paidAmount`
- invoice data
- consistencia de estados financieros

### B. Tests y soporte operativo

Por que importa:

- ya se tocaron flujos core
- hace falta una red de seguridad antes de seguir profundizando cambios

Enfoque recomendado:

- smoke tests minimos
- logging tecnico util
- documentacion operativa viva

### C. Frontera de integracion con Pipedrive

Por que importa:

- evita reconstruir CRM dentro del sistema
- reduce hardcodes comerciales locales
- deja clara la responsabilidad de cada plataforma

Enfoque recomendado:

- definir identificadores externos en entidades locales relevantes
- crear adapter interno para Pipedrive
- separar importacion/sincronizacion de la logica del dominio
- decidir si la primera etapa sera solo lectura/sync entrante

## Prioridad media

### A. Permisos backend

Estado actual:

- sigue siendo importante
- pero sigue diferido por riesgo funcional mientras cambian flujos

Recomendacion:

- retomarlo cuando la capa funcional inmediata se estabilice despues de `TKT-014`

### B. Mejora incremental de `Contact`

Problema:

- sigue cargando demasiada responsabilidad historica

Que hacer:

- no convertirlo en CRM
- si convertirlo en referencia local limpia y enlazada a Pipedrive

### C. Hardening de integraciones

Aplica a:

- OpenAI
- S3
- Power Automate
- futura integracion con Pipedrive

Recomendacion:

- encapsular clientes externos detras de adapters internos cuando se toque cada integracion

## Prioridad baja

### A. Limpieza estructural frontend

- menos `any`
- mas tipos compartidos
- separar formularios pesados

### B. Limpieza visual y UX funcional

- estados de carga
- estados vacios
- feedback de errores
- consistencia entre modulos legacy y nuevos

## 6. Areas donde no conviene invertir fuerte todavia

- CRM interno propio
- multiempresa
- productizacion
- microservicios
- rediseño completo del frontend
- reemplazo total de rutas legacy
- contabilidad avanzada completa

## 7. Recomendaciones concretas por modulo

## Quoter V2

### Lo ya trabajado

- contrato mas consistente entre capas
- menos fragilidad en el form
- mejor relacion con `Tariff`

### Lo siguiente

- estabilizar lo implementado con tests y documentacion
- revisar feedback funcional con usuarios

## Tariff V2

### Mantener

- como referencia principal de costos
- como fuente para alimentar `Quoter`

### Mejorar despues

- trazabilidad de uso desde quoter y templates

## Contact

### Rol recomendado

- referencia local de persona/cuenta/owner
- punto de enlace con el CRM externo

### Lo que no debe ser

- un pipeline comercial paralelo a Pipedrive

## Booking File

### Mantener

- como expediente central del viaje vendido

### Mejorar

- consistencia del summary
- mayor observabilidad
- mejor lectura operativa y financiera

## Service Orders

### Lo ya trabajado

- transiciones mas seguras
- mayor trazabilidad

### Lo siguiente

- controles financieros minimos
- soporte de pagos y facturas mas claro

## Biblia

### Mantener

- como vista derivada desde file + orders

### Mejorar si hace falta

- performance
- filtros
- lectura por criticidad

## Integraciones

### Estado actual

- OpenAI, S3 y Power Automate existen
- no encontre evidencia de Pipedrive en codigo

### Recomendacion

- agregar una capa de integracion interna antes de incorporar Pipedrive

## 8. Secuencia recomendada desde hoy

### Bloque 1

- `TKT-011`
- `TKT-012`
- `TKT-013`
- `TKT-014`

### Bloque 2

- definir frontera de integracion con Pipedrive
- agregar referencias externas y adapter interno
- documentar ownership de datos entre sistemas

### Bloque 3

- retomar `TKT-003`
- seguir con deuda tecnica de tipado, servicios legacy e indices

## 9. Resultado esperado

Despues de este plan, el sistema deberia quedar:

- mas estable
- mas seguro
- mas explicable para el equipo receptor
- mas alineado con un CRM externo real
- mejor preparado para operar sin reconstruir ventas dentro del mismo producto
