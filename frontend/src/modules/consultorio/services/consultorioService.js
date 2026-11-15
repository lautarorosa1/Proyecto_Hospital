import api from '@/shared/services/api'

// ---------- Consultorios (habitaciones de tipo CONSULTORIO) ----------

// Consultorios con su ocupación actual: { id, numero, piso, sector, ocupacion | null }
export const listarConsultorios = async () => (await api.get('/consultorio/habitaciones')).data

// El profesional empieza a atender en un consultorio. 409 si la sala ya está ocupada
// o si el profesional ya tiene otra abierta.
export const abrirConsultorio = async (profesionalId, habitacionId) =>
  (await api.post('/consultorio/ocupaciones', { profesionalId, habitacionId })).data

// { ocupacion: { id, habitacion: { numero, piso, sector }, iniciadaEn } | null }
export const obtenerOcupacion = async (profesionalId) =>
  (await api.get(`/consultorio/profesionales/${profesionalId}/ocupacion`)).data.ocupacion

export const cerrarConsultorio = async (profesionalId) =>
  (await api.post(`/consultorio/profesionales/${profesionalId}/ocupacion/cerrar`)).data

// ---------- Turnos del profesional ----------

// { fecha, turnos: [{ ..., paciente }], resumen: { programado, confirmado, en_sala_espera, atendido, cancelado } }
export const obtenerAgenda = async (profesionalId, fecha) =>
  (await api.get(`/consultorio/profesionales/${profesionalId}/agenda`, { params: { fecha } })).data

// Pacientes que ya llegaron y esperan (turnos en estado en_sala_espera)
export const obtenerSalaEspera = async (profesionalId, fecha) =>
  (await api.get(`/consultorio/profesionales/${profesionalId}/sala-espera`, { params: { fecha } })).data

// Requiere un consultorio abierto; el turno debe estar en sala de espera
export const atenderTurno = async (profesionalId, turnoId) =>
  (await api.post(`/consultorio/profesionales/${profesionalId}/turnos/${turnoId}/atender`)).data

// ---------- Notificaciones ----------

// { notificaciones: [...], noLeidas }
export const listarNotificaciones = async (profesionalId, soloNoLeidas = false) =>
  (await api.get(`/consultorio/profesionales/${profesionalId}/notificaciones`, { params: { soloNoLeidas } })).data

export const marcarLeida = (profesionalId, notificacionId) =>
  api.post(`/consultorio/profesionales/${profesionalId}/notificaciones/${notificacionId}/leer`)

export const marcarTodasLeidas = async (profesionalId) =>
  (await api.post(`/consultorio/profesionales/${profesionalId}/notificaciones/leer-todas`)).data

// ---------- Tiempo real (SSE) ----------

// Eventos del profesional: `notificacion` y `ocupacion`
export const urlStreamProfesional = (profesionalId) =>
  `${api.defaults.baseURL}/consultorio/profesionales/${profesionalId}/stream`

// Eventos generales: `consultorio_estado` cuando alguien abre o cierra una sala
export const urlStreamConsultorios = () => `${api.defaults.baseURL}/consultorio/habitaciones/stream`
