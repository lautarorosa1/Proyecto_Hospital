import api from '@/shared/services/api'

// params opcionales: { estado, tipoProfesional, especialidadId }
export const getProfesionales = (params) => api.get('/profesionales', { params })

export const getProfesionalById = (id) => api.get(`/profesionales/${id}`)

export const createProfesional = (profesional) => api.post('/profesionales', profesional)

export const updateProfesional = (id, profesional) => api.put(`/profesionales/${id}`, profesional)

// El backend hace baja lógica: el profesional pasa a estado "inactivo"
export const darDeBajaProfesional = (id) => api.delete(`/profesionales/${id}`)

// Agenda semanal de atención del profesional
export const getHorarios = (profesionalId) => api.get(`/profesionales/${profesionalId}/horarios`)

// Reemplaza toda la agenda. horarios: [{ diaSemana (1=lunes..7=domingo), horaDesde, horaHasta }]
export const guardarHorarios = (profesionalId, horarios) =>
  api.put(`/profesionales/${profesionalId}/horarios`, { horarios })
