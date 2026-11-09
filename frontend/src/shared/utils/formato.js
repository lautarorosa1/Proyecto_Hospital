// Helpers de presentación y de errores compartidos entre submódulos
// (turnos, guardia, etc.), para que ninguno dependa de las utils de otro.

export const nombreProfesional = (profesional) =>
  profesional ? `${profesional.apellido}, ${profesional.nombre}` : '—'

export const nombrePaciente = (paciente) =>
  paciente ? `${paciente.apellido}, ${paciente.nombre}` : '—'

// Nombre a partir del mapa id -> paciente. El listado solo trae pacientes activos,
// así que los dados de baja que aún figuran en turnos o ingresos se muestran por id.
export const nombrePacienteDe = (pacientesPorId, id) => {
  const p = pacientesPorId[id]
  return p ? `${p.apellido}, ${p.nombre}` : `Paciente #${id}`
}

// Mensaje legible a partir de un error de axios ({ error: "mensaje" } del backend)
export const mensajeError = (error, porDefecto = 'Ocurrió un error inesperado') => {
  if (!error.response) return 'No se pudo conectar con el servidor'
  return error.response.data?.error || porDefecto
}
