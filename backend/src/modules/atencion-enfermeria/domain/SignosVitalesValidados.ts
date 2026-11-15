import type { SignosVitales } from './SignosVitales';

export function validarSignosVitales(
  signos: Omit<SignosVitales, 'id'>
): string[] {
  const errores: string[] = [];

  // Validar internación
  if (
    !Number.isInteger(signos.internacionId) ||
    signos.internacionId <= 0
  ) {
    errores.push(
      'El ID de internación debe ser un entero positivo.'
    );
  }

  // Validar profesional
  if (
    !Number.isInteger(signos.profesionalId) ||
    signos.profesionalId <= 0
  ) {
    errores.push(
      'El ID del profesional debe ser un entero positivo.'
    );
  }

  // Validar fecha y hora
  if (
    !signos.fechaHora ||
    Number.isNaN(Date.parse(signos.fechaHora))
  ) {
    errores.push(
      'La fecha y hora deben ser válidas.'
    );
  }

  // Validar temperatura
  if (
    !Number.isFinite(signos.temperatura) ||
    signos.temperatura <= 0
  ) {
    errores.push(
      'La temperatura debe ser un número positivo.'
    );
  }

  // Validar frecuencia cardíaca
  if (
    !Number.isFinite(signos.frecuenciaCardiaca) ||
    signos.frecuenciaCardiaca <= 0
  ) {
    errores.push(
      'La frecuencia cardíaca debe ser positiva.'
    );
  }

  // Validar frecuencia respiratoria
  if (
    !Number.isFinite(signos.frecuenciaRespiratoria) ||
    signos.frecuenciaRespiratoria <= 0
  ) {
    errores.push(
      'La frecuencia respiratoria debe ser positiva.'
    );
  }

  // Validar presión sistólica
  if (
    !Number.isFinite(signos.presionSistolica) ||
    signos.presionSistolica <= 0
  ) {
    errores.push(
      'La presión sistólica debe ser positiva.'
    );
  }

  // Validar presión diastólica
  if (
    !Number.isFinite(signos.presionDiastolica) ||
    signos.presionDiastolica <= 0
  ) {
    errores.push(
      'La presión diastólica debe ser positiva.'
    );
  }

  // Validar saturación de oxígeno
  if (
    !Number.isFinite(signos.saturacionOxigeno) ||
    signos.saturacionOxigeno <= 0 ||
    signos.saturacionOxigeno > 100
  ) {
    errores.push(
      'La saturación de oxígeno debe ser mayor que 0 y no superar 100.'
    );
  }

  return errores;
}