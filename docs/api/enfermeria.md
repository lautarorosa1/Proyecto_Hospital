# API - Módulo Atención y Enfermería

**Módulo:** Atención y Enfermería  
**Responsable Asignado:** Roman  
**URL Base:** `http://localhost:3000/api/v1/enfermeria`  

---

## 📌 Endpoints

| Método | Ruta | Descripción | Permisos/Roles requeridos | Código de respuesta |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/internaciones` | Registrar ingreso/internación de paciente | Enfermero / Médico | `201` / `400` |
| `POST` | `/signos-vitales` | Registrar toma de signos vitales | Enfermero / Médico | `201` / `400` |
| `POST` | `/medicacion/administrar` | Registrar administración de fármaco | Enfermero | `200` / `400` |
| | | | | |

---

## 📋 Ejemplo de Payload y Respuesta

### Registrar Signos Vitales (`POST /signos-vitales`)

#### Request Body (`application/json`):
```json
{
  "pacienteId": 1,
  "internacionId": "uuid-internacion",
  "temperatura": 36.8,
  "presionArterial": "120/80",
  "frecuenciaCardiaca": 75,
  "saturacionOxigeno": 98
}
```

#### Response Exitosa (`201 Created`):
```json
{
  "id": "uuid-registro",
  "pacienteId": 1,
  "fechaHora": "2026-10-20T08:00:00.000Z",
  "alerta": false
}
```

---

## ⚠️ Códigos de Error Frecuentes

| Código | Cuándo ocurre |
| :---: | :--- |
| `400` | Signos vitales con valores fuera de rango o datos faltantes |
| `404` | Internación o paciente no encontrado |
