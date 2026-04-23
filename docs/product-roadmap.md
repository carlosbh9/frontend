# Product Roadmap

> Nota 2026-04-17:
> Este documento queda como referencia historica de una exploracion anterior.
> La direccion actual del proyecto ya no es productization inmediata ni CRM interno.
> El alcance vigente prioriza mejoras del sistema actual, con Pipedrive como CRM externo.

## Objetivo general

Evolucionar el sistema actual sin romper operación, para que:

- siga sirviendo a la empresa actual
- sea más mantenible
- pueda soportar configuración por empresa
- tenga base para multiempresa futura
- pueda venderse como producto más adelante

## Fase 0: hardening mínimo

### Objetivo

Preparar una base más segura y estable para cualquier evolución posterior.

### Cambios sugeridos

- estandarizar errores backend
- mejorar validaciones de rutas críticas
- revisar permisos backend
- agregar `health` endpoint
- agregar `rate limiting`
- documentar variables de entorno
- eliminar hardcodes residuales de secretos

### Beneficio

- menos riesgo técnico
- mejor soporte
- base más confiable para productización

## Fase 1: productización foundation

### Objetivo

Separar “core product” de “datos/config actual de Kuoda”.

### Cambios sugeridos

- crear `config module` base
- centralizar constantes y catálogos
- hacer branding configurable
- externalizar nombre del sistema, logo, colores base, URLs públicas
- revisar catálogos hardcoded en frontend/backend
- preparar feature flags básicos

### Beneficio

- menos acoplamiento a una sola empresa
- más capacidad de personalización

## Fase 2: product core consolidation

### Objetivo

Fortalecer las piezas core que realmente venderían el producto.

### Cambios sugeridos

- consolidar `Tariff V2` como source of truth
- endurecer `Quoter V2`
- mejorar `Master Quoter V2`
- consolidar `BookingFile` como expediente central
- fortalecer `ServiceOrder` como base operativa
- preservar `Biblia` como vista derivada

### Beneficio

- producto más coherente
- mayor valor reutilizable entre empresas

## Fase 3: extensibility layer

### Objetivo

Preparar el sistema para integraciones futuras sin acoplar más el core.

### Cambios sugeridos

- adapters internos para:
  - email
  - storage
  - automation provider
  - AI provider
  - external launch/integration flows
- audit log base
- eventos internos básicos

### Beneficio

- futuras integraciones sin reescribir módulos core

## Fase 4: tenant-aware architecture

### Objetivo

Preparar base real para multiempresa futura, sin activar todavía toda la complejidad SaaS.

### Cambios sugeridos

- introducir entidad `Company` o `Tenant`
- preparar `company_id` en entidades core
- separar config global vs config por empresa
- permisos por empresa
- feature flags por empresa

### Beneficio

- base real para producto vendible
- mejor escalabilidad comercial

## Fase 5: financial and operational expansion

### Objetivo

Agregar capacidades que aumenten el valor vendible del producto.

### Cambios sugeridos

- base financiera más formal
- pagos cliente/proveedor
- margen proyectado vs real
- incidencias
- rooming
- automatizaciones SLA

### Beneficio

- mayor profundidad funcional
- mejor diferenciación como producto

## Qué conviene hacer primero

1. hardening técnico
2. config module
3. branding configurable
4. constantes y catálogos centralizados
5. permisos y validaciones
6. adapters internos

## Qué conviene dejar para después

1. multiempresa activa
2. white-label completo
3. financial suite más profunda
4. automatizaciones avanzadas
5. empaquetado SaaS comercial completo
