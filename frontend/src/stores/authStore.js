import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import authService from '@/services/authService'

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
    login,
    register,
    logout,
    checkAuth
  }
})

