# API - Módulo Pacientes

**Módulo:** Pacientes  
**Responsable Asignado:** Lautaro
**URL Base:** `http://localhost:3000`  

---

## 📌 Endpoints

| Método | Ruta | Descripción | Permisos/Roles requeridos | Código de respuesta |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | Estado del servidor | Público | `200` |
| `GET` | `/pacientes` | Listar pacientes | Público / Autenticado | `200` |
| `GET` | `/pacientes/:id` | Obtener un paciente | Público / Autenticado | `200` / `404` |
| `POST` | `/pacientes` | Crear un paciente | Recepcionista / Admin | `201` / `400` / `409` |
| `PUT` | `/pacientes/:id` | Actualizar un paciente | Recepcionista / Admin | `200` / `400` / `404` / `409` |
| `DELETE` | `/pacientes/:id` | Eliminar un paciente | Administrador | `204` / `404` |

---

## 📋 Modelo de Paciente

| Campo | Tipo | Obligatorio | Notas |
| :--- | :---: | :---: | :--- |
| `id` | `número` | — | Generado automáticamente |
| `nombre` | `string` | Sí | Nombre de pila |
| `apellido` | `string` | Sí | Apellido |
| `dni` | `string` | Sí | De 7 a 9 dígitos, único |
| `email` | `string` | Sí | Formato válido, único (se guarda en minúsculas) |
| `fechaNacimiento` | `string` | Sí | Formato `YYYY-MM-DD`, fecha real y no futura |
| `telefono` | `string` | No | Teléfono de contacto |
| `direccion` | `string` | No | Domicilio del paciente |

---

## 💻 Ejemplo de Petición

### Crear Paciente (`POST /pacientes`)

```bash
curl -X POST http://localhost:3000/pacientes \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "dni": "30123456",
    "email": "juan.perez@mail.com",
    "fechaNacimiento": "1990-05-20",
    "telefono": "1155551234",
    "direccion": "Av. Siempre Viva 742"
  }'
```

#### Respuesta Exitosa (`201 Created`):
```json
{
  "id": 1,
  "nombre": "Juan",
  "apellido": "Pérez",
  "dni": "30123456",
  "email": "juan.perez@mail.com",
  "fechaNacimiento": "1990-05-20",
  "telefono": "1155551234",
  "direccion": "Av. Siempre Viva 742"
}
```

---

## ⚠️ Códigos de Error

Los errores devuelven un JSON con el formato `{ "error": "mensaje" }`.

| Código | Cuándo ocurre |
| :---: | :--- |
| `400` | Datos faltantes o inválidos, id no válido o JSON mal formado |
| `404` | El paciente o la ruta no existe |
| `409` | Ya existe un paciente con ese DNI o email |
| `500` | Error interno del servidor |
