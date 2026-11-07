import api from './api'

export const getRoles = () => api.get('/roles')

export const createRol = (data) => api.post('/roles', data)

export const updateRol = (id, data) => api.put(`/roles/${id}`, data)

export const deleteRol = (id) => api.delete(`/roles/${id}`)

export const getUsuarios = () => api.get('/usuarios')

export const getUsuarioById = (id) => api.get(`/usuarios/${id}`)

export const updateUsuario = (id, data) => api.put(`/usuarios/${id}`, data)

export const toggleEstadoUsuario = (id, activo) =>
  api.patch(`/usuarios/${id}/estado`, { activo })

export const assignRoles = (id, payload) =>
  api.post(`/usuarios/${id}/roles`, payload)

export const removeRol = (id, rolId) =>
  api.delete(`/usuarios/${id}/roles/${rolId}`)

export default {
  getRoles,
  createRol,
  updateRol,
  deleteRol,
  getUsuarios,
  getUsuarioById,
  updateUsuario,
  toggleEstadoUsuario,
  assignRoles,
  removeRol
}

