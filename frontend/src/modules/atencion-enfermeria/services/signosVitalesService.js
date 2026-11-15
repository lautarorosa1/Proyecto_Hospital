
import api from '@/shared/services/api'

// Registrar signos vitales
export const registrarSignosVitales = async (datos) => {
  const respuesta = await api.post(
    '/atencion-enfermeria/signos-vitales',
    datos
  )

  return respuesta.data
}

// Buscar signos vitales de una internación
export const listarSignosVitalesPorInternacion = async (internacionId) => {
  const respuesta = await api.get(
    `/atencion-enfermeria/signos-vitales/internacion/${internacionId}`
  )

  return respuesta.data
}

// Buscar un registro por ID
export const obtenerSignosVitalesPorId = async (id) => {
  const respuesta = await api.get(
    `/atencion-enfermeria/signos-vitales/${id}`
  )

  return respuesta.data
}

// Actualizar signos vitales
export const actualizarSignosVitales = async (id, datos) => {
  const respuesta = await api.put(
    `/atencion-enfermeria/signos-vitales/${id}`,
    datos
  )

  return respuesta.data
}

// Eliminar signos vitales
export const eliminarSignosVitales = async (id) => {
  const respuesta = await api.delete(
    `/atencion-enfermeria/signos-vitales/${id}`
  )

  return respuesta.data
}