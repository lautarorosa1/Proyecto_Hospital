import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfesionalForm from '../../../src/modules/admision/profesionales/components/ProfesionalForm.vue'
import {
  erroresVacios,
  profesionalVacio
} from '../../../src/modules/admision/profesionales/utils/profesionalForm'

describe('ProfesionalForm', () => {
  it('muestra errores, deshabilita el envío y omite el estado al crear', () => {
    const wrapper = mount(ProfesionalForm, {
      props: {
        modelValue: profesionalVacio(),
        errores: { ...erroresVacios(), nombre: 'El nombre es obligatorio' },
        guardando: true
      }
    })

    expect(wrapper.text()).toContain('El nombre es obligatorio')
    expect(wrapper.get('button[type="submit"]').element.disabled).toBe(true)
    expect(wrapper.text()).not.toContain('Estado')
  })

  it('muestra el estado al editar y emite el envío', async () => {
    const wrapper = mount(ProfesionalForm, {
      props: {
        modelValue: { ...profesionalVacio(), nombre: 'Persona' },
        errores: erroresVacios(),
        mostrarEstado: true,
        textoBoton: 'Actualizar'
      }
    })

    expect(wrapper.text()).toContain('Estado')
    expect(wrapper.get('button[type="submit"]').text()).toBe('Actualizar')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('submit')).toHaveLength(1)
  })
})
