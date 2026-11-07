import api from '@/shared/services/api'

export const getMapaCamas = (params = {}) => api.get('/camas', { params })
export const getCamaById = (id) => api.get(`/camas/${id}`)
export const createCama = (data) => api.post('/camas', data)
export const asignarCama = (id, data) => api.post(`/camas/${id}/asignaciones`, data)
export const pasarALimpieza = (id, data) => api.post(`/camas/${id}/limpieza`, data)
export const cambiarEstadoCama = (id, data) => api.put(`/camas/${id}/estado`, data)