import type { Protocolo } from './Protocolos';

export class ProtocoloBuilder {

  private nombre: string = '';
  private descripcion: string = '';
  private pasos: string[] = [];

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
      pasos: [...this.pasos]
    };
  }
}