import api from '@/shared/services/api'
import {
  getPacientes,
  getPacienteById
} from '@/modules/admision/pacientes/services/pacienteService'

export const obtenerPacientes = () => getPacientes()
export const obtenerPacientePorId = (id) => getPacienteById(id)

export const obtenerAlergiasPorPaciente = (pacienteId) =>
  api.get(`/alergias/paciente/${pacienteId}`)

export const crearAlergia = (datos) => api.post('/alergias', datos)

export const actualizarAlergia = (id, datos) =>
  api.put(`/alergias/${id}`, datos)

export const eliminarAlergiaPorId = (id) => api.delete(`/alergias/${id}`)
export const obtenerAntecedentesPorPaciente = (pacienteId) =>
  api.get(`/antecedentes-familiares/paciente/${pacienteId}`)

export const crearAntecedente = (datos) =>
  api.post('/antecedentes-familiares', datos)

export const actualizarAntecedente = (id, datos) =>
  api.put(`/antecedentes-familiares/${id}`, datos)

export const eliminarAntecedentePorId = (id) =>
  api.delete(`/antecedentes-familiares/${id}`)
export const obtenerEvolucionesPorPaciente = (pacienteId) =>
  api.get(`/evoluciones-medicas/paciente/${pacienteId}`)

export const crearEvolucion = (datos) =>
  api.post('/evoluciones-medicas', datos)

export const actualizarEvolucion = (id, datos) =>
  api.put(`/evoluciones-medicas/${id}`, datos)

export const eliminarEvolucionPorId = (id) =>
  api.delete(`/evoluciones-medicas/${id}`)
export const obtenerEstudiosPorPaciente = (pacienteId) =>
  api.get(`/estudios-medicos/paciente/${pacienteId}`)

export const crearEstudio = (datos) => api.post('/estudios-medicos', datos)

export const actualizarEstudio = (id, datos) =>
  api.put(`/estudios-medicos/${id}`, datos)

export const eliminarEstudioPorId = (id) =>
  api.delete(`/estudios-medicos/${id}`)