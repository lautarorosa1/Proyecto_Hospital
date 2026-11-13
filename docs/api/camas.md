# API - Módulo Gestión de Recursos y Camas

**Módulo:** Recursos y Camas  
**Responsable Asignado:** Agus  
**URL Base:** `http://localhost:3000`  

`usuario_id`, `paciente_id` y `referencia_id` llegan como números. Los errores responden `{ "error": "mensaje" }`.

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
| `GET` | `/camas/eventos/stream` | Stream SSE de cambios de cama en tiempo real | `200` |
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

### Crear habitación (`POST /habitaciones`)

```bash
curl -X POST http://localhost:3000/habitaciones \
  -H "Content-Type: application/json" \
  -d '{"numero":"101","piso":"1","sector":"Clinica"}'
```

Respuesta `201`:

```json
{
  "id": 1,
  "numero": "101",
  "piso": "1",
  "sector": "Clinica"
}
```

---

## Insumo

| Campo | Tipo | Obligatorio | Notas |
| :--- | :---: | :---: | :--- |
| `id` | número | — | Generado por la base |
| `nombre` | string | Sí | Texto, no vacío |
| `stock_actual` | número | Sí en el alta | Entero mayor o igual a 0. Después solo cambia con un ingreso o un descuento |
| `unidad_medida` | string | Sí | Texto, no vacío |

`PUT /insumos/:id` acepta `nombre` y `unidad_medida`. Si el cuerpo trae `stock_actual`, responde `400`.

### Crear insumo (`POST /insumos`)

```bash
curl -X POST http://localhost:3000/insumos \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Gasa esteril","stock_actual":20,"unidad_medida":"unidad"}'
```

### Ingresar stock (`POST /insumos/:id/ingresos`)

```bash
curl -X POST http://localhost:3000/insumos/1/ingresos \
  -H "Content-Type: application/json" \
  -d '{"cantidad":10,"referencia_id":50}'
```

Respuesta `201`:

```json
{
  "insumo": {
    "id": 1,
    "nombre": "Gasa esteril",
    "stock_actual": 30,
    "unidad_medida": "unidad"
  },
  "movimiento": {
    "id": 1,
    "insumo_id": 1,
    "tipo": "Ingreso",
    "cantidad": 10,
    "referencia_id": 50,
    "fecha_hora": "2026-11-12T21:00:00.000Z"
  }
}
```

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

La asignación guarda `asignaciones_cama`: `id`, `cama_id`, `paciente_id`, `fecha_asignacion`, `fecha_liberacion`. Solo se asigna si la cama está `Libre`. Si ya hay una asignación abierta, responde `409`.

La operación de asignar lee la cama, compara `version`, pasa a `Ocupada`, incrementa `version` y crea la asignación en una transacción. Si la `version` no coincide, responde `409` y no escribe nada.

Si el módulo tiene conectado el verificador de ingreso, también exige que el paciente tenga una **internación activa**. Si no la tiene, responde `409`.

Al pasar a `En limpieza`, la asignación abierta recibe `fecha_liberacion`.

`GET /camas` une cama y habitación. Filtros opcionales: `estado` y `sector`. La respuesta incluye `sector`.

`pasarAEnLimpieza` es el caso de uso HTTP (`POST /camas/:id/limpieza`). Ante el evento `PACIENTE_DADO_DE_ALTA`, el módulo llama `liberarPorAlta` y deja la cama en `En limpieza`.

### Crear cama (`POST /camas`)

```bash
curl -X POST http://localhost:3000/camas \
  -H "Content-Type: application/json" \
  -d '{"numero":"A","habitacion_id":1}'
```

Respuesta `201`:

```json
{
  "id": 1,
  "numero": "A",
  "habitacion_id": 1,
  "estado": "Libre",
  "version": 0
}
```

### Mapa (`GET /camas?estado=Libre&sector=Clinica`)

Respuesta `200`:

```json
[
  {
    "id": 1,
    "numero": "A",
    "habitacion_id": 1,
    "estado": "Libre",
    "version": 0,
    "sector": "Clinica"
  }
]
```

### Asignar (`POST /camas/:id/asignaciones`)

```bash
curl -X POST http://localhost:3000/camas/1/asignaciones \
  -H "Content-Type: application/json" \
  -d '{"paciente_id":10,"usuario_id":3,"version":0}'
```

Respuesta `201`: la cama queda `Ocupada` con `version` 1, más el historial y la asignación con `fecha_liberacion` en `null`.

### Pasar a limpieza (`POST /camas/:id/limpieza`)

```bash
curl -X POST http://localhost:3000/camas/1/limpieza \
  -H "Content-Type: application/json" \
  -d '{"usuario_id":3,"version":1}'
```

Respuesta `200`: la cama queda `En limpieza` y la asignación abierta tiene `fecha_liberacion`.

### Stream en tiempo real (`GET /camas/eventos/stream`)

Server-Sent Events. Emite:

- `cama_estado` cuando cambia el estado de una cama
- `cama_asignada` cuando se asigna un paciente

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

El descuento no tiene endpoint. Se dispara al recibir el evento de dominio `MEDICACION_ADMINISTRADA`. Resta `stock_actual` de forma atómica. Si la cantidad deja el stock negativo, responde `409` y no guarda el movimiento. Si alcanza, guarda un movimiento `Descuento` con `referencia_id` igual al id de la administración.

---

## Eventos

El módulo usa el bus compartido de dominio (`eventBus` / `DomainEvents`).

Publica:

| Evento | Cuándo |
| :--- | :--- |
| `CAMA_ESTADO_CAMBIADO` | Después de cada cambio de estado de cama |
| `CAMA_ASIGNADA` | Después de asignar un paciente a una cama |

Consume:

| Evento | Qué hace |
| :--- | :--- |
| `MEDICACION_ADMINISTRADA` | Descuenta stock del insumo |
| `PACIENTE_DADO_DE_ALTA` | Pasa la cama asociada a `En limpieza` |

### Payload publicado: cambio de estado

```json
{
  "camaId": 1,
  "estadoAnterior": "Libre",
  "estadoNuevo": "Ocupada",
  "usuarioId": 3,
  "version": 1,
  "timestamp": "2026-11-12T21:00:00.000Z"
}
```

### Payload publicado: asignación

```json
{
  "camaId": 1,
  "pacienteId": 10,
  "usuarioId": 3,
  "timestamp": "2026-11-12T21:00:00.000Z"
}
```

### Payload consumido: medicación administrada

Campos usados por Recursos y Camas:

```json
{
  "administracionId": 77,
  "insumoId": 1,
  "cantidad": 2
}
```

### Payload consumido: paciente dado de alta

```json
{
  "pacienteId": 10,
  "internacionId": 5,
  "camaId": 1,
  "usuarioId": 3,
  "timestamp": "2026-11-12T21:00:00.000Z"
}
```

Si `camaId` no viene, el módulo no libera ninguna cama.

---

## Códigos de error

| Código | Cuándo ocurre |
| :---: | :--- |
| `400` | Dato faltante o inválido, id que no es un entero positivo, estado desconocido o `stock_actual` mandado en el `PUT` de insumo |
| `404` | Habitación, insumo o cama inexistente |
| `409` | Transición no permitida, `version` distinta, asignación abierta, paciente sin internación activa, o descuento que dejaría el stock negativo |
| `500` | Error interno del servidor |
