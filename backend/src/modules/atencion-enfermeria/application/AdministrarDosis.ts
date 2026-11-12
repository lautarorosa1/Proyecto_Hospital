import type { AdministracionMedicacion } from '../domain/AdministracionMedicacion';
import { dentroDelMargen, MARGEN_ADMINISTRACION_MIN } from '../domain/AdministracionMedicacion';
import type { IAdministracionesRepository } from '../domain/AdministracionesRepository';
import type { IMedicacionesRepository } from '../domain/MedicacionesRepository';
import type { IInternacionRepository } from '../domain/InternacionRepository';
import type { IEventosEnfermeria } from '../domain/IEventosEnfermeria';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../../../shared/errors';

export interface AdministrarDosisDto {
  medicacionId: number;
  /** Enfermero que aplica la dosis (queda vinculado al registro). */
  enfermeroId: number;
  /** Horario de la indicación que se está cumpliendo (ISO). */
  programadaPara: string;
  /** Momento real de la administración (ISO). Default: ahora. */
  administradaEn?: string;
}

/**
 * Confirma la administración de una dosis prescrita (Enfermería → Recursos).
 * Valida la ventana de ±30 min, evita doble registro y, si la medicación tiene
 * insumo asociado, publica MEDICACION_ADMINISTRADA para que Recursos y Camas
 * descuente el stock del piso de forma atómica.
 */
export class AdministrarDosis {
  constructor(
    private readonly medicaciones: IMedicacionesRepository,
    private readonly internaciones: IInternacionRepository,
    private readonly administraciones: IAdministracionesRepository,
    private readonly eventos: IEventosEnfermeria
  ) {}

  private exigirId(valor: unknown, campo: string): number {
    if (typeof valor !== 'number' || !Number.isInteger(valor) || valor <= 0) {
      throw new BadRequestError(`El ${campo} debe ser un entero positivo.`);
    }
    return valor;
  }

  private exigirFecha(valor: unknown, campo: string): Date {
    const fecha = typeof valor === 'string' ? new Date(valor) : null;
    if (!fecha || Number.isNaN(fecha.getTime())) {
      throw new BadRequestError(`${campo} debe ser una fecha y hora válida.`);
    }
    return fecha;
  }

  async ejecutar(dto: AdministrarDosisDto): Promise<AdministracionMedicacion> {
    if (!dto || typeof dto !== 'object') {
      throw new BadRequestError('Debe proporcionar los datos de la dosis.');
    }
    const medicacionId = this.exigirId(dto.medicacionId, 'ID de la medicación');
    const enfermeroId = this.exigirId(dto.enfermeroId, 'ID del enfermero');
    const programada = this.exigirFecha(dto.programadaPara, 'El horario programado');
    const administrada =
      dto.administradaEn === undefined
        ? new Date()
        : this.exigirFecha(dto.administradaEn, 'El horario de administración');

    const medicacion = await this.medicaciones.findById(medicacionId);
    if (!medicacion) throw new NotFoundError('No se encontró la medicación.');
    if (medicacion.estado !== 'ACTIVA') {
      throw new ConflictError('La indicación de medicación no está activa.');
    }
    if (medicacion.fechaFin && programada > new Date(`${medicacion.fechaFin}T23:59:59`)) {
      throw new ConflictError('El horario programado es posterior al fin de la indicación.');
    }

    const internacion = await this.internaciones.findById(medicacion.internacionId);
    if (!internacion) throw new NotFoundError('No se encontró la internación.');
    if (internacion.estado !== 'ACTIVA') {
      throw new ConflictError('La internación del paciente ya está finalizada.');
    }

    if (!dentroDelMargen(programada, administrada)) {
      throw new BadRequestError(
        `La dosis solo puede administrarse dentro de ±${MARGEN_ADMINISTRACION_MIN} minutos del horario programado.`
      );
    }

    if (await this.administraciones.existe(medicacionId, programada.toISOString())) {
      throw new ConflictError('Esa dosis ya fue registrada como administrada.');
    }

    const cantidad = medicacion.insumoId ? medicacion.cantidadInsumo ?? 1 : 0;

    // El índice único de la base cubre la carrera entre dos confirmaciones simultáneas.
    const administracion = await this.administraciones.create({
      medicacionId,
      internacionId: internacion.id,
      enfermeroId,
      programadaPara: programada.toISOString(),
      administradaEn: administrada.toISOString(),
      cantidadDescontada: cantidad,
    });

    if (medicacion.insumoId) {
      this.eventos.medicacionAdministrada({
        administracionId: administracion.id,
        medicacionId,
        internacionId: internacion.id,
        pacienteId: internacion.pacienteId,
        insumoId: medicacion.insumoId,
        cantidad,
        enfermeroId,
        timestamp: administrada,
      });
    }

    return administracion;
  }
}
