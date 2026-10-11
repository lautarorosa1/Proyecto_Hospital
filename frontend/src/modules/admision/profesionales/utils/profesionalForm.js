// Validaciones, catálogos y manejo de errores compartidos por Create y Edit.
// Las reglas replican las del backend (ProfesionalService).

import { emailRegex, dniRegex } from '@/shared/utils/validators'

export const TIPOS_PROFESIONAL = [
  { value: 'medico', label: 'Médico' },
  { value: 'enfermero', label: 'Enfermero' },
  { value: 'kinesiologo', label: 'Kinesiólogo' },
  { value: 'psicologo', label: 'Psicólogo' },
  { value: 'bioquimico', label: 'Bioquímico' },
  { value: 'odontologo', label: 'Odontólogo' },
  { value: 'otro', label: 'Otro' }
]

export const ESTADOS_PROFESIONAL = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
  { value: 'licencia', label: 'Licencia' }
]

export const etiquetaTipo = (value) =>
  TIPOS_PROFESIONAL.find((t) => t.value === value)?.label ?? value

export const etiquetaEstado = (value) =>
  ESTADOS_PROFESIONAL.find((e) => e.value === value)?.label ?? value

export const claseEstado = (value) =>
  ({
    activo: 'bg-green-50 text-green-700 ring-green-200',
    inactivo: 'bg-gray-100 text-gray-600 ring-gray-200',
    licencia: 'bg-amber-50 text-amber-700 ring-amber-200'
  })[value] ?? 'bg-gray-100 text-gray-600 ring-gray-200'

export const profesionalVacio = () => ({
  nombre: '',
  apellido: '',
  dni: '',
  email: '',
  telefono: '',
  matricula: '',
  tipoProfesional: '',
  especialidadId: '',
  usuarioId: '',
  estado: 'activo'
})

export const erroresVacios = () => ({
  nombre: '',
  apellido: '',
  dni: '',
  email: '',
  matricula: '',
  tipoProfesional: '',
  especialidadId: '',
  usuarioId: ''
})

const esIdValido = (valor) => {
  const n = Number(valor)
  return valor !== '' && valor !== null && Number.isInteger(n) && n > 0
}

// Completa `errores` y devuelve true si el formulario es válido
export const validarProfesional = (profesional, errores) => {
  Object.assign(errores, erroresVacios())
  let valido = true

  if (!profesional.nombre.trim()) {
    errores.nombre = 'El nombre es obligatorio'
    valido = false
  }

  if (!profesional.apellido.trim()) {
    errores.apellido = 'El apellido es obligatorio'
    valido = false
  }

  if (!profesional.dni.trim()) {
    errores.dni = 'El DNI es obligatorio'
    valido = false
  } else if (!dniRegex.test(profesional.dni.trim())) {
    errores.dni = 'Ingrese de 7 a 9 dígitos, sin puntos'
    valido = false
  }

  if (!profesional.email.trim()) {
    errores.email = 'El email es obligatorio'
    valido = false
  } else if (!emailRegex.test(profesional.email.trim())) {
    errores.email = 'Ingrese un email válido'
    valido = false
  }

  if (!profesional.matricula.trim()) {
    errores.matricula = 'La matrícula es obligatoria'
    valido = false
  }

  if (!profesional.tipoProfesional) {
    errores.tipoProfesional = 'Seleccione un tipo de profesional'
    valido = false
  }

  if (!esIdValido(profesional.especialidadId)) {
    errores.especialidadId = 'Ingrese un ID de especialidad válido'
    valido = false
  }

  if (!esIdValido(profesional.usuarioId)) {
    errores.usuarioId = 'Ingrese un ID de usuario válido'
    valido = false
  }

  return valido
}

// Arma el cuerpo que espera el backend.
// - Al crear, el teléfono vacío no se envía.
// - Al editar, "" borra el dato (undefined lo dejaría como estaba) y se envía el estado.
export const armarPayload = (profesional, { edicion = false } = {}) => {
  const payload = {
    nombre: profesional.nombre.trim(),
    apellido: profesional.apellido.trim(),
    dni: profesional.dni.trim(),
    email: profesional.email.trim(),
    matricula: profesional.matricula.trim(),
    tipoProfesional: profesional.tipoProfesional,
    especialidadId: Number(profesional.especialidadId),
    usuarioId: Number(profesional.usuarioId)
  }

  if (edicion) {
    payload.telefono = profesional.telefono.trim()
    payload.estado = profesional.estado
  } else {
    payload.telefono = profesional.telefono.trim() || undefined
  }

  return payload
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
    else if (mensaje.includes('matrícula')) errores.matricula = mensaje
    else if (mensaje.includes('usuario')) errores.usuarioId = mensaje
    else return mensaje
    return ''
  }

  return mensaje
}
