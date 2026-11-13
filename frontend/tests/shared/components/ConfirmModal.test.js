import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmModal from '../../../src/shared/components/ConfirmModal.vue'

describe('ConfirmModal', () => {
  it('no muestra contenido cuando está cerrado', () => {
    const wrapper = mount(ConfirmModal, { props: { modelValue: false } })
    expect(wrapper.find('h2').exists()).toBe(false)
  })

  it('emite confirmación y cierre al confirmar', async () => {
    const wrapper = mount(ConfirmModal, {
      props: { modelValue: true, titulo: 'Confirmación', textoConfirmar: 'Aceptar' }
    })

    expect(wrapper.text()).toContain('Confirmación')
    await wrapper.get('button:last-child').trigger('click')
    expect(wrapper.emitted('confirm')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })

  it('cierra al cancelar o hacer clic en el fondo', async () => {
    const wrapper = mount(ConfirmModal, { props: { modelValue: true } })
    await wrapper.get('button:first-child').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])

    const backdrop = mount(ConfirmModal, { props: { modelValue: true } })
    await backdrop.get('.fixed').trigger('click')
    expect(backdrop.emitted('update:modelValue')).toEqual([[false]])
  })
})
