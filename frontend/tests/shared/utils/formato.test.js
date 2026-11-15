import { beforeEach, describe, expect, it } from 'vitest'
import {
  mensajeError,
  nombrePaciente,
  nombrePacienteDe,
  nombreProfesional,
  usuarioIdActual
} from '../../../src/shared/utils/formato'

describe('formato compartido', () => {
  beforeEach(() => localStorage.clear())

  it('presenta nombres de pacientes y profesionales o un marcador vacío', () => {
    expect(nombrePaciente({ apellido: 'Prueba', nombre: 'Persona' })).toBe('Prueba, Persona')
    expect(nombreProfesional({ apellido: 'Ejemplo', nombre: 'Médico' })).toBe('Ejemplo, Médico')
    expect(nombrePaciente(null)).toBe('—')
    expect(nombreProfesional(undefined)).toBe('—')
  })

  it('usa el id de paciente si no está en el listado', () => {
    expect(nombrePacienteDe({ 3: { apellido: 'Prueba', nombre: 'Persona' } }, 3)).toBe(
      'Prueba, Persona'
    )
    expect(nombrePacienteDe({}, 42)).toBe('Paciente #42')
  })

  it('prioriza los mensajes de API y cubre errores sin respuesta', () => {
    expect(mensajeError({ response: { data: { error: 'Error general' } } })).toBe('Error general')
    expect(mensajeError({ response: { data: { mensaje: 'Error alternativo' } } })).toBe(
      'Error alternativo'
    )
    expect(mensajeError({ response: { data: {} } }, 'Intentar luego')).toBe('Intentar luego')
    expect(mensajeError(new Error('offline'))).toBe('No se pudo conectar con el servidor')
  })

  it('obtiene un id de usuario positivo o usa el id de sistema', () => {
    localStorage.setItem('usuario', JSON.stringify({ id: 8 }))
    expect(usuarioIdActual()).toBe(8)

    localStorage.setItem('usuario', JSON.stringify({ id: 'no-numérico' }))
    expect(usuarioIdActual()).toBe(1)
    localStorage.setItem('usuario', '{')
    expect(usuarioIdActual()).toBe(1)
  })
})
