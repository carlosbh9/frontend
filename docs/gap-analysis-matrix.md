# Gap Analysis Matrix

Estados usados:

- Completo
- Parcial
- Ausente
- Duplicado
- Riesgoso
- Mal acoplado
- Mejorable
- Fuera de alcance interno

| Capacidad esperada | Estado actual | Evidencia encontrada en codigo | Brecha | Recomendacion |
| --- | --- | --- | --- | --- |
| CRM comercial principal | Fuera de alcance interno | No se encontro modulo CRM completo y ahora el alcance correcto apunta a Pipedrive | Riesgo de confundir responsabilidades del sistema | Mantener CRM en Pipedrive |
| Integracion con Pipedrive | Ausente | No encontre evidencia suficiente en frontend ni backend | No existe frontera tecnica con el CRM externo | Definir adapter, ownership de datos y referencias externas |
| Leads | Fuera de alcance interno | No encontre entidad ni endpoints | No deben construirse localmente si Pipedrive sera el CRM | Consumirlos desde integracion si hace falta |
| Opportunities / Deals | Fuera de alcance interno | No encontre evidencia suficiente | No deben duplicarse internamente | Referenciar deal externo en entidades locales cuando aplique |
| Actividades comerciales | Fuera de alcance interno | No encontre entity/activity log comercial | No deben recrearse en el sistema | Mantener timeline comercial en Pipedrive |
| Historial de interaccion | Fuera de alcance interno | No hay timeline comercial local util | No corresponde duplicarlo si vive en CRM | Exponer referencias o links a Pipedrive |
| Contacts | Parcial | `Contact` tiene `owner`, `status`, `cotizations`, `soldQuoterId` | Sobrecarga funcional historica | Mantener `Contact` como referencia local enlazada a CRM externo |
| Quoter CRUD | Completo | `quoter-v2` routes + form + list | Base buena | Mantener |
| Pricing | Parcial | backend pricing real y calculo frontend para UX | Duplicidad de logica | Backend como fuente y frontend como preview |
| Versiones de quote | Parcial | `Contact.cotizations` y contratos de quoter | Versionado todavia simple | Formalizar versionado sin reabrir CRM interno |
| Exportacion / preview | Completo | PDF/Excel en frontend | Mejorable UI/UX | Mantener |
| Aprobacion de quote | Ausente | No encontre workflow de aprobacion | Falta control interno | Agregar approval flow liviano si negocio lo necesita |
| Congelado de venta | Completo | `BookingFile.sales_snapshot` e `itinerary_snapshot` | Bien orientado | Mantener |
| Master Quoters | Parcial | CRUD, resolved, dias/items | Sin versionado fuerte | Agregar versiones y bloques si realmente hace falta |
| Tarifario | Completo | `TariffItemV2` con pricing modes, validity, childPolicies | Muy buena base | Consolidar como source of truth |
| Vigencias / temporadas | Completo | Schema y validaciones | Bien resuelto | Mantener |
| Source of truth de costos | Parcial | Existe en tarifario, pero quote persiste costos propios | No esta forzado en todos los flujos | Trazar referencias y origen de costo |
| File como expediente central | Completo | `BookingFile` | Muy buena base | Consolidar |
| Service Orders | Completo | modelo, templates, store, endpoints | Buena base | Seguir creciendo sobre esto |
| Rooming | Ausente | No encontre evidencia suficiente | Gap operativo | Crear submodulo en file cuando sea prioridad real |
| Incidencias | Ausente | No encontre entidad | Gap operativo | Crear `Incident` despues de soporte y finanzas |
| Timeline operativo | Parcial | `operational_itinerary` | Falta criticidad/SLA mas robusto | Expandir gradualmente |
| Responsables por area | Parcial | `assigneeId` y areas por role | Aun basico | Agregar ownership por area/file |
| Estado operativo real | Parcial | summary derivado desde orders + file | Bien orientado, no exhaustivo | Consolidar derivacion |
| Cuentas por cobrar | Ausente | No encontre modulo | Falta financiera critica | Resolver primero con accounting-lite |
| Cuentas por pagar | Ausente | No encontre modulo | Falta financiera critica | Resolver primero con accounting-lite |
| Pagos clientes | Parcial | `paymentStatus` y ordenes financieras | Sin ledger ni conciliacion | Extender controles en `TKT-011` |
| Pagos proveedores | Parcial | `financials` en service orders | Sin control contable formal | Extender controles en `TKT-011` |
| Conciliacion | Ausente | No encontre evidencia suficiente | Riesgo financiero | Crear conciliacion simple despues de controles minimos |
| Margen proyectado vs real | Ausente | No encontre calculo consolidado | Sin control de rentabilidad real | Calcular sobre venta + costos reales cuando cierre `TKT-011` |
| Biblia derivada | Completo | `booking-file-biblia.service` | Correcto | Mantener como vista derivada |
| Roles | Parcial | `Roles`, catalogo de permisos, role scopes | Cobertura desigual | Completar enforcement backend mas adelante |
| Permisos granulares | Parcial | permisos en frontend y service orders | No cubre todo el sistema | Retomar con `TKT-003` |
| Auditoria de cambios | Parcial | `auditLogs` en service orders | No existe a nivel plataforma | Crear `audit-log` transversal cuando soporte basico este listo |
| Proteccion de rutas | Parcial | guard frontend y authenticate backend | Cobertura irregular | Alinear frontend/backend |
| Manejo de sesion/token | Riesgoso | JWT en `localStorage`, sin refresh strategy | Riesgo de seguridad | Endurecer auth |
| Venta -> file automatico | Completo | `confirmSale` crea/actualiza file | Buena base | Mantener |
| File -> service orders automatico | Completo | orchestrator por venta cerrada | Buena base | Mantener |
| Alertas SLA | Ausente | No encontre jobs/queues | Falta automatizacion | Agregar scheduler/queue luego de logging y docs |
| Recordatorios | Parcial | `passenger_info_status` tiene campos, no jobs | Falta ejecucion real | Agregar cron/jobs |
| Avisos de pagos pendientes | Ausente | No encontre proceso automatico | Falta seguimiento financiero | Jobs por due date despues de `TKT-011` |
| IA review de quoter | Parcial | `quoter-v2-review.service` con OpenAI | Inicial | Mantener y evaluar |
| IA operativa | Ausente | No encontre copiloto sobre files/orders | Oportunidad real | Siguiente fase sobre `BookingFile` |
| Arquitectura modular | Parcial | modulos nuevos si, legacy no tanto | Mezcla de estilos | Consolidar por dominio |
| Manejo de errores | Parcial alto | ya hubo trabajo en tickets iniciales | Aun requiere verificacion transversal | Mantener contrato y ampliar cobertura en tests |
| Logs | Parcial bajo | `morgan` + `console` | Sin structured logging | Ejecutar `TKT-013` |
| Observabilidad | Ausente | No encontre metricas/tracing reales | Falta produccion real | Health + logging + metricas basicas |
| Validaciones | Parcial alto | hubo trabajo en rutas criticas | Aun no esta homogeneo en todo el sistema | Consolidar y testear |
| Performance / paginacion | Parcial | varios listados paginados | No universal | Completar server-side filters |
| Backups | Ausente | No encontre evidencia suficiente | Riesgo operacional | Documentar y automatizar |
| Config por ambientes | Parcial | frontend envs y backend `.env` | Sin estrategia formal documentada | Crear `.env.example` y docs |
| Testing | Ausente | no encontre suite util consolidada | Riesgo alto | Agregar smoke tests |
| Documentacion tecnica | Parcial | ya existen docs internas, pero no estan cerradas para operacion | Falta documentacion operativa final | Ejecutar `TKT-014` |
