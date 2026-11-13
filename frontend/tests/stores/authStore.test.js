import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import authService from '../../src/services/authService'
import { useAuthStore } from '../../src/stores/authStore'

vi.mock('../../src/services/authService', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
    getProfile: vi.fn()
  }
}))

describe('store de autenticación', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.mocked(authService.login).mockReset()
    vi.mocked(authService.register).mockReset()
    vi.mocked(authService.getProfile).mockReset()
  })

  it('inicia sesión, persiste la sesión y evalúa permisos', async () => {
    const usuario = { id: 5, roles: ['administrador'], permisos: ['pacientes:leer'] }
    vi.mocked(authService.login).mockResolvedValue({ data: { token: 'token-de-prueba', usuario } })
    const store = useAuthStore()

    await store.login('persona@example.test', 'clave-de-prueba')
    expect(authService.login).toHaveBeenCalledWith({
      email: 'persona@example.test',
      password: 'clave-de-prueba'
    })
    expect(store.isAuthenticated).toBe(true)
    expect(store.hasRole('administrador')).toBe(true)
    expect(store.hasPermission('pacientes:leer')).toBe(true)
    expect(JSON.parse(localStorage.getItem('usuario'))).toEqual(usuario)
    expect(store.loading).toBe(false)
  })

  it('registra el error y vuelve a propagar el rechazo del servicio', async () => {
    vi.mocked(authService.login).mockRejectedValue({
      response: { data: { error: 'Credenciales inválidas' } }
    })
    const store = useAuthStore()

    await expect(store.login('persona@example.test', 'incorrecta')).rejects.toBeTruthy()
    expect(store.error).toBe('Credenciales inválidas')
    expect(store.loading).toBe(false)
  })

  it('cierra sesión y elimina las credenciales locales', () => {
    localStorage.setItem('token', 'token-de-prueba')
    localStorage.setItem('usuario', JSON.stringify({ id: 5 }))
    const store = useAuthStore()

    store.logout()
    expect(store.isAuthenticated).toBe(false)
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('usuario')).toBeNull()
  })

  it('limpia una sesión inválida durante la comprobación de autenticación', async () => {
    localStorage.setItem('token', 'token-de-prueba')
    vi.mocked(authService.getProfile).mockRejectedValue(new Error('API no disponible'))
    const store = useAuthStore()

    expect(await store.checkAuth()).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(localStorage.getItem('token')).toBeNull()
  })
})
