
import api from '@/shared/services/api'

// Obtener todas las internaciones
export const listarInternaciones = async () => {
  const respuesta = await api.get('/atencion-enfermeria/internaciones')

  return respuesta.data.data
}

// Registrar una nueva internación
export const registrarInternacion = async (internacion) => {
  const respuesta = await api.post(
    '/atencion-enfermeria/internaciones',
    internacion
  )

  return respuesta.data.data
}