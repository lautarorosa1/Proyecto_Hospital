# API - Módulo Gestión de Recursos y Camas

**Módulo:** Recursos y Camas  
**Responsable Asignado:** Agus
**URL Base:** `http://localhost:3000/api/v1/camas`  

---

## 📌 Endpoints

| Método | Ruta | Descripción | Permisos/Roles requeridos | Código de respuesta |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/camas` | Listar camas con estado (libre, ocupada, etc.) | Recepcionista / Enfermero / Admin | `200` |
| `PUT` | `/camas/:id/ocupar` | Asignar cama a una internación | Recepcionista / Enfermero | `200` / `400` / `409` |
| `PUT` | `/camas/:id/liberar` | Liberar cama tras alta médica | Enfermero / Maestranza / Admin | `200` / `404` |
| `GET` | `/insumos/stock` | Consultar inventario de medicamentos e insumos | Farmacia / Enfermero / Admin | `200` |
| | | | | |

---

## 📋 Ejemplo de Payload y Respuesta

### Asignar Cama (`PUT /camas/:id/ocupar`)

#### Request Body (`application/json`):
```json
{
  "pacienteId": 1,
  "internacionId": "uuid-internacion"
}
```

#### Response Exitosa (`200 OK`):
```json
{
  "camaId": "cama-102-A",
  "habitacion": "102",
  "estado": "OCUPADA",
  "pacienteId": 1
}
```

---

## ⚠️ Códigos de Error Frecuentes

| Código | Cuándo ocurre |
| :---: | :--- |
| `404` | Cama o insumo no encontrado |
| `409` | La cama ya se encuentra ocupada o en mantenimiento |
