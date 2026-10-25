// Agenda semanal de atención de un profesional.
// La agenda en pantalla es un objeto { 1: [...rangos], ..., 7: [...] } (1 = lunes ... 7 = domingo)
// y cada rango es { horaDesde: 'HH:mm', horaHasta: 'HH:mm' }.

export const DIAS_SEMANA = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' }
]

const aMinutos = (hora) => {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

export const agendaVacia = () => Object.fromEntries(DIAS_SEMANA.map((d) => [d.value, []]))

// Lista del backend -> agenda por día
export const agendaDesdeLista = (lista) => {
  const agenda = agendaVacia()
  for (const h of lista) {
    agenda[h.diaSemana].push({ horaDesde: h.horaDesde, horaHasta: h.horaHasta })
  }
  return agenda
}

// Agenda por día -> lista para el backend (se ignoran los rangos totalmente vacíos)
export const listaDesdeAgenda = (agenda) =>
  DIAS_SEMANA.flatMap(({ value }) =>
    agenda[value]
      .filter((r) => r.horaDesde && r.horaHasta)
      .map((r) => ({ diaSemana: value, horaDesde: r.horaDesde, horaHasta: r.horaHasta }))
  )

// Devuelve { [dia]: 'mensaje' } con los días que tienen errores ({} si todo está bien).
// Replica las reglas del backend.
export const validarAgenda = (agenda, duracionMin) => {
  const errores = {}

  for (const { value: dia } of DIAS_SEMANA) {
    const completos = []

    for (const r of agenda[dia]) {
      if (!r.horaDesde && !r.horaHasta) continue

      if (!r.horaDesde || !r.horaHasta) {
        errores[dia] = 'Complete la hora de inicio y de fin, o elimine el rango'
        break
      }

      const desde = aMinutos(r.horaDesde)
      const hasta = aMinutos(r.horaHasta)

      if (desde >= hasta) {
        errores[dia] = 'La hora de inicio debe ser anterior a la de fin'
        break
      }
      if (hasta - desde < duracionMin) {
        errores[dia] = `Cada rango debe durar al menos un turno (${duracionMin} min)`
        break
      }
      completos.push({ desde, hasta })
    }

    if (errores[dia]) continue

    completos.sort((a, b) => a.desde - b.desde)
    for (let i = 1; i < completos.length; i++) {
      if (completos[i].desde < completos[i - 1].hasta) {
        errores[dia] = 'Los rangos se superponen'
        break
      }
    }
  }

  return errores
}
