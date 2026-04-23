# Roadmap Recommendations

Fecha: 2026-04-17

## Principios

- No reescribir lo que ya funciona.
- Consolidar antes de expandir.
- Mantener `BookingFile` como expediente central.
- Mantener `Biblia` como vista derivada.
- Usar `Tariff` como fuente primaria de costos.
- Mantener Pipedrive como CRM externo.
- No duplicar pipeline comercial dentro del sistema.

## Estado de avance

Ya ejecutado:

- `TKT-001`
- `TKT-002`
- `TKT-004`
- `TKT-005`
- `TKT-006`
- `TKT-007`
- `TKT-008`
- `TKT-009`
- `TKT-010`

Pendiente:

- `TKT-011`
- `TKT-012`
- `TKT-013`
- `TKT-014`
- deuda tecnica posterior

## Fase inmediata: cerrar base operativa

### Objetivo

Cerrar los huecos mas importantes despues del avance ya ejecutado.

### Cambios sugeridos

- `TKT-011`: controles financieros minimos
- `TKT-012`: smoke tests
- `TKT-013`: logging tecnico minimo
- `TKT-014`: documentacion operativa y ownership de datos

### Riesgo

- Bajo a medio

### Beneficio

- mas estabilidad
- mejor soporte
- mejor lectura operativa y financiera

## Fase siguiente: frontera con Pipedrive

### Objetivo

Conectar la capa comercial con el CRM externo sin reconstruir un CRM interno.

### Cambios sugeridos

- definir ownership de datos
- agregar referencias externas minimas
- encapsular Pipedrive en un adapter interno
- decidir primera estrategia de sincronizacion

### Riesgo

- Medio

### Beneficio

- menos duplicidad
- menos hardcodes comerciales
- mejor claridad de responsabilidades entre sistemas

## Fase posterior: sostenibilidad tecnica

### Objetivo

Reducir deuda sin abrir frentes funcionales innecesarios.

### Cambios sugeridos

- `TKT-015`
- `TKT-016`
- `TKT-017`
- luego `TKT-003` cuando el modelo se estabilice

### Riesgo

- Medio

### Beneficio

- mas mantenibilidad
- menos fragilidad en legacy

## Refactors estructurales recomendados

### Backend

- migrar rutas legacy criticas a servicios
- centralizar autorizacion
- crear capa ligera de adapters para integraciones externas

### Frontend

- mover legacy hacia patron `features`
- reducir `any`
- seguir separando el form del quoter en piezas mas pequeñas y tipadas

## Modulos que conviene consolidar antes de crear otros

1. `quoter-v2`
2. `booking-files`
3. `service-orders`
4. `contact` como referencia local
5. integraciones externas

## Modulos que no conviene tocar todavia

1. `tariff-v2`
2. `booking-file summary` como concepto base
3. `booking-file-biblia` como concepto derivado
4. la orquestacion base de `service orders`
5. un CRM interno propio
