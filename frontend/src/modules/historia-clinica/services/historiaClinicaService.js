
import {
  getPacientes,
  getPacienteById
} from '@/modules/admision/pacientes/services/pacienteService'

export const obtenerPacientes = () => getPacientes()

export const obtenerPacientePorId = (id) =>
  getPacienteById(id)