// Helpers, catálogos y validaciones de la pantalla de turnos.

export const ESTADOS_TURNO = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'programado', label: 'Programado' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'en_sala_espera', label: 'En sala de espera' },
  { value: 'atendido', label: 'Atendido' },
  { value: 'cancelado', label: 'Cancelado' }
]

export const etiquetaEstadoTurno = (value) =>
  ESTADOS_TURNO.find((e) => e.value === value)?.label ?? value

export const claseEstadoTurno = (value) =>
  ({
    disponible: 'bg-green-50 text-green-700 ring-green-200',
    programado: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    confirmado: 'bg-blue-50 text-blue-700 ring-blue-200',
    en_sala_espera: 'bg-amber-50 text-amber-700 ring-amber-200',
    atendido: 'bg-gray-100 text-gray-600 ring-gray-200',
    cancelado: 'bg-red-50 text-red-700 ring-red-200'
  })[value] ?? 'bg-gray-100 text-gray-600 ring-gray-200'

// Acciones disponibles según el estado del turno. Refleja la máquina de estados
// del backend (patrón State); si cambia allá, hay que cambiarla acá.
// 'cancelar' pide confirmación; las demás se ejecutan directo.
export const ACCIONES_TURNO = {
  confirmar: {
    label: 'Confirmar',
    clase: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
  },
  llegada: {
    label: 'Registrar llegada',
    clase: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
  },
  atender: {
    label: 'Marcar atendido',
    clase: 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
  },
  cancelar: {
    label: 'Cancelar',
    clase: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
  }
}

export const ACCIONES_POR_ESTADO = {
  programado: ['confirmar', 'cancelar'],
  confirmado: ['llegada', 'cancelar'],
  en_sala_espera: ['atender']
}

export const accionesDisponibles = (estado) => ACCIONES_POR_ESTADO[estado] ?? []

// "YYYY-MM-DD" -> "DD/MM/YYYY" (sin pasar por Date, para evitar desfases de zona horaria)
export const formatearFecha = (iso) => {
  if (!iso) return '—'
  const [anio, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${anio}`
}

export const nombreProfesional = (profesional) =>
  profesional ? `${profesional.apellido}, ${profesional.nombre}` : '—'

export const nombrePaciente = (paciente) =>
  paciente ? `${paciente.apellido}, ${paciente.nombre}` : '—'

// Mensaje legible a partir de un error de axios ({ error: "mensaje" } del backend)
export const mensajeError = (error, porDefecto = 'Ocurrió un error inesperado') => {
  if (!error.response) return 'No se pudo conectar con el servidor'
  return error.response.data?.error || porDefecto
}

// ---------- Creación de turnos ----------

export const generarVacio = () => ({
  profesionalId: '',
  fecha: '',
  horaInicio: ''
})

export const erroresGenerarVacios = () => ({
  profesionalId: '',
  fecha: '',
  horaInicio: ''
})

// "HH:mm" actual en hora local
export const horaActual = () => new Date().toTimeString().slice(0, 5)

const aMinutos = (hora) => {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

const aHora = (minutos) =>
  `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`

// Día de la semana de una fecha "YYYY-MM-DD": 1 = lunes ... 7 = domingo
export const diaSemanaISO = (fecha) => {
  const [anio, mes, dia] = fecha.split('-').map(Number)
  const dow = new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay() // 0 = domingo
  return dow === 0 ? 7 : dow
}

// Grilla de horarios del día: dentro de cada rango de atención, desde su inicio
// y cada `duracionMin` minutos mientras el turno entre completo en el rango.
// Debe coincidir con la regla del backend.
export const generarHorarios = (rangos, duracionMin) => {
  const dur = Number(duracionMin)
  if (!Number.isInteger(dur) || dur <= 0) return []
  const horarios = []
  for (const rango of rangos) {
    const hasta = aMinutos(rango.horaHasta)
    for (let inicio = aMinutos(rango.horaDesde); inicio + dur <= hasta; inicio += dur) {
      horarios.push(aHora(inicio))
    }
  }
  return horarios.sort()
}

// Horarios de la grilla que se pueden elegir: no pasados (si la fecha es hoy)
// y sin superponerse con turnos existentes que no estén cancelados.
export const calcularHorariosLibres = ({ duracionMin, rangos, ocupados, fecha, hoy, ahora }) => {
  const dur = Number(duracionMin)
  const turnos = ocupados.filter((t) => t.estado !== 'cancelado')

  return generarHorarios(rangos, dur).filter((hora) => {
    if (fecha === hoy && hora < ahora) return false
    const inicio = aMinutos(hora)
    const fin = inicio + dur
    return !turnos.some((t) => {
      const tInicio = aMinutos(t.horaInicio)
      return tInicio < fin && tInicio + t.duracionMin > inicio
    })
  })
}

// Hora en que termina un turno que empieza en `horaInicio` y dura `duracionMin`
export const calcularHoraFin = (horaInicio, duracionMin) => {
  if (!horaInicio || !Number.isInteger(Number(duracionMin))) return ''
  const [h, m] = horaInicio.split(':').map(Number)
  const total = h * 60 + m + Number(duracionMin)
  const dos = (n) => String(n).padStart(2, '0')
  return `${dos(Math.floor(total / 60) % 24)}:${dos(total % 60)}`
}

// ---------- Entreturno (HU 1.2) ----------

// Deben coincidir con las constantes del backend (domain/Entreturno.ts)
export const ENTRETURNO_DURACION_DEFAULT_MIN = 15
export const ENTRETURNO_DURACION_MIN = 5
export const ENTRETURNO_DURACION_MAX = 120

export const entreturnoVacio = () => ({
  profesionalId: '',
  fecha: '',
  horaInicio: '',
  duracionMin: ENTRETURNO_DURACION_DEFAULT_MIN,
  pacienteId: null
})

export const erroresEntreturnoVacios = () => ({
  profesionalId: '',
  fecha: '',
  horaInicio: '',
  duracionMin: '',
  pacienteId: ''
})

// Completa `errores` y devuelve true si el formulario es válido.
// Las reglas que dependen de la agenda (superposición, horario de atención)
// las valida el backend y se muestran como error del formulario.
export const validarEntreturno = (datos, errores, hoy, ahora) => {
  Object.assign(errores, erroresEntreturnoVacios())
  let valido = true

  if (datos.profesionalId === '' || datos.profesionalId === null) {
    errores.profesionalId = 'Seleccione un profesional'
    valido = false
  }

  if (!datos.fecha) {
    errores.fecha = 'La fecha es obligatoria'
    valido = false
  } else if (datos.fecha < hoy) {
    errores.fecha = 'No se pueden crear entreturnos en una fecha pasada'
    valido = false
  }

  if (!datos.horaInicio) {
    errores.horaInicio = 'La hora es obligatoria'
    valido = false
  } else if (datos.fecha === hoy && datos.horaInicio < ahora) {
    errores.horaInicio = 'Ese horario ya pasó'
    valido = false
  }

  const dur = Number(datos.duracionMin)
  if (
    !Number.isInteger(dur) ||
    dur < ENTRETURNO_DURACION_MIN ||
    dur > ENTRETURNO_DURACION_MAX
  ) {
    errores.duracionMin = `Debe ser un entero entre ${ENTRETURNO_DURACION_MIN} y ${ENTRETURNO_DURACION_MAX} min`
    valido = false
  }

  if (datos.pacienteId === null) {
    errores.pacienteId = 'Seleccione un paciente'
    valido = false
  }

  return valido
}

// Completa `errores` y devuelve true si el formulario es válido.
// `hoy` es "YYYY-MM-DD"; `ahora` es "HH:mm".
export const validarGenerar = (datos, errores, hoy, ahora) => {
  Object.assign(errores, erroresGenerarVacios())
  let valido = true

  if (datos.profesionalId === '' || datos.profesionalId === null) {
    errores.profesionalId = 'Seleccione un profesional'
    valido = false
  }

  if (!datos.fecha) {
    errores.fecha = 'La fecha es obligatoria'
    valido = false
  } else if (datos.fecha < hoy) {
    errores.fecha = 'No se pueden crear turnos en una fecha pasada'
    valido = false
  }

  if (!datos.horaInicio) {
    errores.horaInicio = 'Seleccione un horario'
    valido = false
  } else if (datos.fecha === hoy && datos.horaInicio < ahora) {
    errores.horaInicio = 'Ese horario ya pasó'
    valido = false
  }

  return valido
}
