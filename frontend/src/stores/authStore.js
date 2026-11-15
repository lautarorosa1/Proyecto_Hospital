import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import authService from '@/services/authService'

const ROLES_POR_RUTA = [
  { ruta: '/admin', roles: [] },
  { ruta: '/pacientes/create', roles: ['Recepcionista', 'Administrativo'] },
  { ruta: '/pacientes/edit', roles: ['Recepcionista', 'Administrativo'] },
  { ruta: '/pacientes', roles: ['Médico', 'Enfermero', 'Recepcionista', 'Administrativo'] },
  { ruta: '/profesionales/create', roles: ['Administrativo'] },
  { ruta: '/profesionales/edit', roles: ['Administrativo'] },
  { ruta: '/profesionales', roles: ['Médico', 'Enfermero', 'Recepcionista', 'Administrativo'] },
  { ruta: '/turnos/generar', roles: ['Recepcionista'] },
  { ruta: '/turnos', roles: ['Médico', 'Recepcionista', 'Administrativo'] },
  { ruta: '/guardia', roles: ['Médico', 'Enfermero', 'Recepcionista'] },
  { ruta: '/admision', roles: ['Médico', 'Enfermero', 'Recepcionista', 'Administrativo'] },
  { ruta: '/historia-clinica', roles: ['Médico', 'Enfermero'] },
  { ruta: '/atencion-enfermeria', roles: ['Médico', 'Enfermero'] },
  { ruta: '/camas/create', roles: ['Administrativo'] },
  { ruta: '/camas', roles: ['Médico', 'Enfermero', 'Recepcionista', 'Administrativo', 'Maestranza'] },
  { ruta: '/habitaciones/create', roles: ['Administrativo'] },
  { ruta: '/habitaciones/edit', roles: ['Administrativo'] },
  { ruta: '/habitaciones', roles: ['Administrativo', 'Maestranza'] },
  { ruta: '/insumos', roles: ['Médico', 'Enfermero', 'Administrativo'] },
  { ruta: '/recursos-camas', roles: ['Médico', 'Enfermero', 'Recepcionista', 'Administrativo', 'Maestranza'] }
]

function parseStoredUser() {
  const raw = localStorage.getItem('usuario')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem('usuario')
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const usuario = ref(parseStoredUser())
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => Boolean(token.value && usuario.value))

  function hasRole(...roles) {
    if (!usuario.value || !Array.isArray(usuario.value.roles)) return false
    const allowed = roles.flat()
    return usuario.value.roles.some((rol) => allowed.includes(rol))
  }

  function hasPermission(permiso) {
    if (!usuario.value || !Array.isArray(usuario.value.permisos)) return false
    return usuario.value.permisos.includes(permiso)
  }

  function puedeAcceder(path) {
    const regla = ROLES_POR_RUTA.find((r) => path === r.ruta || path.startsWith(`${r.ruta}/`))
    if (!regla) return true
    return hasRole('Administrador', ...regla.roles)
  }

  function setSession(newToken, newUsuario) {
    token.value = newToken
    usuario.value = newUsuario
    localStorage.setItem('token', newToken)
    localStorage.setItem('usuario', JSON.stringify(newUsuario))
  }

  function logout() {
    token.value = null
    usuario.value = null
    error.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
  }

  async function login(emailOrCredentials, passwordArg) {
    loading.value = true
    error.value = null
    try {
      const credentials =
        typeof emailOrCredentials === 'object' && emailOrCredentials !== null
          ? emailOrCredentials
          : { email: emailOrCredentials, password: passwordArg }

      const { data } = await authService.login(credentials)
      setSession(data.token, data.usuario)
      return data
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al iniciar sesión'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(payload) {
    loading.value = true
    error.value = null
    try {
      const { data } = await authService.register(payload)
      if (data.token && data.usuario) {
        setSession(data.token, data.usuario)
      }
      return data
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al registrar el usuario'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function checkAuth() {
    if (!token.value) return null
    loading.value = true
    try {
      const { data } = await authService.getProfile()
      usuario.value = data
      localStorage.setItem('usuario', JSON.stringify(data))
      return data
    } catch {
      logout()
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    token,
    usuario,
    loading,
    error,
    isAuthenticated,
    hasRole,
    hasPermission,
    puedeAcceder,
    login,
    register,
    logout,
    checkAuth
  }
})

