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

// Mensaje legible a partir de un error de axios. El backend responde { error } en la
// mayoría de los módulos y { mensaje } en Atención y Enfermería.
export const mensajeError = (error, porDefecto = 'Ocurrió un error inesperado') => {
  if (!error.response) return 'No se pudo conectar con el servidor'
  return error.response.data?.error || error.response.data?.mensaje || porDefecto
}

// Id de usuario que el backend registra en el historial (camas, altas). El login devuelve
// el usuario de IAM; si su id no es numérico se usa el de sistema (1), como hacían las vistas.
export const usuarioIdActual = () => {
  try {
    const id = Number(JSON.parse(localStorage.getItem('usuario') || 'null')?.id)
    return Number.isInteger(id) && id > 0 ? id : 1
  } catch {
    return 1
  }
}
