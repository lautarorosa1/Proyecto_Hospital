import { describe, expect, it } from 'vitest'
import {
  accionesDisponibles,
  calcularHoraFin,
  calcularHorariosLibres,
  diaSemanaISO,
  erroresGenerarVacios,
  formatearFecha,
  generarHorarios,
  validarEntreturno,
  validarGenerar
} from '../../../src/modules/admision/turnos/utils/turnoForm'

describe('reglas de turnos', () => {
  it('expone acciones según el estado del turno', () => {
    expect(accionesDisponibles('programado')).toEqual(['confirmar', 'cancelar'])
    expect(accionesDisponibles('en_sala_espera')).toEqual(['atender'])
    expect(accionesDisponibles('atendido')).toEqual([])
  })

  it('formatea fechas ISO sin desfase y resuelve días de semana', () => {
    expect(formatearFecha('2026-03-04')).toBe('04/03/2026')
    expect(formatearFecha('')).toBe('—')
    expect(diaSemanaISO('2026-03-02')).toBe(1)
    expect(diaSemanaISO('2026-03-08')).toBe(7)
  })

  it('genera horarios completos para cada rango e ignora duraciones inválidas', () => {
    expect(
      generarHorarios(
        [
          { horaDesde: '09:00', horaHasta: '10:00' },
          { horaDesde: '11:00', horaHasta: '11:30' }
        ],
        30
      )
    ).toEqual(['09:00', '09:30', '11:00'])
    expect(generarHorarios([{ horaDesde: '09:00', horaHasta: '10:00' }], 0)).toEqual([])
  })

  it('filtra horarios pasados y turnos superpuestos, pero ignora cancelados', () => {
    const libres = calcularHorariosLibres({
      duracionMin: 30,
      rangos: [{ horaDesde: '09:00', horaHasta: '11:00' }],
      ocupados: [
        { horaInicio: '09:30', duracionMin: 30, estado: 'programado' },
        { horaInicio: '10:00', duracionMin: 30, estado: 'cancelado' }
      ],
      fecha: '2026-05-01',
      hoy: '2026-05-01',
      ahora: '09:00'
    })
    expect(libres).toEqual(['09:00', '10:00', '10:30'])
  })

  it('calcula la hora de fin incluyendo el cruce de medianoche', () => {
    expect(calcularHoraFin('23:45', 30)).toBe('00:15')
    expect(calcularHoraFin('', 30)).toBe('')
    expect(calcularHoraFin('09:00', 'invalido')).toBe('')
  })

  it('valida la generación de turnos y reinicia mensajes anteriores', () => {
    const errores = { ...erroresGenerarVacios(), fecha: 'Error anterior' }
    const datos = { profesionalId: '', fecha: '2026-04-30', horaInicio: '08:00' }

    expect(validarGenerar(datos, errores, '2026-05-01', '09:00')).toBe(false)
    expect(errores.profesionalId).toBe('Seleccione un profesional')
    expect(errores.fecha).toBe('No se pueden crear turnos en una fecha pasada')
    expect(errores.horaInicio).toBe('')
  })

  it('valida fecha, horario y duración de entreturnos', () => {
    const errores = {}
    const valido = {
      profesionalId: 1,
      fecha: '2026-05-01',
      horaInicio: '10:00',
      duracionMin: 15,
      pacienteId: 2
    }
    expect(validarEntreturno(valido, errores, '2026-05-01', '09:00')).toBe(true)
    expect(validarEntreturno({ ...valido, duracionMin: 4 }, errores, '2026-05-01', '09:00')).toBe(
      false
    )
    expect(errores.duracionMin).toContain('entre 5 y 120')
  })
})
