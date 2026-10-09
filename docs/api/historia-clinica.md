# API - Módulo Historia Clínica Electrónica

**Módulo:** Historia Clínica Electrónica (HCE)  
**Responsable Asignado:** Desarrollador Asignado  
**URL Base:** `http://localhost:3000/api/v1/historia-clinica`  

---

## 📌 Endpoints

| Método | Ruta | Descripción | Permisos/Roles requeridos | Código de respuesta |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/pacientes/:pacienteId/hce` | Obtener historial clínico completo | Médico / Enfermero | `200` / `404` |
| `POST` | `/evoluciones` | Registrar una nueva evolución médica | Médico | `201` / `400` |
| `POST` | `/alergias` | Registrar alergia o antecedente | Médico / Enfermero | `201` / `400` |
| | | | | |

---

## 📋 Ejemplo de Payload y Respuesta

### Registrar Evolución (`POST /evoluciones`)

#### Request Body (`application/json`):
```json
{
  "pacienteId": 1,
  "medicoId": "uuid-medico",
  "motivoConsulta": "Dolor torácico leve",
  "diagnostico": "Observación preventiva",
  "indicaciones": "Reposo e hidratación"
}
```

#### Response Exitosa (`201 Created`):
```json
{
  "id": "uuid-evolucion",
  "pacienteId": 1,
  "fecha": "2026-10-20T11:15:00.000Z",
  "diagnostico": "Observación preventiva"
}
```

---

## ⚠️ Códigos de Error Frecuentes

| Código | Cuándo ocurre |
| :---: | :--- |
| `400` | Campos obligatorios vacíos |
| `403` | Usuario no habilitado como personal de salud |
| `404` | Historia clínica o paciente no encontrado |
