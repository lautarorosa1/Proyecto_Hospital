import api from '@/shared/services/api'

// params opcionales: { estado, tipoProfesional, especialidadId }
export const getProfesionales = (params) => api.get('/profesionales', { params })

export const getProfesionalById = (id) => api.get(`/profesionales/${id}`)

export const createProfesional = (profesional) => api.post('/profesionales', profesional)

export const updateProfesional = (id, profesional) => api.put(`/profesionales/${id}`, profesional)

// El backend hace baja lógica: el profesional pasa a estado "inactivo"
export const darDeBajaProfesional = (id) => api.delete(`/profesionales/${id}`)
