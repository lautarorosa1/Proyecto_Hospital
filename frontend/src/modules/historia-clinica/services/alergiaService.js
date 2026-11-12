import api from '@/shared/services/api'

// Alergias registradas del paciente. Las consulta Enfermería antes de aceptar una
// medicación: si el paciente es alérgico al fármaco, el backend la rechaza (409).
export const listarAlergiasPorPaciente = async (pacienteId) => {
  const respuesta = await api.get(`/alergias/paciente/${pacienteId}`)

  return respuesta.data
}

// { pacienteId, alergeno, reaccion, severidad: 'leve' | 'moderada' | 'alta' }
export const registrarAlergia = async (datos) => {
  const respuesta = await api.post('/alergias', datos)

  return respuesta.data
}

export const actualizarAlergia = async (id, datos) => {
  const respuesta = await api.put(`/alergias/${id}`, datos)

  return respuesta.data
}
