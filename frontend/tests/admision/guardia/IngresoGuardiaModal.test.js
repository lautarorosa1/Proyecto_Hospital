import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import IngresoGuardiaModal from '../../../src/modules/admision/guardia/components/IngresoGuardiaModal.vue'
import { registrarIngreso } from '../../../src/modules/admision/guardia/services/guardiaService'

vi.mock('../../../src/modules/admision/guardia/services/guardiaService', () => ({
  registrarIngreso: vi.fn()
}))

const propsBase = {
  modelValue: true,
  enfermeros: [{ id: 2, apellido: 'Prueba', nombre: 'Enfermero' }],
  pacientes: [{ id: 1, apellido: 'Ejemplo', nombre: 'Persona', dni: '12345678' }]
}

describe('IngresoGuardiaModal', () => {
  beforeEach(() => vi.mocked(registrarIngreso).mockReset())

  it('valida el formulario antes de solicitar el ingreso', async () => {
    const wrapper = mount(IngresoGuardiaModal, {
      props: propsBase,
      global: { stubs: { RouterLink: true } }
    })
    await wrapper.findAll('button').find((button) => button.text().includes('Registrar ingreso')).trigger('click')

    expect(wrapper.text()).toContain('Seleccione un paciente')
    expect(registrarIngreso).not.toHaveBeenCalled()
  })

  it('envía los datos de triaje validados y emite el resultado simulado', async () => {
    const response = { ingreso: { id: 12 }, desplazados: 0, medicosAlertados: [] }
    vi.mocked(registrarIngreso).mockResolvedValue({ data: response })
    const wrapper = mount(IngresoGuardiaModal, {
      props: propsBase,
      global: { stubs: { RouterLink: true } }
    })

    await wrapper.get('ul button').trigger('click')
    await wrapper.get('select').setValue('2')
    await wrapper.findAll('button').find((button) => button.text().includes('Riesgo Vital')).trigger('click')
    await wrapper.get('input[maxlength="500"]').setValue('Consulta de prueba')
    await wrapper.findAll('button').find((button) => button.text().includes('Registrar ingreso')).trigger('click')
    await flushPromises()

    expect(registrarIngreso).toHaveBeenCalledWith({
      pacienteId: 1,
      enfermeroId: 2,
      nivelTriaje: 'rojo',
      motivoConsulta: 'Consulta de prueba'
    })
    expect(wrapper.emitted('registrado')).toEqual([[response]])
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })
})
