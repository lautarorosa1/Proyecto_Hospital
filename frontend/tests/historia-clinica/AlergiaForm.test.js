import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AlergiaForm from '../../src/modules/historia-clinica/components/AlergiaForm.vue'

describe('AlergiaForm', () => {
  it('muestra validación obligatoria y no emite datos incompletos', async () => {
    const wrapper = mount(AlergiaForm)
    await wrapper.get('form').trigger('submit')

    expect(wrapper.text()).toContain('Todos los campos son obligatorios.')
    expect(wrapper.emitted('guardar')).toBeUndefined()
  })

  it('recorta los campos y emite una alergia válida', async () => {
    const wrapper = mount(AlergiaForm)
    await wrapper.get('#alergeno').setValue('  Prueba  ')
    await wrapper.get('#reaccion').setValue('  Reacción de prueba  ')
    await wrapper.get('#severidad').setValue('moderada')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('guardar')).toEqual([
      [{ alergeno: 'Prueba', reaccion: 'Reacción de prueba', severidad: 'moderada' }]
    ])
  })

  it('carga los valores de la alergia en modo edición', () => {
    const wrapper = mount(AlergiaForm, {
      props: { alergia: { alergeno: 'Prueba', reaccion: 'Reacción', severidad: 'alta' } }
    })
    expect(wrapper.get('#alergeno').element.value).toBe('Prueba')
    expect(wrapper.text()).toContain('Editar alergia')
  })
})
