# API - Módulo Facturación y Administración

**Módulo:** Facturación y Administración  
**Responsable Asignado:** Desarrollador Asignado  
**URL Base:** `http://localhost:3000/api/v1/facturacion`  

---

## 📌 Endpoints

| Método | Ruta | Descripción | Permisos/Roles requeridos | Código de respuesta |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/cargos` | Registrar cargo médico o de medicación | Administrativo / Admin | `201` / `400` |
| `POST` | `/facturas/generar` | Generar liquidación/factura para un paciente | Administrativo / Admin | `201` / `400` |
| `GET` | `/facturas/:id` | Consultar detalle de una factura emitida | Administrativo / Paciente | `200` / `404` |
| | | | | |

---

## 📋 Ejemplo de Payload y Respuesta

### Generar Factura (`POST /facturas/generar`)

#### Request Body (`application/json`):
```json
{
  "pacienteId": 1,
  "cobertura": "OSDE 310",
  "cargosIds": [101, 102, 103]
}
```

#### Response Exitosa (`201 Created`):
```json
{
  "facturaId": "FAC-2026-0045",
  "pacienteId": 1,
  "total": 45000.0,
  "coberturaAplicada": 36000.0,
  "totalCopago": 9000.0,
  "estado": "EMITIDA"
}
```

---

## ⚠️ Códigos de Error Frecuentes

| Código | Cuándo ocurre |
| :---: | :--- |
| `400` | Cobertura médica no válida o sin cargos pendientes |
| `404` | Cargos o paciente no encontrados |
