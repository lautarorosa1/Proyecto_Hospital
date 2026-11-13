import { describe, expect, it } from 'vitest'
import {
  erroresIngresoVacios,
  ingresoVacio,
  mensajeRegistro,
  validarIngreso
} from '../../../src/modules/admision/guardia/utils/guardiaForm'

describe('formulario de guardia', () => {
  it('valida todos los campos requeridos y limpia errores previos', () => {
    const errores = { ...erroresIngresoVacios(), nivelTriaje: 'Error anterior' }
    expect(validarIngreso(ingresoVacio(), errores)).toBe(false)
    expect(errores).toMatchObject({
      pacienteId: 'Seleccione un paciente',
      enfermeroId: 'Seleccione el enfermero que realiza el triaje',
      nivelTriaje: 'Asigne un nivel de triaje',
      motivoConsulta: 'El motivo de consulta es obligatorio'
    })
  })

  it('rechaza motivos y observaciones que superan sus límites', () => {
    const errores = erroresIngresoVacios()
    const datos = {
      pacienteId: 1,
      enfermeroId: 2,
      nivelTriaje: 'verde',
      motivoConsulta: 'm'.repeat(501),
      observaciones: 'o'.repeat(2001)
    }

    expect(validarIngreso(datos, errores)).toBe(false)
    expect(errores.motivoConsulta).toContain('500')
    expect(errores.observaciones).toContain('2000')
  })

  it('incluye desplazamientos y alertas en el mensaje de registro', () => {
    expect(
      mensajeRegistro({
        ingreso: { nivelTriaje: 'rojo', posicion: 1 },
        desplazados: 1,
        medicosAlertados: [{ id: 4 }]
      })
    ).toContain('Pasa delante de 1 paciente de menor riesgo. Alerta enviada a 1 médico.')
  })

  it('informa si no hay médicos activos para alertar ante riesgo vital', () => {
    expect(
      mensajeRegistro({
        ingreso: { nivelTriaje: 'rojo', posicion: 1 },
        desplazados: 0,
        medicosAlertados: []
      })
    ).toContain('No había médicos activos para alertar.')
  })
})
