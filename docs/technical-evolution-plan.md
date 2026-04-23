# Technical Evolution Plan

> Nota 2026-04-17:
> Este documento queda como referencia historica de una exploracion anterior.
> La direccion actual del proyecto ya no es productization inmediata ni CRM interno.
> El alcance vigente prioriza mejoras del sistema actual, con Pipedrive como CRM externo.

## 1. Principio rector

Evolucionar el sistema actual como monolito modular configurable, no como reescritura ni como arquitectura compleja prematura.

## 2. Refactors seguros recomendados

### 2.1 Centralización de constantes

Hoy hay constantes dispersas en:

- roles y áreas
- permisos
- destinos
- estados
- URLs/defaults

Recomendación:

- crear capas de constantes por dominio
- separar:
  - constantes core del producto
  - catálogos configurables
  - branding/config

### 2.2 Extracción de servicios

Refactors seguros:

- extraer más lógica de `contact.route.js`
- centralizar authz
- separar servicios de integración externa de los servicios de dominio

No conviene todavía:

- rehacer todos los módulos legacy de una vez

## 3. Config module recomendado

### Objetivo

Separar configuración técnica, branding, catálogos y futuras opciones por empresa.

### Alcance inicial

- nombre del sistema
- logo
- colores base
- URLs públicas
- proveedores de integración habilitados
- opciones funcionales básicas

### Beneficio

- prepara branding configurable
- reduce hardcodes
- facilita productización

## 4. Audit log base

Hoy solo existe audit local en `ServiceOrder`.

Recomendación:

- crear una base transversal de auditoría

Eventos mínimos sugeridos:

- login/logout
- create/update/delete de entidades core
- confirm sale / revert sale
- cambios críticos de estado
- cambios en configuración

No hace falta una plataforma compleja de auditoría al inicio. Basta una base uniforme y consultable.

## 5. Índices Mongo recomendados

Ya existen varios índices útiles, pero para evolución de producto conviene revisar:

- `QuoterV2`: `contact_id`, `status`, `updatedAt`, búsqueda por guest/name
- `BookingFile`: `fileCode`, `contact_id`, `quoter_id`, `overall_status`, `risk_level`, `next_action_due_at`
- `ServiceOrder`: `file_id`, `area`, `status`, `assigneeId`, `dueDate`, `businessEventId`
- futura `Company/Tenant`: índices por `company_id`

Recomendación:

- definir una política explícita de índices por listados reales y filtros de UI

## 6. Validaciones recomendadas

### Hoy

- buenas en `tariff-v2`
- razonables en `master-quoter-v2`
- débiles en rutas legacy

### Evolución recomendada

- introducir validación de request por módulo
- priorizar:
  - auth
  - contacts
  - quote sale/revert
  - booking files operational updates
  - service order mutations

## 7. Permisos recomendados

### Hoy

- existen permisos útiles, pero parciales

### Evolución recomendada

- separar:
  - permisos de lectura
  - permisos de modificación
  - permisos operativos
  - permisos administrativos
  - permisos de configuración
- preparar permisos por empresa futura
- alinear guard frontend con enforcement backend real

## 8. Adapters internos para futuras integraciones

### Hoy

Integraciones directas:

- OpenAI
- S3
- Power Automate
- email

### Recomendación

Crear adapters internos para:

- AI provider
- storage provider
- notifications provider
- automation/webhook provider

Esto no implica abstraer todo el sistema. Solo aislar dependencias externas para que el core no dependa de una implementación única.

## 9. Catálogos configurables

### Hoy

Hay catálogos duros en código:

- destinos
- roles base
- permisos base
- algunos estados y defaults operativos

### Recomendación

Clasificar catálogos en tres grupos:

1. core del producto
2. configurables por empresa
3. operativos internos derivados

Primeros candidatos a externalizar:

- branding
- destinos comerciales
- opciones de notificación
- providers activos
- roles visibles/configurables

## 10. Feature flags básicos

### Objetivo

Permitir rollout gradual por empresa o por ambiente.

### Flags iniciales sugeridos

- `enable_ai_quote_review`
- `enable_public_booking`
- `enable_booking_notifications`
- `enable_itinerary_builder_bridge`
- `enable_financial_controls`

### Beneficio

- menos riesgo al activar nuevas capacidades
- base sana para producto

## 11. Mejoras UI/UX funcionales

No hace falta rediseñar todo. Las mejoras más útiles serían:

- branding configurable en shell y login
- unificación visual entre módulos legacy y nuevos
- filtros server-side consistentes
- mensajes de error más claros
- estados vacíos y de carga más consistentes
- paneles de configuración mejor separados del core operativo

## 12. Arquitectura futura recomendada

### Corto plazo

- monolito modular más ordenado
- configuración central
- integraciones detrás de adapters

### Mediano plazo

- tenant-aware single database
- `company_id` en entidades core
- config y feature flags por empresa

### Largo plazo

- solo separar bounded contexts si la operación real lo exige

## 13. Qué no conviene hacer todavía

- microservicios
- multi-tenant complejo desde ahora
- white-label completo
- rediseño total de frontend
- reescritura total de rutas legacy

## 14. Secuencia técnica recomendada

1. errores, validaciones y permisos
2. config module
3. branding configurable
4. constantes y catálogos
5. adapters internos
6. audit log base
7. feature flags básicos
8. base de empresa/tenant futura
