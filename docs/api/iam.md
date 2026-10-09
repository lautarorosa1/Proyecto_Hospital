# API - Módulo IAM (Identidad y Accesos)

**Módulo:** Identidad y Accesos (IAM)  
**Responsable Asignado:** Nacho
**URL Base:** `http://localhost:3000/api/v1/iam`  

---

## 📌 Endpoints

| Método | Ruta | Descripción | Permisos/Roles requeridos | Código de respuesta |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Iniciar sesión y obtener JWT token | Público | `200` / `401` |
| `POST` | `/auth/register` | Registrar nuevo usuario en el sistema | Administrador | `201` / `400` / `409` |
| `GET` | `/usuarios/me` | Obtener perfil del usuario autenticado | Autenticado (`JWT`) | `200` / `401` |
| | | | | |

---

## 📋 Ejemplo de Payload y Respuesta

### Iniciar Sesión (`POST /auth/login`)

#### Request Body (`application/json`):
```json
{
  "email": "usuario@hospital.com",
  "password": "PasswordSeguro123!"
}
```

#### Response Exitosa (`200 OK`):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "uuid-v4",
    "nombre": "Nombre",
    "apellido": "Apellido",
    "email": "usuario@hospital.com",
    "roles": ["Médico"]
  }
}
```

---

## ⚠️ Códigos de Error Frecuentes

| Código | Cuándo ocurre |
| :---: | :--- |
| `400` | Datos faltantes o JSON mal formado |
| `401` | Credenciales incorrectas o token inválido/expirado |
| `403` | Permisos insuficientes para acceder al recurso |
