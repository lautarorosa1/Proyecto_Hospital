import api from '@/shared/services/api'

// Admisión confirma el traslado de un paciente a internación / observación.
// { pacienteId, tipoIngreso?, motivoIngreso, diagnosticoInicial?, usuarioId? }
// tipoIngreso: CIRUGIA_PROGRAMADA | INFECCION_RESPIRATORIA | GENERAL (si falta, se infiere del diagnóstico).
//
// El backend responde 202: el ingreso queda confirmado y Enfermería crea la internación
// y arma el protocolo de cuidados de forma asíncrona (evento PACIENTE_INGRESADO).
export const confirmarIngreso = async (datos) => {
  const respuesta = await api.post('/ingresos-internacion', datos)

  return respuesta.data
}

export const TIPOS_INGRESO = [
  { valor: 'GENERAL', etiqueta: 'General' },
  { valor: 'CIRUGIA_PROGRAMADA', etiqueta: 'Cirugía programada (pre-quirúrgico)' },
  { valor: 'INFECCION_RESPIRATORIA', etiqueta: 'Infección respiratoria' }
]

export const etiquetaTipoIngreso = (valor) =>
  TIPOS_INGRESO.find((tipo) => tipo.valor === valor)?.etiqueta ?? 'General'
