
import api from '@/shared/services/api'

// Registrar una medicación
export const registrarMedicacion = async (medicacion) => {
  const respuesta = await api.post(
    '/atencion-enfermeria/medicaciones',
    medicacion
  )

  return respuesta.data
}

// Listar todas las medicaciones
export const listarMedicaciones = async () => {
  const respuesta = await api.get(
    '/atencion-enfermeria/medicaciones'
  )

  return respuesta.data
}

// Listar medicaciones de una internación
export const listarMedicacionesPorInternacion = async (internacionId) => {
  const respuesta = await api.get(
    `/atencion-enfermeria/medicaciones/internacion/${internacionId}`
  )

  return respuesta.data
}

// Actualizar una medicación
export const actualizarMedicacion = async (id, datos) => {
  const respuesta = await api.put(
    `/atencion-enfermeria/medicaciones/${id}`,
    datos
  )

  return respuesta.data
}