import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import ReservarTurnoModal from '../../../src/modules/admision/turnos/components/ReservarTurnoModal.vue'
import { reservarTurno } from '../../../src/modules/admision/turnos/services/turnoService'

vi.mock('../../../src/modules/admision/turnos/services/turnoService', () => ({
  reservarTurno: vi.fn()
}))

const propsBase = {
  modelValue: true,
  turno: { id: 7, fecha: '2026-05-01', horaInicio: '10:00', horaFin: '10:30', version: 4 },
  profesional: { apellido: 'Prueba', nombre: 'Persona' },
  pacientes: [
    { id: 1, apellido: 'Ejemplo', nombre: 'Persona', dni: '12345678' },
    { id: 2, apellido: 'Otra', nombre: 'Persona', dni: '87654321' }
  ]
}

describe('ReservarTurnoModal', () => {
  beforeEach(() => vi.mocked(reservarTurno).mockReset())

  it('filtra pacientes por apellido, nombre o DNI', async () => {
    const wrapper = mount(ReservarTurnoModal, {
      props: propsBase,
      global: { stubs: { RouterLink: true } }
    })

    await wrapper.get('input').setValue('87654321')
    expect(wrapper.findAll('ul button')).toHaveLength(1)
    expect(wrapper.text()).toContain('Otra, Persona')
    expect(wrapper.text()).not.toContain('Ejemplo, Persona')
  })

  it('reserva con paciente y versión observada y emite cierre', async () => {
    vi.mocked(reservarTurno).mockResolvedValue({})
    const wrapper = mount(ReservarTurnoModal, {
      props: propsBase,
      global: { stubs: { RouterLink: true } }
    })

    await wrapper.get('ul button').trigger('click')
    await wrapper.get('button.bg-indigo-600').trigger('click')
    await flushPromises()

    expect(reservarTurno).toHaveBeenCalledWith(7, { pacienteId: 1, version: 4 })
    expect(wrapper.emitted('reservado')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })
})
