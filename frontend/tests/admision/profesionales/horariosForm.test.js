import { describe, expect, it } from 'vitest'
import {
  agendaDesdeLista,
  agendaVacia,
  listaDesdeAgenda,
  validarAgenda
} from '../../../src/modules/admision/profesionales/utils/horariosForm'

describe('agenda de profesionales', () => {
  it('convierte una lista en agenda semanal y vuelve a serializarla', () => {
    const lista = [
      { diaSemana: 1, horaDesde: '09:00', horaHasta: '12:00' },
      { diaSemana: 3, horaDesde: '13:00', horaHasta: '17:00' }
    ]
    const agenda = agendaDesdeLista(lista)

    expect(agenda[1]).toEqual([{ horaDesde: '09:00', horaHasta: '12:00' }])
    expect(agenda[2]).toEqual([])
    expect(listaDesdeAgenda(agenda)).toEqual(lista)
  })

  it('omite rangos vacíos en la conversión al backend', () => {
    const agenda = agendaVacia()
    agenda[1] = [
      { horaDesde: '', horaHasta: '' },
      { horaDesde: '09:00', horaHasta: '10:00' }
    ]
    expect(listaDesdeAgenda(agenda)).toEqual([
      { diaSemana: 1, horaDesde: '09:00', horaHasta: '10:00' }
    ])
  })

  it('detecta rangos incompletos, duración insuficiente y horas invertidas', () => {
    const agenda = agendaVacia()
    agenda[1] = [
      { horaDesde: '09:00', horaHasta: '' },
      { horaDesde: '10:00', horaHasta: '10:10' }
    ]
    agenda[2] = [{ horaDesde: '12:00', horaHasta: '11:00' }]

    expect(validarAgenda(agenda, 30)).toEqual({
      1: 'Complete la hora de inicio y de fin, o elimine el rango',
      2: 'La hora de inicio debe ser anterior a la de fin'
    })
  })

  it('detecta superposiciones y acepta rangos consecutivos', () => {
    const agenda = agendaVacia()
    agenda[1] = [
      { horaDesde: '09:00', horaHasta: '10:00' },
      { horaDesde: '09:45', horaHasta: '11:00' }
    ]
    agenda[2] = [
      { horaDesde: '09:00', horaHasta: '10:00' },
      { horaDesde: '10:00', horaHasta: '11:00' }
    ]

    expect(validarAgenda(agenda, 30)).toEqual({ 1: 'Los rangos se superponen' })
  })
})
