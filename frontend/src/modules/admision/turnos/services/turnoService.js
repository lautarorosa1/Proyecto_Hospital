import api from '@/shared/services/api'

// params opcionales: { profesionalId, pacienteId, fecha, fechaDesde, fechaHasta, estado }
export const getTurnos = (params) => api.get('/turnos', { params })

// Slots libres a partir de ahora. params: { profesionalId, fecha, fechaDesde, fechaHasta }
export const getTurnosDisponibles = (params) => api.get('/turnos/disponibles', { params })

export const getTurnoById = (id) => api.get(`/turnos/${id}`)

// { profesionalId, fecha, horaInicio } — la duración la define el profesional
export const crearTurno = (datos) => api.post('/turnos', datos)

// Entreturno (HU 1.2): { profesionalId, pacienteId, fecha, horaInicio, duracionMin? }
// Recorta los turnos que se superponen. Responde { entreturno, afectados, advertencias }.
export const crearEntreturno = (datos) => api.post('/turnos/entreturno', datos)

// { pacienteId, version } — version es la que se vio al listar el turno
export const reservarTurno = (id, datos) => api.post(`/turnos/${id}/reservar`, datos)

// Transiciones del estado de atención (HU 2.1). Sin body.
// programado -> confirmado
export const confirmarTurno = (id) => api.post(`/turnos/${id}/confirmar`)

// confirmado -> en_sala_espera (el backend avisa al consultorio)
export const registrarLlegadaTurno = (id) => api.post(`/turnos/${id}/llegada`)

// en_sala_espera -> atendido
export const atenderTurno = (id) => api.post(`/turnos/${id}/atender`)

// programado | confirmado -> cancelado (libera el horario)
export const cancelarTurno = (id) => api.post(`/turnos/${id}/cancelar`)

// ---------- Lista de espera / standby (HU 1.3) ----------

// Cola de entreturnos. params opcionales: { profesionalId, fecha }. Cada item trae su `posicion`.
export const getListaEspera = (params) => api.get('/turnos/espera', { params })

// { profesionalId, pacienteId, fecha } — solo si la agenda de ese día está completa.
// Si alguien cancela, el backend asigna el horario al primero de la cola.
export const agregarAListaEspera = (datos) => api.post('/turnos/espera', datos)

// Canal SSE para recepción: avisa cuando un paciente de la lista de espera recibe un horario
export const urlAlertasRecepcionStream = () => `${api.defaults.baseURL}/turnos/espera/alertas/stream`
