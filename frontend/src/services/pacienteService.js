import api from './api'

export const getPacientes = () => api.get('/pacientes')

export const getPacienteById = (id) => api.get(`/pacientes/${id}`)

export const createPaciente = (paciente) => api.post('/pacientes', paciente)

export const updatePaciente = (id, paciente) => api.put(`/pacientes/${id}`, paciente)

export const deletePaciente = (id) => api.delete(`/pacientes/${id}`)