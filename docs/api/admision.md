# API - Módulo Admisión y Turnos

**Módulo:** Admisión, Agenda y Turnos  
**Responsable Asignado:** Lautaro  
**URL Base:** `http://localhost:3000/api/v1/admision`  

---

## 📌 Endpoints

| Método | Ruta | Descripción | Permisos/Roles requeridos | Código de respuesta |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/turnos` | Listar turnos filtrados por fecha o profesional | Recepcionista / Médico | `200` |
| `POST` | `/turnos` | Reservar un nuevo turno | Recepcionista / Paciente | `201` / `400` / `409` |
| `PUT` | `/turnos/:id/cancelar` | Cancelar un turno agendado | Recepcionista / Paciente / Admin | `200` / `404` |
| | | | | |

---

## 📋 Ejemplo de Payload y Respuesta

### Reservar Turno (`POST /turnos`)

#### Request Body (`application/json`):
```json
{
  "pacienteId": 1,
  "profesionalId": "uuid-medico",
  "fechaHora": "2026-10-20T10:00:00.000Z",
  "especialidad": "Clínica Médica",
  "motivo": "Consulta de rutina"
}
```

#### Response Exitosa (`201 Created`):
```json
{
  "id": "uuid-turno",
  "pacienteId": 1,
  "profesionalId": "uuid-medico",
  "fechaHora": "2026-10-20T10:00:00.000Z",
  "estado": "RESERVADO"
}
```

---

## ⚠️ Códigos de Error Frecuentes

| Código | Cuándo ocurre |
| :---: | :--- |
| `400` | Datos faltantes o formato de fecha inválido |
| `404` | Paciente o profesional no encontrado |
| `409` | El turno ya se encuentra ocupado en ese horario |
