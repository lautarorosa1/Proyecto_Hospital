
import api from '@/shared/services/api'

import {
  getPacientes,
  getPacienteById
} from '@/modules/admision/pacientes/services/pacienteService'

// Pacientes
export const obtenerPacientes = () => getPacientes()
export const obtenerPacientePorId = (id) => getPacienteById(id)

// Antecedentes familiares
export const obtenerAntecedentesPorPaciente = (pacienteId) =>
  api.get(`/antecedentes-familiares/paciente/${pacienteId}`)

export const crearAntecedente = (datos) =>
  api.post('/antecedentes-familiares', datos)

export const actualizarAntecedente = (id, datos) =>
  api.put(`/antecedentes-familiares/${id}`, datos)

export const eliminarAntecedentePorId = (id) =>
  api.delete(`/antecedentes-familiares/${id}`)

// Evoluciones médicas
export const obtenerEvolucionesPorPaciente = (pacienteId) =>
  api.get(`/evoluciones-medicas/paciente/${pacienteId}`)

export const crearEvolucion = (datos) =>
  api.post('/evoluciones-medicas', datos)

export const actualizarEvolucion = (id, datos) =>
  api.put(`/evoluciones-medicas/${id}`, datos)

export const eliminarEvolucionPorId = (id) =>
  api.delete(`/evoluciones-medicas/${id}`)

// Estudios médicos
export const obtenerEstudiosPorPaciente = (pacienteId) =>
  api.get(`/estudios-medicos/paciente/${pacienteId}`)

export const crearEstudio = (datos) =>
  api.post('/estudios-medicos', datos)

export const actualizarEstudio = (id, datos) =>
  api.put(`/estudios-medicos/${id}`, datos)

export const eliminarEstudioPorId = (id) =>
  api.delete(`/estudios-medicos/${id}`)

// Línea de tiempo clínica
export const obtenerEventosClinicos = async (pacienteId) => {
  const respuesta = await api.get(
    `/historia-clinica/pacientes/${pacienteId}/eventos`
  )

  return respuesta.data
}

