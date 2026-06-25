RUBRICA_PROYECTO_FINAL_MOVIL.md 

2026-06-09 

## Rúbrica de Evaluación — Proyecto Final Móvil Banco Andino 

## **Ecosistema móvil integrado: App Fuerza de Ventas (Flutter) + App Clientes / Homebanking móvil + Core Mobile (FastAPI), funcionando como un único proyecto end-to-end.** 

- **Puntaje total:** 20 puntos 

- **Criterios:** 5 criterios × 4 puntos cada uno 

- **Alcance:** Las tres piezas deben comportarse como **un solo sistema** que comparte la misma base de datos ( `bd_core_mobile` ), se conecta al núcleo financiero ( `bd_core_financiero` ) mediante el puente de sincronización, y permite flujos completos de extremo a extremo: el asesor origina un crédito en campo → el Core lo evalúa/aprueba/desembolsa → el cliente lo ve reflejado en su app. 

## Criterio 1 — Integración end-to-end (FVentas ↔ Core Mobile ↔ App Clientes) (4 pts) 

Evalúa que las tres piezas compartan la misma base de datos y que el flujo cruce de un sistema a otro sin rupturas, incluyendo el puente al núcleo financiero. 

|**Nivel**|**Pts**|**Descripción**|
|---|---|---|
|||El asesor registra una solicitud desde la**App FVentas**→ se encola en`sync_outbox`y|
|||se**promueve al Core**(`bd_core_financiero`:`dcliente`/`dsolicitud`) → el|
|**Excelente**|4|crédito/desembolso se**refleja de vuelta**en las tablas espejo`cr_*`y aparece en la|
|||**App Clientes**(créditos, cronograma, saldo y movimientos). Flujo completo verificado|
|||sobre una sola`bd_core_mobile`.|
|**Bueno**|3|El flujo cruza las tres piezas pero requiere algún paso manual (p.ej. disparar`POST`|
|||`/sync/promover`a mano) o un dato no se sincroniza automáticamente.|
|||FVentas, App Clientes y Core funcionan por separado sobre la misma BD, pero no|
|**Regular**|2|hay un flujo que los conecte (no hay puente al núcleo ni reflejo en la app de|
|||clientes).|
||0–||
|**Insuficiente**|1|Sistemas aislados, BDs distintas, o no hay integración.|



## Criterio 2 — App Fuerza de Ventas: originación de crédito en campo (4 pts) 

Evalúa el flujo del oficial de crédito: gestión de cartera, ficha, pre-evaluación, buró, solicitud y desembolso, alineado a la normativa de originación. 

|**Nivel**|**Pts**|**Descripción**|
|---|---|---|
|**Excelente**|4|Implementa**cartera offline-first**con filtros/orden y marca de visita (GPS);**ficha del**|
|||**cliente**(posición, historial, oferta, semáforo de riesgo);**pre-evaluación**|



1 / 4 

RUBRICA_PROYECTO_FINAL_MOVIL.md 

2026-06-09 

|**Nivel**|**Pts**|**Descripción**|
|---|---|---|
|||(elegibilidad/sujeto de crédito);**consulta de buró**(SBS + lista negra) con|
|||consentimiento firmado;**solicitud**por stepper con**simulador de cronograma**(RF-|
|||47) y**firma**;**transmisión/expediente**y registro real en backend.|
|**Bueno**|3|Implementa el flujo completo pero faltan 1–2 piezas (p.ej. simulador de cuotas sin|
|||cronograma, o buró sin lista negra/consentimiento).|
|**Regular**|2|Flujo básico solicitud→envío sin reglas de originación reales (sin pre-evaluación,<br>scoring ni buró).|
||0–||
|**Insuficiente**|1|No hay lógica de originación o es inventada/incoherente.|



## Criterio 3 — App Clientes (Homebanking móvil): autoservicio (4 pts) 

Evalúa que el cliente autenticado consulte y opere sus productos sobre los datos reales del Core compartido. 

|**Nivel**|**Pts**|**Descripción**|
|---|---|---|
|||Login del cliente con DNI;**perfil**,**cuentas de ahorro**(saldo),**créditos con**|
|**Excelente**|4|**cronograma de cuotas**,**movimientos**,**tarjetas**y**notificaciones**; y registro de|
|||**operaciones**(transferencia/pago) que impactan la BD. Todos los datos provienen de|
|||`bd_core_mobile`/espejo`cr_*`, coherentes con lo originado en FVentas.|
|**Bueno**|3|Consulta de productos completa, pero falta una vista (p.ej. tarjetas o notificaciones)|
|||o las operaciones no persisten/impactan saldos.|
|**Regular**|2|Solo login + una o dos consultas de productos, sin cronograma ni operaciones.|
||0–||
|**Insuficiente**|1|No existe la app de clientes o no opera sobre datos reales.|



## Criterio 4 — Seguridad y control de acceso por roles (RBAC + JWT) (4 pts) 

Evalúa autenticación, autorización por cargo y que cada actor (asesor, supervisor/admin, cliente) solo pueda hacer lo que le corresponde, validado en el backend. 

|**Nivel**|**Pts**|**Descripción**|
|---|---|---|
|||Login con**JWT**en las tres piezas (asesor en FVentas, cliente en App Clientes), token|
|||en almacenamiento seguro (`flutter_secure_storage`);**bloqueo por 5 intentos**|
|**Excelente**|4|persistente;**matriz de permisos por rol**(asesor / supervisor / administrador /|
|||cliente); acciones restringidas (p.ej.**reportes**solo supervisor/admin, endpoints de|
|||cliente solo con su propio token)**bloqueadas en backend**(401/403 a quien no|
|||corresponde).|
|**Bueno**|3|JWT + roles funcionando, pero algún permiso mal asignado o validado solo|
|||parcialmente en backend.|



2 / 4 

RUBRICA_PROYECTO_FINAL_MOVIL.md 

2026-06-09 

|**Nivel**|**Pts**|**Descripción**|
|---|---|---|
|**Regular**|2|Hay login pero el control de roles es parcial o solo en el frontend.|
||0–||
|**Insuficiente**|1|Sin autenticación real o cualquier usuario puede hacer cualquier cosa.|



## Criterio 5 — Calidad de datos, arquitectura y documentación (4 pts) 

Evalúa la consistencia de la BD compartida, la arquitectura en capas de cada pieza y la documentación de respaldo. 

|**Nivel**|**Pts**|**Descripción**|
|---|---|---|
|||`bd_core_mobile`con**integridad referencial**, tablas espejo`cr_*`del núcleo y|
|||puente`sync_outbox`/`sync_log`consistentes; datos demo**calibrados**(mora con|
|||semáforo, productos coherentes);**arquitectura por capas**en el Core|
|**Excelente**|4|(rutas→controladores→servicios/repositorios→BD) y**MVVM/Riverpod**offline-first|
|||en Flutter (data/domain/presentation);**DDL y scripts SQL/seed versionados**;|
|||**Historias de Usuario + RF**y**diagramas UML completos**(clases, secuencia,|
|||componentes, casos de uso, estados).|
|**Bueno**|3|Arquitectura y datos correctos, pero documentación, UML o scripts incompletos.|
|**Regular**|2|Funciona pero con datos inconsistentes o sin documentación.|
||0–||
|**Insuficiente**|1|Datos incoherentes, sin estructura ni documentación.|



## Resumen de puntaje 

|**#**|**Criterio**|**Pts**|
|---|---|---|
|1|Integración end-to-end (FVentas ↔ Core Mobile ↔ Clientes)|4|
|2|App Fuerza de Ventas — originación de crédito en campo|4|
|3|App Clientes (Homebanking móvil) — autoservicio|4|
|4|Seguridad y RBAC (JWT + roles)|4|
|5|Calidad de datos, arquitectura y documentación|4|
||**TOTAL**|**20**|



## Escala de calificación 

|**Rango**|**Calificación**|
|---|---|
|18 – 20|Sobresaliente|
|14 – 17|Notable|



3 / 4 

RUBRICA_PROYECTO_FINAL_MOVIL.md 

2026-06-09 

|**Rango**|**Calificación**|
|---|---|
|11 – 13|Aprobado|
|0 – 10|Desaprobado|



## Hoja de autoevaluación 

|**#**|**Criterio**|**Nivel**|**Pts**|**Evidencia /**|
|---|---|---|---|---|
|||**obtenido**||**Observación**|
|1|Integración end-to-end (FVentas ↔ Core ↔<br>Clientes)||/ 4||
|2|App Fuerza de Ventas — originación||/ 4||
|3|App Clientes — autoservicio||/ 4||
|4|Seguridad y RBAC||/ 4||
|5|Calidad de datos, arquitectura y documentación||/ 4||
||**TOTAL**||**/**||
||||**20**||



4 / 4 

