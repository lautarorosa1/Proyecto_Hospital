import api from '@/shared/services/api'

// Confirmar la administración de una dosis prescrita.
// { medicacionId, enfermeroId, programadaPara (ISO), administradaEn? (ISO) }
// Reglas del backend: ±30 min del horario programado, una sola vez por dosis, y si la
// medicación tiene insumo asociado se descuenta del stock del piso.
export const administrarDosis = async (datos) => {
  const respuesta = await api.post('/atencion-enfermeria/administraciones', datos)

  return respuesta.data
}

// Dosis administradas de una internación
export const listarAdministracionesPorInternacion = async (internacionId) => {
  const respuesta = await api.get(
    `/atencion-enfermeria/administraciones/internacion/${internacionId}`
  )

  return respuesta.data
}
