import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import LoginView from '../../src/views/LoginView.vue'

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  push: vi.fn(),
  route: { query: {} },
  store: { login: vi.fn(), error: '', loading: false }
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mocks.push }),
  useRoute: () => mocks.route
}))

vi.mock('../../src/stores/authStore', () => ({
  useAuthStore: () => mocks.store
}))

describe('LoginView', () => {
  beforeEach(() => {
    mocks.login.mockReset()
    mocks.push.mockReset()
    mocks.store.login = mocks.login
    mocks.store.error = ''
    mocks.store.loading = false
    mocks.route.query = {}
  })

  it('recorta el email, delega el acceso y navega al inicio', async () => {
    mocks.login.mockResolvedValue({})
    const wrapper = mount(LoginView, { global: { stubs: { RouterLink: true } } })
    await wrapper.get('input[type="email"]').setValue(' persona@example.test ')
    await wrapper.get('input[type="password"]').setValue('clave-de-prueba')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(mocks.login).toHaveBeenCalledWith('persona@example.test', 'clave-de-prueba')
    expect(mocks.push).toHaveBeenCalledWith('/')
  })

  it('vuelve a la ruta que el usuario intentaba abrir', async () => {
    mocks.login.mockResolvedValue({})
    mocks.route.query = { redirect: '/camas/3' }
    const wrapper = mount(LoginView, { global: { stubs: { RouterLink: true } } })
    await wrapper.get('input[type="email"]').setValue('persona@example.test')
    await wrapper.get('input[type="password"]').setValue('clave-de-prueba')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(mocks.push).toHaveBeenCalledWith('/camas/3')
  })

  it('ignora redirecciones hacia otros sitios', async () => {
    mocks.login.mockResolvedValue({})
    mocks.route.query = { redirect: '//sitio-externo.test' }
    const wrapper = mount(LoginView, { global: { stubs: { RouterLink: true } } })
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(mocks.push).toHaveBeenCalledWith('/')
  })

  it('avisa cuando la sesión expiró', () => {
    mocks.route.query = { sesion: 'expirada' }
    const wrapper = mount(LoginView, { global: { stubs: { RouterLink: true } } })

    expect(wrapper.text()).toContain('Tu sesión expiró')
  })

  it('muestra errores del store sin navegar', async () => {
    mocks.store.error = 'Acceso rechazado'
    mocks.login.mockRejectedValue(new Error('acceso rechazado'))
    const wrapper = mount(LoginView, { global: { stubs: { RouterLink: true } } })

    expect(wrapper.text()).toContain('Acceso rechazado')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(mocks.push).not.toHaveBeenCalled()
  })
})
