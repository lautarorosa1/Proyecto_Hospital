// Helpers, catálogos y validaciones de la pantalla de guardia.

// Deben coincidir con domain/NivelTriaje.ts del backend. El orden es el de prioridad.
export const NIVELES_TRIAJE = [
  {
    value: 'rojo',
    label: 'Riesgo Vital',
    codigo: 'Código Rojo',
    clase: 'bg-red-600 text-white ring-red-700',
    seleccion: 'border-red-500 bg-red-50 ring-2 ring-red-200'
  },
  {
    value: 'naranja',
    label: 'Emergencia',
    codigo: 'Naranja',
    clase: 'bg-orange-100 text-orange-800 ring-orange-300',
    seleccion: 'border-orange-400 bg-orange-50 ring-2 ring-orange-200'
  },
  {
    value: 'amarillo',
    label: 'Urgencia',
    codigo: 'Amarillo',
    clase: 'bg-yellow-100 text-yellow-800 ring-yellow-300',
    seleccion: 'border-yellow-400 bg-yellow-50 ring-2 ring-yellow-200'
  },
  {
    value: 'verde',
    label: 'Urgencia menor',
    codigo: 'Verde',
    clase: 'bg-green-100 text-green-800 ring-green-300',
    seleccion: 'border-green-400 bg-green-50 ring-2 ring-green-200'
  },
  {
    value: 'azul',
    label: 'No urgente',
    codigo: 'Azul',
    clase: 'bg-blue-100 text-blue-800 ring-blue-300',
    seleccion: 'border-blue-400 bg-blue-50 ring-2 ring-blue-200'
  }
]

export const MOTIVO_MAX = 500
export const OBSERVACIONES_MAX = 2000

export const etiquetaNivel = (value) => NIVELES_TRIAJE.find((n) => n.value === value)?.label ?? value

export const claseNivel = (value) =>
  NIVELES_TRIAJE.find((n) => n.value === value)?.clase ?? 'bg-gray-100 text-gray-600 ring-gray-200'

export const ingresoVacio = () => ({
  pacienteId: null,
  enfermeroId: '',
  nivelTriaje: '',
  motivoConsulta: '',
  observaciones: ''
})

export const erroresIngresoVacios = () => ({
  pacienteId: '',
  enfermeroId: '',
  nivelTriaje: '',
  motivoConsulta: '',
  observaciones: ''
})

// Completa `errores` y devuelve true si el formulario es válido.
// Las reglas que dependen de los datos (enfermero activo, paciente ya en guardia)
// las valida el backend y se muestran como error del formulario.
export const validarIngreso = (datos, errores) => {
  Object.assign(errores, erroresIngresoVacios())
  let valido = true

  if (datos.pacienteId === null) {
    errores.pacienteId = 'Seleccione un paciente'
    valido = false
  }

  if (datos.enfermeroId === '' || datos.enfermeroId === null) {
    errores.enfermeroId = 'Seleccione el enfermero que realiza el triaje'
    valido = false
  }

  if (!datos.nivelTriaje) {
    errores.nivelTriaje = 'Asigne un nivel de triaje'
    valido = false
  }

  const motivo = datos.motivoConsulta.trim()
  if (!motivo) {
    errores.motivoConsulta = 'El motivo de consulta es obligatorio'
    valido = false
  } else if (motivo.length > MOTIVO_MAX) {
    errores.motivoConsulta = `No puede superar los ${MOTIVO_MAX} caracteres`
    valido = false
  }

  if (datos.observaciones.trim().length > OBSERVACIONES_MAX) {
    errores.observaciones = `No puede superar los ${OBSERVACIONES_MAX} caracteres`
    valido = false
  }

  return valido
}

// "HH:mm" local a partir de un instante ISO
export const formatearHora = (iso) =>
  new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })

// Aviso de éxito tras registrar un ingreso: { ingreso, desplazados, medicosAlertados }
export const mensajeRegistro = ({ ingreso, desplazados, medicosAlertados }) => {
  let texto = `Paciente registrado como ${etiquetaNivel(ingreso.nivelTriaje)}: posición ${ingreso.posicion} en la cola.`
  if (desplazados > 0) {
    texto += ` Pasa delante de ${desplazados} paciente${desplazados === 1 ? '' : 's'} de menor riesgo.`
  }
  if (ingreso.nivelTriaje === 'rojo') {
    texto += medicosAlertados.length
      ? ` Alerta enviada a ${medicosAlertados.length} médico${medicosAlertados.length === 1 ? '' : 's'}.`
      : ' No había médicos activos para alertar.'
  }
  return texto
}
