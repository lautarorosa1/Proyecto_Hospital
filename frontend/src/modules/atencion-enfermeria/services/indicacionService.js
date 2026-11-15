
import api from '@/shared/services/api'

// Registrar una nueva indicación
export const registrarIndicacion = async (indicacion) => {
  const respuesta = await api.post(
    '/atencion-enfermeria/indicaciones',
    indicacion
  )

  return respuesta.data
}

// Obtener todas las indicaciones
export const listarIndicaciones = async () => {
  const respuesta = await api.get(
    '/atencion-enfermeria/indicaciones'
  )

  return respuesta.data
}

// Obtener indicaciones de una internación
export const listarIndicacionesPorInternacion = async (internacionId) => {
  const respuesta = await api.get(
    `/atencion-enfermeria/indicaciones/internacion/${internacionId}`
  )

  return respuesta.data
}

// Actualizar una indicación
export const actualizarIndicacion = async (id, datos) => {
  const respuesta = await api.put(
    `/atencion-enfermeria/indicaciones/${id}`,
    datos
  )

  return respuesta.data
}