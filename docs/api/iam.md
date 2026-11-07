# API - Módulo IAM (Identidad y Accesos)

**Módulo:** Identidad y Accesos (IAM)  
**Responsable Asignado:** Nacho  
**URLs Base Disponibles:**
- `http://localhost:3000`
- `http://localhost:3000/api/v1/iam`

---

## 📌 Tabla General de Endpoints

| Método | Ruta | Descripción | Permisos/Roles requeridos | Código de respuesta |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Registrar nuevo usuario con asignación de roles | Público | `201` / `400` / `409` |
| `POST` | `/auth/login` | Iniciar sesión y obtener token JWT | Público | `200` / `400` / `401` / `403` |
| `GET` | `/auth/me` | Obtener perfil del usuario autenticado | Autenticado (`JWT`) | `200` / `401` / `404` |
| `GET` | `/roles` | Listar todos los roles del sistema y cantidad de usuarios | `Administrador` | `200` / `401` / `403` |
| `POST` | `/roles` | Crear un nuevo rol en el sistema | `Administrador` | `201` / `400` / `403` / `409` |
| `PUT` | `/roles/:id` | Actualizar nombre o descripción de un rol | `Administrador` | `200` / `400` / `403` / `404` / `409` |
| `DELETE` | `/roles/:id` | Eliminar un rol no esencial sin usuarios asignados | `Administrador` | `200` / `400` / `403` / `404` / `409` |
| `GET` | `/usuarios` | Listar todos los usuarios con sus roles y estado | `Administrador` | `200` / `401` / `403` |
| `GET` | `/usuarios/:id` | Obtener el detalle de un usuario por UUID | `Administrador` | `200` / `401` / `403` / `404` |
| `PUT` | `/usuarios/:id` | Actualizar datos básicos del usuario (`nombre`, `apellido`, `email`) | `Administrador` | `200` / `400` / `403` / `404` / `409` |
| `PATCH` | `/usuarios/:id/estado` | Activar o desactivar usuario (baja lógica) | `Administrador` | `200` / `401` / `403` / `404` |
| `POST` | `/usuarios/:id/roles` | Asignar uno o más roles a un usuario | `Administrador` | `200` / `400` / `403` / `404` |
| `DELETE` | `/usuarios/:id/roles/:rolId` | Quitar un rol específico a un usuario | `Administrador` | `200` / `400` / `403` / `404` |

---

## 🔐 1. Autenticación y Perfil (`/auth`)

### Registrar Usuario (`POST /auth/register`)
```json
{
  "nombre": "Ignacio",
  "apellido": "González",
  "email": "nacho@hospital.com",
  "password": "Password123!",
  "roles": ["Administrador", "Médico"]
}
```

### Iniciar Sesión (`POST /auth/login`)
```json
{
  "email": "nacho@hospital.com",
  "password": "Password123!"
}
```

### Perfil Actual (`GET /auth/me`)
Requiere header `Authorization: Bearer <JWT_TOKEN>`.

---

## 🛡️ 2. Gestión de Roles (`/roles`) — Requiere Rol `Administrador`

### Listar Roles (`GET /roles`)
Asegura la existencia de los 7 roles base del hospital y devuelve cada rol con la cantidad de usuarios que lo tienen asignado.

#### Response (`200 OK`):
```json
[
  {
    "id": 1,
    "nombre": "Administrador",
    "descripcion": "",
    "permisos": [],
    "cantidadUsuarios": 1,
    "esEsencial": true
  },
  {
    "id": 2,
    "nombre": "Médico",
    "descripcion": "",
    "permisos": [],
    "cantidadUsuarios": 3,
    "esEsencial": true
  }
]
```

### Crear Rol (`POST /roles`)
#### Request Body:
```json
{
  "nombre": "Auditor Médico",
  "descripcion": "Auditoría de historias clínicas y facturación"
}
```

### Actualizar Rol (`PUT /roles/:id`)
#### Request Body:
```json
{
  "nombre": "Auditor Clínico",
  "descripcion": "Descripción actualizada"
}
```

### Eliminar Rol (`DELETE /roles/:id`)
Elimina un rol personalizado siempre que no sea uno de los 7 roles esenciales del hospital ni tenga usuarios asociados.

---

## 👥 3. Gestión de Usuarios y Asignación de Roles (`/usuarios`) — Requiere Rol `Administrador`

### Listar Usuarios (`GET /usuarios`)
Devuelve todos los usuarios ordenados por fecha de creación descendente, incluyendo `activo`, `roles` y `rolesDetalle`.

### Actualizar Usuario (`PUT /usuarios/:id`)
```json
{
  "nombre": "Ignacio",
  "apellido": "González",
  "email": "nacho.gonzalez@hospital.com"
}
```

### Alternar Estado Activo/Inactivo (`PATCH /usuarios/:id/estado`)
```json
{
  "activo": false
}
```

### Asignar Rol(es) a Usuario (`POST /usuarios/:id/roles`)
Permite asignar por `rolId` numérico o por arreglo de nombres `roles`:
```json
{
  "rolId": 2
}
```
o bien:
```json
{
  "roles": ["Médico", "Enfermero"]
}
```

### Quitar Rol a Usuario (`DELETE /usuarios/:id/roles/:rolId`)
Desvincula el `rolId` indicado de la tabla intermedia `usuario_roles` y devuelve el usuario actualizado.

---

## ⚠️ Códigos de Respuesta y Errores

| Código | Cuándo ocurre |
| :---: | :--- |
| `200` / `201` | Operación exitosa |
| `400` | Datos inválidos, campos vacíos o intento de eliminar un rol esencial del hospital |
| `401` | Credenciales inválidas o token JWT ausente/expirado |
| `403` | Usuario inactivo o sin el rol `Administrador` |
| `404` | Usuario o rol no encontrado |
| `409` | Email de usuario duplicado, nombre de rol duplicado o rol con usuarios asignados al intentar eliminar |
