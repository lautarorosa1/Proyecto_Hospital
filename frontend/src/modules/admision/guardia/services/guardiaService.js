import api from '@/shared/services/api'

// Ingreso a guardia (HU 3.1): { pacienteId, enfermeroId, nivelTriaje, motivoConsulta, observaciones? }
// nivelTriaje: rojo (Riesgo Vital) | naranja | amarillo | verde | azul
// Responde { ingreso, desplazados, medicosAlertados }. Con rojo, el backend alerta a los médicos.
export const registrarIngreso = (datos) => api.post('/guardia/ingresos', datos)

export const getIngresoGuardia = (id) => api.get(`/guardia/ingresos/${id}`)

// Cola de espera ya ordenada (prioridad y llegada). Cada item trae su `posicion`.
export const getColaGuardia = () => api.get('/guardia/cola')

// URL del canal SSE de alertas para los monitores. Con profesionalId solo llegan
// las alertas dirigidas a ese médico; sin él, es el monitor general de la guardia.
export const urlAlertasStream = (profesionalId) => {
  const base = `${api.defaults.baseURL}/guardia/alertas/stream`
  return profesionalId ? `${base}?profesionalId=${profesionalId}` : base
}
