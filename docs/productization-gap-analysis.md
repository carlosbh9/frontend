# Productization Gap Analysis

> Nota 2026-04-17:
> Este documento queda como referencia historica de una exploracion anterior.
> La direccion actual del proyecto ya no es productization inmediata ni CRM interno.
> El alcance vigente prioriza mejoras del sistema actual, con Pipedrive como CRM externo.

## Criterios usados

- qué existe hoy
- qué está parcial
- qué falta
- qué está mal acoplado
- qué está específico para una sola empresa
- qué conviene mejorar primero

| Área | Estado actual | Evidencia real | Brecha para producto | Prioridad |
| --- | --- | --- | --- | --- |
| Quoter | Parcial alto | `quoter-v2` backend y frontend completos | necesita mejores contratos, versionado más claro y menos inconsistencias de naming | Alta |
| Master Quoters | Parcial alto | templates con referencias a tarifas | falta versionado formal y reutilización más rica | Media |
| Tarifario | Completo para etapa actual | `tariff-v2` bien validado y modelado | falta gobernanza y configuración por empresa | Alta |
| File | Fuerte | `BookingFile` como expediente central | necesita consolidarse como hub transversal | Alta |
| Operaciones | Parcial alto | `ServiceOrder`, templates, Biblia, summary | falta rooming, incidencias, reservas más formales | Media |
| Biblia | Bien orientada | vista derivada desde file + orders | no debe convertirse en fuente primaria | Alta |
| Usuarios y roles | Parcial | roles, permisos, guard | falta enforcement homogéneo y permisos más configurables | Alta |
| Automatizaciones | Parcial | venta->file, venta->orders, public booking | falta jobs/queue/eventos y configuración por empresa | Media |
| Base financiera | Parcial bajo | financials dentro de service orders | falta dominio contable mínimo | Media |
| Configuración del sistema | Parcial bajo | env frontend/backend | falta config module y catálogos por empresa | Muy alta |
| Branding configurable | Ausente | logo fijo, título `Quoter Kuoda`, Firebase fijo | no existe capa de branding | Muy alta |
| Multiempresa futura | Ausente | no hay `tenant/company/org` | no hay base de aislamiento por empresa | Muy alta |
| Feature flags | Ausente | no encontré evidencia suficiente | no hay control gradual de rollout | Alta |
| Manejo de errores | Parcial | middleware genérico + interceptor | respuesta inconsistente y poco reutilizable | Alta |
| Validaciones | Parcial | buenas en módulos nuevos, débiles en legacy | no hay esquema homogéneo | Alta |
| Integraciones externas | Parcial | S3, Power Automate, OpenAI, email | acopladas directo a implementación concreta | Alta |
| Audit log base | Parcial | solo en service orders | no hay auditoría transversal | Media |
| Tests | Ausente | frontend con Karma base, backend placeholder | poca confianza para evolucionar producto | Alta |
| Documentación | Ausente | README genérico | falta documentación de arquitectura y configuración | Alta |

## Gaps más relevantes para productización

### 1. No existe capa de empresa o tenant

No encontré evidencia suficiente de:

- `Company`
- `Tenant`
- `Organization`
- `Workspace`

Esto no bloquea seguir vendiendo el sistema internamente, pero sí bloquea diseñarlo como producto reusable.

### 2. Branding y despliegue están acoplados

Evidencia:

- título `Quoter Kuoda`
- assets de logo fijos
- Firebase acoplado a un proyecto único
- CORS con dominios específicos

Gap:

- no hay branding configurable
- no hay separación entre core product y deployment de una empresa

### 3. Configuración funcional y técnica está dispersa

Evidencia:

- environments frontend
- URLs y defaults backend
- catálogos duros dentro de componentes/servicios

Gap:

- falta un módulo central de configuración

### 4. Permisos existen, pero no están listos para producto

Evidencia:

- `permissions.js`
- `access-policies.js`
- guard frontend

Gap:

- permisos demasiado ligados a la operación actual
- no hay estrategia clara para permisos por empresa, por feature y por módulo configurable

### 5. Integraciones directas, no abstraídas

Evidencia:

- OpenAI en `quoter-v2-review.service.js`
- Power Automate en `publicBooking.route.js`
- S3 en `publicBooking.route.js` y `serviceOrderUploads.js`
- email en `booking-file-sale-notification.service.js`

Gap:

- faltan adapters internos que permitan cambiar proveedor o aislar cada integración

### 6. Base financiera todavía débil

Evidencia:

- `financials` en `ServiceOrder`
- `payments_status` en `BookingFile`

Gap:

- no existe subdominio financiero reusable y vendible

## Qué conviene mejorar primero

### Prioridad 1

- configuración central
- branding configurable
- centralización de constantes
- validaciones
- manejo de errores
- permisos

### Prioridad 2

- audit log base
- adapters internos
- feature flags básicos
- preparación de `company_id` / `tenant_id`

### Prioridad 3

- multiempresa real
- base financiera más formal
- integraciones más profundas

## Qué conviene dejar para segunda etapa

- multiempresa activa con aislamiento fuerte
- facturación/ERP más formal
- marketplace de integraciones
- automatizaciones avanzadas por empresa
- white-label completo

## Qué está mal acoplado hoy

- `Contact` como pseudo-CRM y agregador comercial
- branding en frontend
- URLs y despliegue en config fija
- integraciones directas dentro de servicios/rutas
- parte del quoter todavía con nombres y shapes heredados

## Qué sí puede convertirse en producto con poco cambio conceptual

- `Tariff V2`
- `Master Quoter V2`
- `Quoter V2`
- `Booking File`
- `Service Orders`
- `Biblia` derivada

Estas piezas ya tienen lógica de negocio reusable. La tarea no es reinventarlas, sino volverlas configurables y menos acopladas.
