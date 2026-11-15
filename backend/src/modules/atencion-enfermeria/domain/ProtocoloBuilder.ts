import type { Protocolo } from './Protocolos';
import type { TipoIngreso } from '../../../shared/domain/events/DomainEvents';

/**
 * Patrón Builder: ensambla paso a paso el "plan de cuidados" de un ingreso.
 * Las tareas iniciales cambian según el motivo de ingreso, por eso cada tipo
 * tiene su Builder concreto y el ProtocoloDirector decide cuál usar.
 */
export interface IProtocoloBuilder {
  setNombre(nombre: string): this;
  setDescripcion(descripcion: string): this;
  agregarPaso(paso: string): this;
  build(): Omit<Protocolo, 'id'>;
}

/** Builder genérico: se usa tal cual para protocolos manuales (CrearProtocolo). */
export class ProtocoloBuilder implements IProtocoloBuilder {

  protected nombre: string = '';
  protected descripcion: string = '';
  protected pasos: string[] = [];
  protected internacionId?: number;

  setNombre(nombre: string): this {
    this.nombre = nombre;
    return this;
  }

  setDescripcion(descripcion: string): this {
    this.descripcion = descripcion;
    return this;
  }

  agregarPaso(paso: string): this {
    this.pasos.push(paso);
    return this;
  }

  /** Vincula el protocolo con la internación para la que se genera. */
  setInternacion(internacionId: number): this {
    this.internacionId = internacionId;
    return this;
  }

  build(): Omit<Protocolo, 'id'> {

    if (!this.nombre.trim()) {
      throw new Error('El protocolo debe tener un nombre');
    }

    if (!this.descripcion.trim()) {
      throw new Error('El protocolo debe tener una descripción');
    }

    if (this.pasos.length === 0) {
      throw new Error('El protocolo debe tener al menos un paso');
    }

    return {
      nombre: this.nombre,
      descripcion: this.descripcion,
      pasos: [...this.pasos],
      ...(this.internacionId !== undefined
        ? { internacionId: this.internacionId }
        : {}),
    };
  }
}

/** Ingreso pre-quirúrgico (cirugía programada). */
export class PreOpProtocolBuilder extends ProtocoloBuilder {
  constructor() {
    super();
    this.setNombre('Protocolo de ingreso pre-quirúrgico')
      .setDescripcion('Preparación del paciente internado para una cirugía programada.')
      .agregarPaso('Verificar ayuno de 8 horas')
      .agregarPaso('Colocar vía intravenosa periférica')
      .agregarPaso('Realizar control de signos vitales cada 2 horas');
  }
}

/** Ingreso por infección respiratoria (p. ej. neumonía). */
export class RespiratoryProtocolBuilder extends ProtocoloBuilder {
  constructor() {
    super();
    this.setNombre('Protocolo de ingreso por infección respiratoria')
      .setDescripcion('Cuidados iniciales de un paciente con infección respiratoria.')
      .agregarPaso('Monitoreo de saturación de oxígeno continuo')
      .agregarPaso('Indicación de aislamiento de contacto y gotas');
  }
}

/** Ingreso sin un protocolo específico: control básico de enfermería. */
export class GeneralProtocolBuilder extends ProtocoloBuilder {
  constructor() {
    super();
    this.setNombre('Protocolo de ingreso general')
      .setDescripcion('Cuidados básicos de enfermería al ingresar un paciente.')
      .agregarPaso('Realizar control de signos vitales cada 8 horas')
      .agregarPaso('Registrar nota de ingreso de enfermería');
  }
}

/** Director: elige y ejecuta el Builder que corresponde al tipo de ingreso. */
export class ProtocoloDirector {
  private crearBuilder(tipoIngreso: TipoIngreso): ProtocoloBuilder {
    switch (tipoIngreso) {
      case 'CIRUGIA_PROGRAMADA':
        return new PreOpProtocolBuilder();
      case 'INFECCION_RESPIRATORIA':
        return new RespiratoryProtocolBuilder();
      default:
        return new GeneralProtocolBuilder();
    }
  }

  construir(tipoIngreso: TipoIngreso, internacionId?: number): Omit<Protocolo, 'id'> {
    const builder = this.crearBuilder(tipoIngreso);
    if (internacionId !== undefined) builder.setInternacion(internacionId);
    return builder.build();
  }
}
