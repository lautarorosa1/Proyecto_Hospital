import api from '@/shared/services/api'

export const getHabitaciones = () => api.get('/habitaciones')
export const getHabitacionById = (id) => api.get(`/habitaciones/${id}`)
export const createHabitacion = (data) => api.post('/habitaciones', data)
export const updateHabitacion = (id, data) => api.put(`/habitaciones/${id}`, data)
export const deleteHabitacion = (id) => api.delete(`/habitaciones/${id}`)