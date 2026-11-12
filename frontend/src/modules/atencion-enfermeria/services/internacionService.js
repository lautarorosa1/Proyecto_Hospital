
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
// Obtener una internación (incluye tipo de ingreso y cama asignada)
export const obtenerInternacion = async (id) => {
  const respuesta = await api.get(`/atencion-enfermeria/internaciones/${id}`)

  return respuesta.data.data
}

// Alta médica: finaliza la internación y el backend pasa la cama a "En limpieza"
export const darDeAlta = async (id, usuarioId) => {
  const respuesta = await api.post(
    `/atencion-enfermeria/internaciones/${id}/alta`,
    { usuarioId }
  )

  return respuesta.data.data
}
