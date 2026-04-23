# System Productization Audit

> Nota 2026-04-17:
> Este documento queda como referencia historica de una exploracion anterior.
> La direccion actual del proyecto ya no es productization inmediata ni CRM interno.
> El alcance vigente prioriza mejoras del sistema actual, con Pipedrive como CRM externo.

Fecha: 2026-04-15

## 1. Objetivo de esta auditoría

Esta auditoría evalúa el sistema actual con dos lentes al mismo tiempo:

- continuidad y utilidad para la empresa actual
- capacidad de evolucionar gradualmente hacia una plataforma más configurable y potencialmente vendible a otras agencias

La evaluación está basada en evidencia real del código en:

- `frontend/`
- `back-end/`

No se propone reescritura total. La recomendación general es evolucionar sobre lo ya construido.

## 2. Resumen ejecutivo

El sistema ya tiene una base sólida en piezas core del negocio:

- `Quoter V2`
- `Master Quoter V2`
- `Tariff V2`
- `Booking File`
- `Service Orders`
- `Biblia` como vista derivada

Estas piezas son valiosas no solo para la empresa actual, sino también como base de producto.

La principal limitación para productización no es funcional sino estructural:

- demasiada lógica y configuración pensada para una sola operación
- branding y despliegue acoplados a Kuoda
- ausencia de capa de configuración por empresa
- ausencia de tenant model
- permisos parciales
- validaciones heterogéneas
- manejo de errores inconsistente
- poco hardening para producción y para integraciones

Conclusión:

- el sistema **sí es productizable**
- **no conviene reescribirlo**
- conviene primero **productizar la base actual**
- la mejor estrategia es fortalecer módulos core y añadir una capa de configuración y extensibilidad

## 3. Qué existe hoy y sirve como base de producto

### 3.1 Frontend

Stack real confirmado:

- Angular 18 standalone
- Tailwind CSS
- Angular CDK / Material parcial
- features nuevas con `data-access`, `pages`, `ui`

Evidencia:

- `frontend/src/app/app.routes.ts`
- `frontend/src/app/features/service-orders/...`
- `frontend/src/app/features/booking-files/...`
- `frontend/package.json`

Hallazgo:

- el frontend no está desordenado por completo; está en transición
- hay una parte legacy y una parte moderna
- eso permite una evolución incremental sin rehacer toda la UI

### 3.2 Backend

Stack real confirmado:

- Node.js + Express
- MongoDB + Mongoose
- módulos nuevos bajo `src/modules/*`
- rutas legacy bajo `src/Rutas/*`

Evidencia:

- `back-end/index.js`
- `back-end/src/Rutas/index.js`
- `back-end/src/modules/*`
- `back-end/src/models/*`

Hallazgo:

- el backend tiene una mezcla de estilos, pero ya existen dominios con una modularidad razonable
- especialmente `tariff-v2`, `master-quoter-v2`, `quoter-v2`, `itinerary`

### 3.3 Módulos funcionales reales

#### Quoter

Existe realmente:

- CRUD
- pricing
- export PDF/Excel
- confirmación de venta
- review agent

Evidencia:

- `back-end/src/modules/quoter-v2/...`
- `frontend/src/app/pages-quoter/quoter-v2/...`

Estado:

- `Parcial alto`

#### Master Quoters

Existe realmente:

- templates por día
- ítems ligados a tarifas
- resolved templates

Evidencia:

- `back-end/src/modules/master-quoter-v2/...`
- `frontend/src/app/pages-quoter/master-quoter-v2/...`

Estado:

- `Parcial alto`

#### Tarifario

Existe realmente:

- catálogo estructurado
- pricing modes
- vigencias
- child policies
- filtros

Evidencia:

- `back-end/src/modules/tariff-v2/...`
- `frontend/src/app/pages/tariff-v2/...`

Estado:

- `Completo para la etapa actual`

#### File

Existe realmente:

- expediente central del viaje vendido
- snapshot comercial
- snapshot operativo
- estados por área
- riesgo
- próxima acción

Evidencia:

- `back-end/src/models/booking_file.schema.js`
- `back-end/src/Rutas/BookingFiles/bookingFiles.route.js`
- `frontend/src/app/features/booking-files/...`

Estado:

- `Muy bien orientado`

#### Operaciones

Existe realmente:

- service orders
- service order templates
- operational itinerary
- booking files

Evidencia:

- `back-end/src/models/service_order.schema.js`
- `back-end/src/models/service_order_template.schema.js`
- `back-end/src/Services/service-orders/service-order.orchestrator.js`
- `frontend/src/app/features/service-orders/...`

Estado:

- `Parcial alto`

#### Biblia

Existe realmente:

- vista diaria derivada desde `BookingFile` + `ServiceOrder`

Evidencia:

- `back-end/src/Services/booking-files/booking-file-biblia.service.js`
- `frontend/src/app/operations/biblia/biblia.component.ts`

Estado:

- `Bien resuelto conceptualmente`

#### Usuarios y roles

Existe realmente:

- usuarios
- roles
- catálogo de permisos
- guard frontend

Evidencia:

- `back-end/src/Rutas/User/user.route.js`
- `back-end/src/Rutas/Roles/role.route.js`
- `back-end/src/security/permissions.js`
- `frontend/src/app/ManageUsersComponent/...`

Estado:

- `Parcial`

#### Automatizaciones

Existe realmente:

- venta -> file
- venta -> service orders
- notificación por venta
- public booking form con S3 y Power Automate

Evidencia:

- `back-end/src/modules/quoter-v2/api/quoter-v2.controller.js`
- `back-end/src/Services/service-orders/service-order.orchestrator.js`
- `back-end/src/Services/booking-files/booking-file-sale-notification.service.js`
- `back-end/src/Rutas/PublicBooking/publicBooking.route.js`

Estado:

- `Parcial`

#### Base financiera

Existe realmente:

- financials por service order
- payment status
- órdenes financieras básicas

Evidencia:

- `back-end/src/models/service_order.schema.js`
- `back-end/src/Services/booking-files/booking-file-summary.service.js`

Estado:

- `Parcial bajo`

#### Configuración del sistema

Existe realmente:

- `environment.ts`
- `environment.prod.ts`
- variables de entorno backend

Evidencia:

- `frontend/src/enviroments/environment.ts`
- `frontend/src/enviroments/environment.prod.ts`
- `back-end/index.js`
- `back-end/src/Rutas/PublicBooking/publicBooking.route.js`

Estado:

- `Parcial bajo`

## 4. Qué está demasiado específico para una sola empresa

Este es el punto más importante para productización.

### Branding acoplado

Evidencia:

- `frontend/src/index.html` usa título `Quoter Kuoda`
- `frontend/src/app/components/sidebar/sidebar.component.html` usa logo fijo `/images/image.png`
- Firebase está ligado a `kuoda-cotizador-30b67`

Diagnóstico:

- branding y despliegue están acoplados a una sola marca/proyecto

### Configuración de despliegue acoplada

Evidencia:

- `frontend/src/enviroments/environment*.ts`
- `back-end/index.js` con CORS de URLs fijas
- `back-end/src/Rutas/PublicBooking/publicBooking.route.js` con `DEFAULT_PUBLIC_APP_URL`

Diagnóstico:

- el sistema hoy distingue ambientes, pero no distingue empresa/tenant

### Catálogos y comportamiento embebidos

Evidencia:

- destinos fijos en `quoter-v2-form.component.ts`
- roles base fijos en `back-end/src/security/access-policies.js`
- permisos catalogados en `back-end/src/security/permissions.js`

Diagnóstico:

- muchos catálogos son válidos hoy, pero están duros en código
- eso sirve para una sola operación, no para un producto configurable

### Capa organizacional inexistente

No encontré evidencia suficiente de:

- `Tenant`
- `Company`
- `Organization`
- `Workspace`
- `BrandProfile`

Diagnóstico:

- hoy todo el sistema asume una sola empresa

## 5. Qué está bien preservado y conviene mantener

### Mantener casi tal cual

- `Tariff V2`
- `BookingFile` como expediente central
- `ServiceOrder` como unidad de ejecución
- `Biblia` como vista derivada
- flujo base `quote sold -> booking file -> service orders`

### Mantener pero fortalecer

- `Quoter V2`
- `Master Quoter V2`
- permisos
- public booking flow

## 6. Hallazgos por área técnica

### Permisos

Sí existe:

- catálogo de permisos
- route metadata
- scope por áreas operativas

Problemas:

- enforcement backend incompleto
- roles muy funcionales y poco configurables
- todavía no existe una buena base para permisos por empresa o por feature

### Validaciones

Sí existe:

- buenas validaciones en `tariff-v2`
- validaciones decentes en `master-quoter-v2`

Problemas:

- rutas legacy validan poco
- no hay capa consistente de DTO/schema validation

### Manejo de errores

Sí existe:

- interceptor frontend
- middleware backend genérico

Problemas:

- estructura de errores inconsistente
- `manejarError` es demasiado genérico
- algunos controladores devuelven mensajes específicos, otros no

### Configuración

Sí existe:

- environments frontend
- `.env` backend

Problemas:

- no existe `config module`
- no hay separación entre config técnica, branding, catálogos y feature toggles

### Tests

No encontré evidencia suficiente de cobertura útil.

Hallazgos:

- frontend tiene soporte Karma en `angular.json`
- backend no tiene tests reales; `package.json` usa placeholder

### Documentación

Hallazgos:

- README de frontend es genérico Angular
- no encontré documentación técnica viva del dominio

## 7. Qué mejorar primero para productización sin romper lo actual

### Primera prioridad

- centralizar configuración
- mejorar permisos
- mejorar validaciones
- mejorar manejo de errores
- centralizar constantes y catálogos
- aislar branding

### Segunda prioridad

- introducir capa base de empresa/tenant
- feature flags
- adapters internos para integraciones
- audit log transversal

### Tercera prioridad

- base financiera más formal
- configuración avanzada por empresa
- empaquetado real como producto

## 8. Arquitectura futura más conveniente para producto

La arquitectura más pragmática no es microservicios ni multi-tenant complejo desde el día uno. La mejor evolución sería:

### Etapa 1

- monolito modular más ordenado
- config centralizada
- branding configurable
- permisos más consistentes
- validaciones y errores estandarizados

### Etapa 2

- tenant-aware single database
- `company_id` o `tenant_id` en entidades core
- catálogos configurables por empresa
- feature flags por empresa

### Etapa 3

- adapters para email, storage, automation, AI e integrations
- separación gradual de bounded contexts cuando el negocio lo justifique

## 9. Decisión final

Sí es razonable evolucionar este sistema hacia una plataforma vendible, pero el camino correcto no es “hacer SaaS” de golpe.

El orden correcto es:

1. consolidar lo core actual
2. remover acoplamientos de una sola empresa
3. crear capa de configuración y branding
4. preparar multiempresa futura
5. recién después endurecer el empaquetado como producto

El sistema ya tiene piezas con valor de producto real. La oportunidad está en volverlas configurables, mantenibles y menos acopladas a una sola operación.
