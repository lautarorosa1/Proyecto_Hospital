// Validaciones y manejo de errores compartidos por Create y Edit.
// Las reglas replican las del backend (PacienteService).

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const dniRegex = /^\d{7,9}$/

// "YYYY-MM-DD" en hora local (lo que devuelve y espera <input type="date">)
export const hoyISO = () => new Date().toLocaleDateString('en-CA')

export const erroresVacios = () => ({
  nombre: '',
  apellido: '',
  dni: '',
  email: '',
  fechaNacimiento: ''
})

// Completa `errores` y devuelve true si el formulario es válido
export const validarPaciente = (paciente, errores) => {
  Object.assign(errores, erroresVacios())
  let valido = true

  if (!paciente.nombre.trim()) {
    errores.nombre = 'El nombre es obligatorio'
    valido = false
  }

  if (!paciente.apellido.trim()) {
    errores.apellido = 'El apellido es obligatorio'
    valido = false
  }

  if (!paciente.dni.trim()) {
    errores.dni = 'El DNI es obligatorio'
    valido = false
  } else if (!dniRegex.test(paciente.dni.trim())) {
    errores.dni = 'Ingrese de 7 a 9 dígitos, sin puntos'
    valido = false
  }

  if (!paciente.email.trim()) {
    errores.email = 'El email es obligatorio'
    valido = false
  } else if (!emailRegex.test(paciente.email.trim())) {
    errores.email = 'Ingrese un email válido'
    valido = false
  }

  if (!paciente.fechaNacimiento) {
    errores.fechaNacimiento = 'La fecha de nacimiento es obligatoria'
    valido = false
  } else if (paciente.fechaNacimiento > hoyISO()) {
    errores.fechaNacimiento = 'La fecha no puede ser futura'
    valido = false
  }

  return valido
}

// Traduce el error del backend ({ error: "mensaje" }).
// Marca el campo correspondiente si puede, y devuelve un mensaje general
// para lo que no pertenece a ningún campo.
export const procesarErrorServidor = (error, errores) => {
  if (!error.response) return 'No se pudo conectar con el servidor'

  const mensaje = error.response.data?.error || 'Ocurrió un error inesperado'

  if (error.response.status === 409) {
    if (mensaje.includes('DNI')) errores.dni = mensaje
    else if (mensaje.includes('email')) errores.email = mensaje
    else return mensaje
    return ''
  }

  return mensaje
}