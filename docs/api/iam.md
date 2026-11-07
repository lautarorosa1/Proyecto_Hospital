# API - Módulo IAM (Identidad y Accesos)

**Módulo:** Identidad y Accesos (IAM)  
**Responsable Asignado:** Nacho  
**URLs Base Disponibles:**
- `http://localhost:3000/auth`
- `http://localhost:3000/api/v1/iam`

---

## 📌 Endpoints

| Método | Ruta | Descripción | Permisos/Roles requeridos | Código de respuesta |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Registrar nuevo usuario con asignación de roles | Público (o Administrador) | `201` / `400` / `409` |
| `POST` | `/auth/login` | Iniciar sesión y obtener token JWT | Público | `200` / `400` / `401` / `403` |
| `GET` | `/auth/me` | Obtener perfil del usuario autenticado | Autenticado (`Bearer <token>`) | `200` / `401` / `404` |

---

## 📋 Especificación de Endpoints

### 1. Registrar Usuario (`POST /auth/register`)

Registra un nuevo usuario en el sistema, hashea su contraseña con `bcryptjs` y le asigna los roles solicitados (creándolos automáticamente en la base de datos si aún no existen). Si no se envía el arreglo `roles`, se asigna `["Paciente"]` por defecto.

#### Request Body (`application/json`):
```json
{
  "nombre": "Ignacio",
  "apellido": "González",
  "email": "nacho@hospital.com",
  "password": "Password123!",
  "roles": ["Administrador", "Médico"]
}
```

#### Response Exitosa (`201 Created`):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "a3f1c9e0-7b2d-4c8a-9f10-123456789abc",
    "nombre": "Ignacio",
    "apellido": "González",
    "email": "nacho@hospital.com",
    "roles": ["Administrador", "Médico"],
    "permisos": []
  }
}
```

#### Ejemplo con `curl`:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Ignacio","apellido":"González","email":"nacho@hospital.com","password":"Password123!","roles":["Administrador"]}'
```

---

### 2. Iniciar Sesión (`POST /auth/login`)

Valida las credenciales del usuario contra `password_hash`, verifica que el usuario se encuentre `activo` y devuelve un token JWT firmado con `{ userId, email, roles, permisos }`.

#### Request Body (`application/json`):
```json
{
  "email": "nacho@hospital.com",
  "password": "Password123!"
}
```

#### Response Exitosa (`200 OK`):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "a3f1c9e0-7b2d-4c8a-9f10-123456789abc",
    "nombre": "Ignacio",
    "apellido": "González",
    "email": "nacho@hospital.com",
    "roles": ["Administrador"],
    "permisos": []
  }
}
```

#### Ejemplo con `curl`:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nacho@hospital.com","password":"Password123!"}'
```

---

### 3. Obtener Perfil Actual (`GET /auth/me`)

Retorna los datos actualizados del usuario autenticado a partir del token JWT enviado en el encabezado `Authorization: Bearer <token>`.

#### Headers Requeridos:
```http
Authorization: Bearer <JWT_TOKEN>
```

#### Response Exitosa (`200 OK`):
```json
{
  "id": "a3f1c9e0-7b2d-4c8a-9f10-123456789abc",
  "nombre": "Ignacio",
  "apellido": "González",
  "email": "nacho@hospital.com",
  "roles": ["Administrador"],
  "permisos": []
}
```

#### Ejemplo con `curl`:
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

## ⚠️ Códigos de Error

| Código | Cuándo ocurre | Ejemplo de respuesta |
| :---: | :--- | :--- |
| `400` | Datos obligatorios faltantes, email inválido o password menor a 6 caracteres | `{ "error": "El email no es válido" }` |
| `401` | Credenciales incorrectas o token JWT ausente, inválido o expirado | `{ "error": "Credenciales inválidas" }` |
| `403` | Usuario inactivo o sin el rol/permiso requerido para el recurso | `{ "error": "Acceso denegado: no posee el rol requerido" }` |
| `409` | Email ya registrado en el sistema | `{ "error": "Ya existe un usuario con ese email" }` |
