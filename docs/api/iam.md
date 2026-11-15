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

El sistema es solo para el personal del hospital, por eso el registro no acepta el rol `Paciente`.
- `roles` es obligatorio y debe tener al menos un rol. Si falta o está vacío → `400` *"Debe seleccionar al menos un rol"*.
- Solo se aceptan los roles de personal: `Administrador`, `Médico`, `Enfermero`, `Recepcionista`, `Administrativo` y `Maestranza` (constante `ROLES_REGISTRO` en `domain/Rol.ts`). Cualquier otro, incluido `Paciente` → `400` *"Rol no permitido para el registro"*.
- La vista `/register` muestra solo esos 6 roles y no trae ninguno marcado de entrada.

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

## 🖥️ 4. Vista de Login y Acceso por Rol en el Frontend

### Vista de Login (`/login`)
- Consume `POST /auth/login` y guarda `token` y `usuario` en `localStorage` (store `useAuthStore`).
- Se muestra a pantalla completa, sin la barra de navegación.
- Si el usuario intentó abrir una ruta sin sesión, después del login vuelve a esa ruta (`/login?redirect=/ruta`). Si no, va al inicio (`/`).
- Si el backend responde `401` en cualquier petición, la sesión se cierra y se redirige a `/login?sesion=expirada`, donde se muestra el aviso correspondiente.

### Qué puede ver y tocar cada rol
Todas las rutas exigen sesión iniciada, salvo `/login` y `/register`. Además, el guard del router consulta `authStore.puedeAcceder(ruta)`, que busca la ruta en la tabla `ROLES_POR_RUTA` de `frontend/src/stores/authStore.js`. El rol `Administrador` accede a todo. Las rutas que no figuran en la tabla (por ejemplo `/`) quedan habilitadas para cualquier usuario logueado.

| Ruta (y sus subrutas) | Roles permitidos (además de `Administrador`) |
| :--- | :--- |
| `/admin/*` | Solo `Administrador` |
| `/admision` | Médico, Enfermero, Recepcionista, Administrativo |
| `/pacientes` | Médico, Enfermero, Recepcionista, Administrativo |
| `/pacientes/create`, `/pacientes/edit/:id` | Recepcionista, Administrativo |
| `/profesionales` | Médico, Enfermero, Recepcionista, Administrativo |
| `/profesionales/create`, `/profesionales/edit/:id` | Administrativo |
| `/turnos` | Médico, Recepcionista, Administrativo |
| `/turnos/generar` | Recepcionista |
| `/guardia` | Médico, Enfermero, Recepcionista |
| `/historia-clinica` | Médico, Enfermero |
| `/atencion-enfermeria` | Médico, Enfermero |
| `/recursos-camas` | Médico, Enfermero, Recepcionista, Administrativo, Maestranza |
| `/camas` | Médico, Enfermero, Recepcionista, Administrativo, Maestranza |
| `/camas/create` | Administrativo |
| `/habitaciones` | Administrativo, Maestranza |
| `/habitaciones/create`, `/habitaciones/edit/:id` | Administrativo |
| `/insumos` | Médico, Enfermero, Administrativo |

Si un usuario entra a una ruta que su rol no tiene permitida, se lo redirige al inicio con el aviso *"No poseés los permisos o roles necesarios..."*.

> Esta tabla controla la **navegación del frontend**. Para proteger los endpoints, cada módulo usa en su router los middlewares `authenticateJWT` y `authorizeRoles(...)` de `modules/iam/adapters/middlewares/authMiddleware`, y para ocultar botones dentro de una vista se usa `v-if="authStore.hasRole('Médico', ...)"`.

---

## ⚠️ Códigos de Respuesta y Errores

| Código | Cuándo ocurre |
| :---: | :--- |
| `200` / `201` | Operación exitosa |
| `400` | Datos inválidos, campos vacíos, registro sin roles o con un rol no permitido (por ejemplo `Paciente`), o intento de eliminar un rol esencial del hospital |
| `401` | Credenciales inválidas o token JWT ausente/expirado |
| `403` | Usuario inactivo o sin el rol `Administrador` |
| `404` | Usuario o rol no encontrado |
| `409` | Email de usuario duplicado, nombre de rol duplicado o rol con usuarios asignados al intentar eliminar |
