import api from '@/shared/services/api'

// Listar todos los protocolos
export const listarProtocolos = async () => {
  const respuesta = await api.get('/atencion-enfermeria/protocolos')
  return respuesta.data
}

// Buscar un protocolo por ID
export const obtenerProtocoloPorId = async (id) => {
  const respuesta = await api.get(`/atencion-enfermeria/protocolos/${id}`)
  return respuesta.data
}

// Crear un protocolo
export const crearProtocolo = async (protocolo) => {
  const respuesta = await api.post('/atencion-enfermeria/protocolos', protocolo)
  return respuesta.data
}

// Actualizar un protocolo
export const actualizarProtocolo = async (id, datos) => {
  const respuesta = await api.put(`/atencion-enfermeria/protocolos/${id}`, datos)
  return respuesta.data
}

// Eliminar un protocolo
export const eliminarProtocolo = async (id) => {
  await api.delete(`/atencion-enfermeria/protocolos/${id}`)
}
// Protocolos generados automáticamente al ingresar una internación
export const listarProtocolosPorInternacion = async (internacionId) => {
  const respuesta = await api.get(
    `/atencion-enfermeria/protocolos/internacion/${internacionId}`
  )
  return respuesta.data
}
