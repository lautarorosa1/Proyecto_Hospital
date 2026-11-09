import api from '@/shared/services/api'

// Listar todas las notas
export const listarNotas = async () => {
  const respuesta = await api.get('/atencion-enfermeria/notas')
  return respuesta.data
}

// Buscar una nota por ID
export const obtenerNotaPorId = async (id) => {
  const respuesta = await api.get(`/atencion-enfermeria/notas/${id}`)
  return respuesta.data
}

// Registrar una nota
export const crearNota = async (nota) => {
  const respuesta = await api.post('/atencion-enfermeria/notas', nota)
  return respuesta.data
}

// Actualizar una nota
export const actualizarNota = async (id, datos) => {
  const respuesta = await api.put(`/atencion-enfermeria/notas/${id}`, datos)
  return respuesta.data
}

// Eliminar una nota
export const eliminarNota = async (id) => {
  const respuesta = await api.delete(`/atencion-enfermeria/notas/${id}`)
  return respuesta.data
}