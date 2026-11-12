
import { AppDataSource } from '../../data-source';

import { PacienteEntity } from '../admision/pacientes/infrastructure/PacienteEntity';
import { PacienteRepository } from '../admision/pacientes/infrastructure/PacienteRepository';

import { AlergiaEntity } from './infrastructure/AlergiaEntity';
import { AlergiaRepository } from './infrastructure/AlergiaRepository';
import { AlergiaService } from './application/AlergiaService';
import { AlergiaController } from './adapters/AlergiaController';
import { createAlergiaRoutes } from './adapters/alergiaRoutes';

import { EventoClinicoEntity } from './infrastructure/EventoClinicoEntity';
import { EventoClinicoRepository } from './infrastructure/EventoClinicoRepository';
import { EventoClinicoService } from './application/EventoClinicoService';
import { EventoClinicoController } from './adapters/EventoClinicoController';
import { createEventoClinicoRoutes } from './adapters/eventoClinicoRoutes';
import type { IEventBus } from '../../shared/domain/events/IEventBus';
import { DomainEvents } from '../../shared/domain/events/DomainEvents';

// Repositorio de alergias
const alergiaRepository = new AlergiaRepository(
  AppDataSource.getRepository(AlergiaEntity)
);

// Repositorio de pacientes (para verificar su existencia)
const pacienteRepository = new PacienteRepository(
  AppDataSource.getRepository(PacienteEntity)
);

// Servicio de alergias
const alergiaService = new AlergiaService(
  alergiaRepository,
  pacienteRepository
);

// Controlador de alergias
const alergiaController = new AlergiaController(alergiaService);

// Línea de tiempo clínica (eventos de Admisión y Enfermería)
const eventoClinicoRepository = new EventoClinicoRepository(
  AppDataSource.getRepository(EventoClinicoEntity)
);
const eventoClinicoService = new EventoClinicoService(
  eventoClinicoRepository,
  pacienteRepository
);
const eventoClinicoController = new EventoClinicoController(eventoClinicoService);

/**
 * La HCE recibe los hechos clínicos de los demás módulos:
 *  - PACIENTE_INGRESADO (Admisión), PACIENTE_DADO_DE_ALTA, SIGNOS_VITALES_REGISTRADO
 *    y MEDICACION_ADMINISTRADA (Enfermería).
 */
export function suscribirHistoriaClinica(bus: IEventBus): void {
  bus.subscribe(DomainEvents.PACIENTE_INGRESADO, async (e) => {
    await eventoClinicoService.registrar({
      pacienteId: e.pacienteId,
      tipo: 'INGRESO',
      resumen: `Ingreso a internación (${e.tipoIngreso}): ${e.motivoIngreso}${
        e.diagnosticoInicial ? `. Diagnóstico inicial: ${e.diagnosticoInicial}` : ''
      }`,
      alerta: false,
      fecha: e.timestamp,
    });
  });

  bus.subscribe(DomainEvents.SIGNOS_VITALES_REGISTRADO, async (e) => {
    await eventoClinicoService.registrar({
      pacienteId: e.pacienteId,
      tipo: 'SIGNOS_VITALES',
      resumen:
        `T ${e.temperatura} °C, FC ${e.frecuenciaCardiaca} lpm, FR ${e.frecuenciaRespiratoria} rpm, ` +
        `TA ${e.presionSistolica}/${e.presionDiastolica} mmHg, SatO2 ${e.saturacionOxigeno}%`,
      referenciaId: e.signosVitalesId,
      alerta: e.alerta,
      fecha: e.timestamp,
    });
  });

  bus.subscribe(DomainEvents.MEDICACION_ADMINISTRADA, async (e) => {
    await eventoClinicoService.registrar({
      pacienteId: e.pacienteId,
      tipo: 'MEDICACION_ADMINISTRADA',
      resumen: `Dosis administrada (indicación ${e.medicacionId}) por el enfermero ${e.enfermeroId}`,
      referenciaId: e.administracionId,
      alerta: false,
      fecha: e.timestamp,
    });
  });

  bus.subscribe(DomainEvents.PACIENTE_DADO_DE_ALTA, async (e) => {
    await eventoClinicoService.registrar({
      pacienteId: e.pacienteId,
      tipo: 'ALTA',
      resumen: `Alta médica de la internación ${e.internacionId}`,
      referenciaId: e.internacionId,
      alerta: false,
      fecha: e.timestamp,
    });
  });
}

// Módulo de Historia Clínica
export const historiaClinicaModule = {
  controller: alergiaController,
  routes: createAlergiaRoutes(alergiaController),
  alergiaService,
  eventoClinicoService,
  eventosRoutes: createEventoClinicoRoutes(eventoClinicoController),
};