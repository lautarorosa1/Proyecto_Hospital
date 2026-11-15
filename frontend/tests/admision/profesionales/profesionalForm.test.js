import { describe, expect, it } from 'vitest'
import {
  armarPayload,
  erroresVacios,
  procesarErrorServidor,
  profesionalVacio,
  validarProfesional
} from '../../../src/modules/admision/profesionales/utils/profesionalForm'

const profesionalValido = () => ({
  ...profesionalVacio(),
  nombre: ' Persona ',
  apellido: ' Prueba ',
  dni: '12345678',
  email: 'persona@example.test',
  matricula: ' MP-1 ',
  tipoProfesional: 'medico',
  usuarioId: 'uuid-1'
})

describe('formulario de profesionales', () => {
  it('acepta valores válidos y normaliza campos de texto en el payload', () => {
    const errores = erroresVacios()
    const profesional = profesionalValido()

    expect(validarProfesional(profesional, errores)).toBe(true)
    expect(armarPayload(profesional)).toMatchObject({
      nombre: 'Persona',
      apellido: 'Prueba',
      matricula: 'MP-1',
      usuarioId: 'uuid-1',
      duracionTurnoMin: 30,
      telefono: undefined
    })
  })

  it('no exige especialidad ni usuario: sin usuario no se envía al crear y desvincula al editar', () => {
    const sinUsuario = { ...profesionalValido(), usuarioId: '' }
    const errores = erroresVacios()

    expect(validarProfesional(sinUsuario, errores)).toBe(true)
    expect(armarPayload(sinUsuario)).not.toHaveProperty('especialidadId')
    expect(armarPayload(sinUsuario).usuarioId).toBeUndefined()
    expect(armarPayload(sinUsuario, { edicion: true }).usuarioId).toBeNull()
  })

  it('valida formato y límites de duración', () => {
    const errores = erroresVacios()
    const profesional = {
      ...profesionalValido(),
      dni: '123',
      email: 'invalido',
      duracionTurnoMin: '241'
    }

    expect(validarProfesional(profesional, errores)).toBe(false)
    expect(errores).toMatchObject({
      dni: 'Ingrese de 7 a 9 dígitos, sin puntos',
      email: 'Ingrese un email válido',
      duracionTurnoMin: 'Ingrese un entero entre 5 y 240'
    })
  })

  it('incluye teléfono y estado al editar y permite borrar el teléfono', () => {
    const profesional = { ...profesionalValido(), telefono: ' ', estado: 'inactivo' }
    const payload = armarPayload(profesional, { edicion: true })

    expect(payload.telefono).toBe('')
    expect(payload.estado).toBe('inactivo')
    expect(armarPayload({ ...profesional, telefono: '555' }).telefono).toBe('555')
  })

  it('traduce conflictos de matrícula y errores de conexión', () => {
    const errores = erroresVacios()
    expect(
      procesarErrorServidor(
        { response: { status: 409, data: { error: 'La matrícula ya existe' } } },
        errores
      )
    ).toBe('')
    expect(errores.matricula).toBe('La matrícula ya existe')
    expect(procesarErrorServidor(new Error('offline'), errores)).toBe(
      'No se pudo conectar con el servidor'
    )
  })
})
