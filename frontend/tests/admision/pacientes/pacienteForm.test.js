import { describe, expect, it } from 'vitest'
import {
  erroresVacios,
  procesarErrorServidor,
  validarPaciente
} from '../../../src/modules/admision/pacientes/utils/pacienteForm'

const pacienteValido = () => ({
  nombre: 'Persona',
  apellido: 'Prueba',
  dni: '12345678',
  email: 'persona@example.test',
  fechaNacimiento: '2000-01-01'
})

describe('formulario de pacientes', () => {
  it('acepta datos válidos y limpia errores previos', () => {
    const errores = { ...erroresVacios(), nombre: 'Error anterior' }
    expect(validarPaciente(pacienteValido(), errores)).toBe(true)
    expect(errores).toEqual(erroresVacios())
  })

  it('valida campos requeridos, DNI, email y fecha', () => {
    const errores = erroresVacios()
    const paciente = {
      nombre: ' ',
      apellido: '',
      dni: '123.456',
      email: 'correo-inválido',
      fechaNacimiento: ''
    }

    expect(validarPaciente(paciente, errores)).toBe(false)
    expect(errores).toMatchObject({
      nombre: 'El nombre es obligatorio',
      apellido: 'El apellido es obligatorio',
      dni: 'Ingrese de 7 a 9 dígitos, sin puntos',
      email: 'Ingrese un email válido',
      fechaNacimiento: 'La fecha de nacimiento es obligatoria'
    })
  })

  it('rechaza una fecha de nacimiento futura', () => {
    const manana = new Date()
    manana.setDate(manana.getDate() + 1)
    const fechaFutura = manana.toLocaleDateString('en-CA')
    const errores = erroresVacios()

    expect(validarPaciente({ ...pacienteValido(), fechaNacimiento: fechaFutura }, errores)).toBe(
      false
    )
    expect(errores.fechaNacimiento).toBe('La fecha no puede ser futura')
  })

  it('asigna conflictos del servidor al campo correspondiente', () => {
    const errores = erroresVacios()
    expect(
      procesarErrorServidor(
        { response: { status: 409, data: { error: 'DNI ya registrado' } } },
        errores
      )
    ).toBe('')
    expect(errores.dni).toBe('DNI ya registrado')
    expect(
      procesarErrorServidor({ response: { status: 409, data: { error: 'Conflicto' } } }, errores)
    ).toBe('Conflicto')
    expect(procesarErrorServidor(new Error('offline'), errores)).toBe(
      'No se pudo conectar con el servidor'
    )
  })
})
