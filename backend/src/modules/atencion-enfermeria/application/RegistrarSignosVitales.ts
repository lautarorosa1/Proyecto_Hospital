
import type { SignosVitales } from '../domain/SignosVitales';
import { requiereAlertaTemperatura } from '../domain/SignosVitales';
import type { ISignosVitalesRepository } from '../domain/SignosVitalesRepository';
import type { IInternacionRepository } from '../domain/InternacionRepository';
import type { INotaEnfermeriaRepository } from '../domain/NotaEnfermeriaRepository';
import type {
  IEventosEnfermeria,
  IUbicacionInternacion,
} from '../domain/IEventosEnfermeria';
import { ConflictError, NotFoundError } from '../../../shared/errors';

/**
 * Colaboradores para integrar el registro con el resto del sistema. Sin ellos
 * el caso de uso solo valida y persiste (útil para pruebas aisladas).
 */
export interface DependenciasSignosVitales {
  internaciones: IInternacionRepository;
  notas: INotaEnfermeriaRepository;
  eventos: IEventosEnfermeria;
  ubicacion?: IUbicacionInternacion;
}

export class RegistrarSignosVitales {
  constructor(
    private readonly repositorio: ISignosVitalesRepository,
    private readonly dependencias?: DependenciasSignosVitales
  ) {}

  async ejecutar(
    datos: Omit<SignosVitales, 'id'>
  ): Promise<SignosVitales> {

    // Validar ID de internación
    if (!Number.isInteger(datos.internacionId) || datos.internacionId <= 0) {
      throw new Error('El ID de la internación debe ser positivo.');
    }

    // Validar ID del profesional
    if (!Number.isInteger(datos.profesionalId) || datos.profesionalId <= 0) {
      throw new Error('El ID del profesional debe ser positivo.');
    }

    // Validar fecha y hora
    if (!datos.fechaHora || isNaN(Date.parse(datos.fechaHora))) {
      throw new Error('La fecha y hora deben ser válidas.');
    }

    // Validar temperatura
    if (!Number.isFinite(datos.temperatura) || datos.temperatura <= 0) {
      throw new Error('La temperatura debe ser positiva.');
    }

    // Validar frecuencia cardíaca
    if (!Number.isFinite(datos.frecuenciaCardiaca) || datos.frecuenciaCardiaca <= 0) {
      throw new Error('La frecuencia cardíaca debe ser positiva.');
    }

    // Validar frecuencia respiratoria
    if (!Number.isFinite(datos.frecuenciaRespiratoria) || datos.frecuenciaRespiratoria <= 0) {
      throw new Error('La frecuencia respiratoria debe ser positiva.');
    }

    // Validar presión arterial
    if (
      !Number.isFinite(datos.presionSistolica) ||
      !Number.isFinite(datos.presionDiastolica) ||
      datos.presionSistolica <= 0 ||
      datos.presionDiastolica <= 0
    ) {
      throw new Error('La presión arterial debe ser positiva.');
    }

    // Validar saturación de oxígeno
    if (
      !Number.isFinite(datos.saturacionOxigeno) ||
      datos.saturacionOxigeno < 0 ||
      datos.saturacionOxigeno > 100
    ) {
      throw new Error('La saturación de oxígeno debe estar entre 0 y 100.');
    }

    const alerta = requiereAlertaTemperatura(datos.temperatura);
    const deps = this.dependencias;

    if (!deps) {
      return await this.repositorio.create({ ...datos, alerta });
    }

    const internacion = await deps.internaciones.findById(datos.internacionId);
    if (!internacion) {
      throw new NotFoundError('No se encontró la internación.');
    }
    if (internacion.estado !== 'ACTIVA') {
      throw new ConflictError('La internación del paciente ya está finalizada.');
    }

    // Se guarda el registro; con temperatura > 39 °C queda marcado como alerta
    // (el front lo destaca en rojo).
    const registro = await this.repositorio.create({ ...datos, alerta });

    const resumen =
      `T ${datos.temperatura} °C, FC ${datos.frecuenciaCardiaca} lpm, ` +
      `FR ${datos.frecuenciaRespiratoria} rpm, ` +
      `TA ${datos.presionSistolica}/${datos.presionDiastolica} mmHg, ` +
      `SatO2 ${datos.saturacionOxigeno}%`;

    // Nota de enfermería automática (un fallo acá no invalida el registro clínico).
    try {
      await deps.notas.create({
        fecha: new Date(),
        pacienteId: internacion.pacienteId,
        profesionalId: datos.profesionalId,
        contenido: alerta
          ? `ALERTA: temperatura de ${datos.temperatura} °C supera el umbral de 39 °C. ` +
            `Se notificó al médico de guardia. Controles: ${resumen}.`
          : `Controles de signos vitales realizados con éxito: ${resumen}.`,
      });
    } catch (error) {
      console.error('[Enfermería] No se pudo crear la nota automática', error);
    }

    const timestamp = new Date(datos.fechaHora);
    deps.eventos.signosVitalesRegistrados({
      signosVitalesId: registro.id,
      internacionId: internacion.id,
      pacienteId: internacion.pacienteId,
      enfermeroId: datos.profesionalId,
      temperatura: datos.temperatura,
      frecuenciaCardiaca: datos.frecuenciaCardiaca,
      frecuenciaRespiratoria: datos.frecuenciaRespiratoria,
      presionSistolica: datos.presionSistolica,
      presionDiastolica: datos.presionDiastolica,
      saturacionOxigeno: datos.saturacionOxigeno,
      alerta,
      timestamp,
    });

    if (alerta) {
      let sector: string | undefined;
      if (internacion.camaId !== undefined && deps.ubicacion) {
        try {
          sector = (await deps.ubicacion.sectorDeCama(internacion.camaId)) ?? undefined;
        } catch (error) {
          console.error('[Enfermería] No se pudo resolver el sector del paciente', error);
        }
      }

      // Notificación de alta prioridad al médico de guardia del sector.
      deps.eventos.signosVitalesAlerta({
        signosVitalesId: registro.id,
        pacienteId: internacion.pacienteId,
        internacionId: internacion.id,
        temperatura: datos.temperatura,
        enfermeroId: datos.profesionalId,
        camaId: internacion.camaId,
        sector,
        severidad: 'alta',
        timestamp,
      });
    }

    return registro;
  }
}