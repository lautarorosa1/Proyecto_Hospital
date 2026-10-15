# API - Módulo Gestión de Recursos y Camas

**Módulo:** Recursos y Camas  
**Responsable Asignado:** Agus  
**URL Base:** `http://localhost:3000`  

No hay login en esta entrega. `usuario_id`, `paciente_id` y `referencia_id` llegan como números. Los errores responden `{ "error": "mensaje" }`.

---

## Endpoints

| Método | Ruta | Descripción | Código de respuesta |
| :--- | :--- | :--- | :--- |
| `GET` | `/habitaciones` | Listar habitaciones | `200` |
| `GET` | `/habitaciones/:id` | Obtener una habitación | `200` / `400` / `404` |
| `POST` | `/habitaciones` | Crear una habitación | `201` / `400` |
| `PUT` | `/habitaciones/:id` | Actualizar una habitación | `200` / `400` / `404` |
| `DELETE` | `/habitaciones/:id` | Eliminar una habitación | `204` / `400` / `404` |
| `GET` | `/insumos` | Listar insumos | `200` |
| `GET` | `/insumos/stock` | Consultar el stock de todos los insumos | `200` |
| `GET` | `/insumos/:id` | Obtener un insumo | `200` / `400` / `404` |
| `GET` | `/insumos/:id/stock` | Consultar el stock de un insumo | `200` / `400` / `404` |
| `POST` | `/insumos` | Crear un insumo con stock inicial | `201` / `400` |
| `POST` | `/insumos/:id/ingresos` | Ingresar stock y guardar el movimiento | `201` / `400` / `404` |
| `PUT` | `/insumos/:id` | Actualizar nombre o unidad de medida | `200` / `400` / `404` |
| `DELETE` | `/insumos/:id` | Eliminar un insumo | `204` / `400` / `404` |
| `GET` | `/camas` | Mapa de camas, filtrable por estado y sector | `200` / `400` |
| `GET` | `/camas/:id` | Obtener una cama | `200` / `400` / `404` |
| `POST` | `/camas` | Crear una cama en estado Libre y version 0 | `201` / `400` / `404` |
| `POST` | `/camas/:id/asignaciones` | Asignar un paciente si la cama está Libre | `201` / `400` / `404` / `409` |
| `POST` | `/camas/:id/limpieza` | Pasar la cama a En limpieza y cerrar la asignación | `200` / `400` / `404` / `409` |
| `PUT` | `/camas/:id/estado` | Cambiar el estado por una transición permitida | `200` / `400` / `404` / `409` |

---

## Habitación

| Campo | Tipo | Obligatorio | Notas |
| :--- | :---: | :---: | :--- |
| `id` | número | — | Generado por la base |
| `numero` | string | Sí | Texto, no vacío |
| `piso` | string | Sí | Texto, no vacío |
| `sector` | string | Sí | Texto, no vacío. El mapa de camas filtra por este campo |

---

## Insumo

| Campo | Tipo | Obligatorio | Notas |
| :--- | :---: | :---: | :--- |
| `id` | número | — | Generado por la base |
| `nombre` | string | Sí | Texto, no vacío |
| `stock_actual` | número | Sí en el alta | Entero mayor o igual a 0. Después solo cambia con un ingreso o un descuento |
| `unidad_medida` | string | Sí | Texto, no vacío |

`PUT /insumos/:id` acepta `nombre` y `unidad_medida`. Si el cuerpo trae `stock_actual`, responde `400`.

---

## Cama

| Campo | Tipo | Obligatorio | Notas |
| :--- | :---: | :---: | :--- |
| `id` | número | — | Generado por la base |
| `numero` | string | Sí | Texto, no vacío |
| `habitacion_id` | número | Sí | Tiene que existir la habitación |
| `estado` | string | — | Arranca en `Libre`. No se manda en el alta |
| `version` | número | — | Arranca en `0`. Cada cambio la incrementa en 1 |

Estados exactos: `Libre`, `Ocupada`, `En limpieza`, `Bloqueada`.

Transiciones permitidas:

| Desde | Hacia |
| :--- | :--- |
| `Libre` | `Ocupada` |
| `Libre` | `Bloqueada` |
| `Ocupada` | `En limpieza` |
| `En limpieza` | `Libre` |
| `Bloqueada` | `Libre` |

Cualquier otra transición responde `409`. `Libre` → `Ocupada` se hace solo con `POST /camas/:id/asignaciones`. El `PUT /camas/:id/estado` no acepta `Ocupada`.

Cada cambio guarda una fila en `historial_estados_cama`: `id`, `cama_id`, `estado_anterior`, `estado_nuevo`, `fecha_cambio`, `usuario_id`.

La asignación guarda `asignaciones_cama`: `id`, `cama_id`, `paciente_id`, `fecha_asignacion`, `fecha_liberacion`. Solo se asigna si la cama está `Libre`. Si ya hay una asignación abierta, responde `409`. La operación lee la cama, compara `version`, pasa a `Ocupada`, incrementa `version` y crea la asignación en una transacción. Si la `version` no coincide, responde `409` y no escribe nada. Al pasar a `En limpieza`, la asignación abierta recibe `fecha_liberacion`.

`GET /camas` une cama y habitación. Filtros opcionales: `estado` y `sector`. La respuesta incluye `sector`.

`pasarAEnLimpieza` es el caso de uso que puede llamar el alta de internación. La ruta HTTP equivalente es `POST /camas/:id/limpieza`.

---

## Movimiento de inventario

| Campo | Tipo | Obligatorio | Notas |
| :--- | :---: | :---: | :--- |
| `id` | número | — | Generado por la base |
| `insumo_id` | número | Sí | Insumo existente |
| `tipo` | string | Sí | `Ingreso` o `Descuento` |
| `cantidad` | número | Sí | Entero positivo |
| `referencia_id` | número | Sí | En un descuento es el id de la administración |
| `fecha_hora` | string | — | La pone el servidor, en ISO |

`POST /insumos/:id/ingresos` suma `stock_actual` y guarda un movimiento `Ingreso`.

El descuento no tiene endpoint. Ocurre al recibir el evento `recursos-camas.medicacion.administrada`. Resta `stock_actual` de forma atómica. Si la cantidad deja el stock negativo, responde `409` y no guarda el movimiento. Si alcanza, guarda un movimiento `Descuento` con `referencia_id` igual al id de la administración.

---

## Eventos

El bus compartido todavía no existe. El módulo publica y consume por su propio puerto. Cuando el bus tenga `publicar(nombre, payload)` y `suscribir(nombre, handler)`, se enchufa con `recursosCamasModule.eventos.enchufar(bus)`.

| Nombre | Dirección | Cuándo |
| :--- | :--- | :--- |
| `recursos-camas.cama.estado-cambiado` | Se publica | Después de cada cambio de estado de cama |
| `recursos-camas.medicacion.administrada` | Se consume | Descuenta el stock del insumo |

Cambio de estado:

```json
{
  "cama_id": 1,
  "estado_anterior": "Libre",
  "estado_nuevo": "Ocupada",
  "usuario_id": 3,
  "fecha_cambio": "2026-10-15T21:00:00.000Z",
  "version": 1
}