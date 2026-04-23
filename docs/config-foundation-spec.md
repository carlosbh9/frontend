# Config Foundation Spec

Fecha: 2026-04-15

## 1. Objetivo

Preparar la primera base de productización sin romper el sistema actual.

Este paso no busca multiempresa completa ni refactors grandes. Busca separar lo que hoy está acoplado a una sola empresa para dejar lista una fundación reusable.

Alcance de esta fase:

- inventario de hardcodes single-company
- diseño inicial de `config module`
- diseño inicial de branding configurable
- diseño inicial de feature flags
- contrato mínimo de rollout técnico

No incluye implementación todavía.

## 2. Objetivo de negocio

Resolver el problema más inmediato de productización:

- hoy el sistema funciona para la empresa actual
- pero muchas decisiones de marca, despliegue y comportamiento están embebidas en código

Esta fase debe permitir:

- cambiar branding sin tocar módulos de negocio
- mover configuración fuera de componentes y rutas
- activar/desactivar capacidades por ambiente o futura empresa
- preparar el terreno para una futura entidad `Company` o `Tenant`

## 3. Evidencia real de hardcodes actuales

### Branding y nombre del sistema

Evidencia:

- `frontend/src/index.html` usa `Quoter Kuoda`
- `frontend/src/app/components/sidebar/sidebar.component.html` usa logo fijo `/images/image.png`

Diagnóstico:

- el shell visual está acoplado a una sola marca

### Firebase y despliegue frontend

Evidencia:

- `frontend/src/enviroments/environment.ts`
- `frontend/src/enviroments/environment.prod.ts`

Hallazgos:

- `firebaseConfig` está fijo a `kuoda-cotizador-30b67`
- el deploy actual está ligado a ese proyecto

Diagnóstico:

- sirve para la empresa actual
- no sirve como base reusable de producto

### URLs y CORS

Evidencia:

- `back-end/index.js`
- `back-end/src/Rutas/PublicBooking/publicBooking.route.js`

Hallazgos:

- CORS lista URLs específicas
- `DEFAULT_PUBLIC_APP_URL` es fijo
- hay referencias a localhost y dominios concretos

Diagnóstico:

- falta centralización de entorno público

### Catálogos embebidos

Evidencia:

- `frontend/src/app/pages-quoter/quoter-v2/quoter-v2-form/quoter-v2-form.component.ts`
- `back-end/src/security/access-policies.js`
- `back-end/src/security/permissions.js`

Hallazgos:

- destinos comerciales fijos
- roles base fijos
- permisos base fijos

Diagnóstico:

- algunos catálogos son core del producto
- otros deberían ser configurables

### Integraciones directas

Evidencia:

- `back-end/src/Rutas/PublicBooking/publicBooking.route.js`
- `back-end/src/utils/serviceOrderUploads.js`
- `back-end/src/Services/booking-files/booking-file-sale-notification.service.js`
- `back-end/src/modules/quoter-v2/application/services/quoter-v2-review.service.js`

Hallazgos:

- OpenAI, S3, email y Power Automate están conectados de forma directa

Diagnóstico:

- todavía no hace falta rehacer integraciones
- pero sí conviene que config y proveedor estén externalizados

## 4. Decisión arquitectónica para este paso

La decisión recomendada es:

- **no crear todavía multiempresa real**
- **sí crear una capa de configuración base**

Esta capa debe separar cuatro grupos:

1. config técnica
2. branding
3. feature flags
4. catálogos configurables

## 5. Diseño recomendado del `config module`

## 5.1 Objetivo

Tener una fuente central para configuración del sistema, sin dispersar valores entre components, services, `environment.ts`, rutas Express y constantes sueltas.

## 5.2 Alcance inicial del config module

### A. Technical config

- `publicAppUrl`
- `apiBaseUrl`
- `allowedOrigins`
- `storageProvider`
- `emailProvider`
- `aiProvider`
- `automationProvider`

### B. Branding config

- `systemName`
- `systemShortName`
- `logoUrl`
- `faviconUrl`
- `primaryColor`
- `accentColor`
- `supportEmail`

### C. Feature flags

- `enableAiQuoteReview`
- `enablePublicBooking`
- `enableBookingNotifications`
- `enableItineraryBuilderBridge`
- `enableFinancialControls`

### D. Business config

- `availableDestinations`
- `defaultCurrency`
- `enabledModules`
- `visibleOperationsAreas`

## 5.3 Fuente inicial de configuración

Primera etapa recomendada:

- backend:
  - variables de entorno
  - defaults centralizados en un único módulo
- frontend:
  - `environment.ts` solo para bootstrap
  - config consumida desde un endpoint backend o desde una sola capa de app config

Decisión pragmática:

- en una primera iteración, la fuente de verdad debe ser el backend
- el frontend debe consumir config ya resuelta

## 6. Diseño recomendado de branding configurable

### 6.1 Objetivo

Separar la identidad visual del producto del código funcional.

### 6.2 Primer alcance

Campos mínimos:

- `systemName`
- `logoUrl`
- `primaryColor`
- `supportEmail`

### 6.3 Dónde impacta primero

- `frontend/src/index.html`
- `frontend/src/app/components/sidebar/sidebar.component.html`
- login/header si corresponde

### 6.4 Qué no hacer todavía

- white-label completo
- theming complejo por cliente
- editor visual de branding

## 7. Diseño recomendado de feature flags básicos

### 7.1 Objetivo

Activar o desactivar funcionalidades de forma segura por ambiente y, más adelante, por empresa.

### 7.2 Flags iniciales sugeridos

- `enableAiQuoteReview`
- `enablePublicBooking`
- `enableBookingNotifications`
- `enableItineraryBuilderBridge`
- `enableFinancialControls`

### 7.3 Dónde se usarían primero

- review button en `quoter-v2`
- rutas y acciones de booking público
- envío de notifications al confirmar venta
- bridge a itinerary builder
- controles financieros en service orders

### 7.4 Qué no hacer todavía

- motor complejo de reglas
- flags por usuario
- consola administrativa de flags

## 8. Catálogos: qué centralizar primero

## 8.1 Core product constants

Mantener centralizados pero no necesariamente configurables por empresa todavía:

- estados de `BookingFile`
- estados de `ServiceOrder`
- tipos de orden
- permisos base

## 8.2 Configurables por empresa a futuro

Primeros candidatos:

- destinos comerciales visibles
- branding
- módulos habilitados
- emails de soporte/notificación
- defaults públicos

## 8.3 No tocar todavía

- reglas core de `tariff-v2`
- estructuras base de `service_order`
- lógica derivada de `biblia`

## 9. Archivos y áreas impactadas en una futura implementación

### Backend

- `back-end/index.js`
- `back-end/src/Rutas/PublicBooking/publicBooking.route.js`
- `back-end/src/Services/booking-files/booking-file-sale-notification.service.js`
- `back-end/src/modules/quoter-v2/application/services/quoter-v2-review.service.js`
- nuevo módulo o servicio central de config

### Frontend

- `frontend/src/enviroments/environment.ts`
- `frontend/src/enviroments/environment.prod.ts`
- `frontend/src/index.html`
- `frontend/src/app/components/sidebar/sidebar.component.html`
- `frontend/src/app/app.config.ts`
- pantallas con acciones opcionales ligadas a flags

## 10. Orden exacto recomendado de implementación

### Paso 1

Crear inventario consolidado de:

- branding hardcoded
- URLs públicas
- origins permitidos
- proveedores externos
- catálogos duros

### Paso 2

Crear estructura interna de config central en backend:

- defaults
- lectura desde env
- validación básica

### Paso 3

Exponer config pública mínima para frontend:

- branding
- flags
- URLs públicas

### Paso 4

Conectar el shell frontend a esa config:

- título
- logo
- labels principales

### Paso 5

Conectar flags básicos a features visibles

## 11. Riesgos y mitigaciones

### Riesgo 1

Romper bootstrapping del frontend

Mitigación:

- mantener fallback local en `environment.ts` mientras se migra

### Riesgo 2

Romper rutas públicas o notificaciones

Mitigación:

- mover primero config, no comportamiento

### Riesgo 3

Introducir sobreingeniería

Mitigación:

- limitar este paso a config, branding y flags mínimos

## 12. Criterio de éxito de esta fase

Esta fase estará bien resuelta cuando:

- el nombre del sistema ya no esté fijo a Kuoda en varias capas
- el logo ya no esté hardcoded en el shell
- las URLs públicas y origins estén centralizados
- haya una estructura clara de flags básicos
- la configuración esté preparada para futura empresa/tenant sin haber implementado multiempresa todavía

## 13. Decisión final

El siguiente paso correcto para este proyecto es:

- **implementar una fundación de configuración**

No conviene todavía:

- crear multiempresa
- rehacer auth
- rehacer frontend
- rehacer todos los módulos legacy

Sí conviene ahora:

- `config module`
- branding configurable
- feature flags básicos
- inventario y externalización gradual de hardcodes single-company
