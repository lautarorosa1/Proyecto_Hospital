import api from '@/shared/services/api'


import {
  getPacientes,
  getPacienteById
} from '@/modules/admision/pacientes/services/pacienteService'

export const obtenerPacientes = () => getPacientes()

export const obtenerPacientePorId = (id) =>
  getPacienteById(id)

// Línea de tiempo clínica: ingresos, signos vitales, medicación administrada y altas,
// alimentada por los eventos de Admisión y Enfermería.
export const obtenerEventosClinicos = async (pacienteId) => {
  const respuesta = await api.get(`/historia-clinica/pacientes/${pacienteId}/eventos`)

  return respuesta.data
}
