# Technical Debt Priorities

Fecha: 2026-04-17

## 1. Deuda tecnica critica

## 1.1 Tests utiles insuficientes

Estado:

- critica

Evidencia:

- ya hubo cambios sobre tickets core hasta `TKT-010`
- no hay evidencia suficiente de una suite de smoke tests estable

Riesgo:

- regresiones silenciosas
- mas costo de soporte

Recomendacion:

- ejecutar `TKT-012` cuanto antes

## 1.2 Logging y observabilidad limitados

Estado:

- critica

Evidencia:

- `morgan`
- `console.log`
- `console.error`

Riesgo:

- soporte mas lento
- troubleshooting dificil en produccion

Recomendacion:

- ejecutar `TKT-013`

## 1.3 Permisos parcialmente aplicados

Estado:

- critica

Evidencia:

- frontend usa guard y metadata
- backend aplica mejor permisos en `service-orders`
- no todo el sistema usa el mismo nivel de enforcement

Riesgo:

- seguridad desigual
- falsos supuestos del frontend

Recomendacion:

- retomar `TKT-003` cuando se estabilicen los flujos sensibles

## 1.4 Frontera de integracion externa no definida

Estado:

- critica

Evidencia:

- no encontre integracion con Pipedrive en codigo
- el sistema ya no debe tratarse como CRM propio
- `Contact` arrastra responsabilidades comerciales historicas

Riesgo:

- duplicidad de datos
- ownership ambiguo entre plataformas
- futuras integraciones acopladas

Recomendacion:

- definir frontera tecnica con Pipedrive y ownership de datos

## 1.5 Controles financieros todavia incompletos

Estado:

- critica

Evidencia:

- `ServiceOrder` y `BookingFile` ya avanzaron
- la base financiera minima aun requiere cierre funcional

Riesgo:

- seguimiento parcial de costos y pagos
- menor claridad operativa

Recomendacion:

- ejecutar `TKT-011`

## 2. Deuda tecnica media

## 2.1 `Contact` sobredimensionado

Evidencia:

- mezcla datos de contacto con responsabilidades comerciales heredadas

Riesgo:

- dificil de evolucionar

Recomendacion:

- refactor gradual para dejarlo como referencia local enlazada a CRM externo

## 2.2 Mezcla de arquitectura legacy y moderna

Evidencia:

- `features/...` modernos
- `Services/` y `pages-quoter/` legacy
- rutas legacy en backend

Riesgo:

- curva de mantenimiento mas alta

Recomendacion:

- migracion gradual por modulos tocados

## 2.3 Integraciones acopladas

Evidencia:

- OpenAI directo
- S3 directo
- Power Automate directo

Riesgo:

- cambios mas costosos

Recomendacion:

- adapters internos cuando se toque cada integracion

## 3. Deuda tecnica baja

## 3.1 UI inconsistente entre modulos

Evidencia:

- modulos nuevos con mejor patron visual
- legacy con estilos menos consistentes

## 3.2 Catalogos y constantes dispersas

Evidencia:

- destinos hardcoded
- defaults embebidos

## 3.3 Tipado frontend desigual

Evidencia:

- modulos nuevos mejor tipados
- legacy con `any`

## 4. Orden recomendado para pagar deuda desde hoy

1. `TKT-011`
2. `TKT-012`
3. `TKT-013`
4. `TKT-014`
5. frontera de integracion con Pipedrive
6. `TKT-015`
7. `TKT-016`
8. `TKT-017`
9. `TKT-003`

## 5. Que deuda no conviene atacar aun

- reescritura global de frontend
- conversion total de rutas legacy a modulos nuevos
- CRM interno propio
- rediseño profundo de dominio financiero
