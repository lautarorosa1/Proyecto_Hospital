
import { AppDataSource } from '../../data-source';

import { PacienteEntity } from '../admision/pacientes/infrastructure/PacienteEntity';
import { PacienteRepository } from '../admision/pacientes/infrastructure/PacienteRepository';

import { AlergiaEntity } from './infrastructure/AlergiaEntity';
import { AlergiaRepository } from './infrastructure/AlergiaRepository';
import { AlergiaService } from './application/AlergiaService';
import { AlergiaController } from './adapters/AlergiaController';
import { createAlergiaRoutes } from './adapters/alergiaRoutes';


import { AntecedenteFamiliarEntity } from './infrastructure/AntecedenteFamiliarEntity';
import { AntecedenteFamiliarRepository } from './infrastructure/AntecedenteFamiliarRepository';
import { AntecedenteFamiliarService } from './application/AntecedenteFamiliarService';
import { AntecedenteFamiliarController } from './adapters/AntecedenteFamiliarController';
import { createAntecedenteFamiliarRoutes } from './adapters/antecedenteFamiliarRoutes';

// Evoluciones médicas
import { EvolucionMedicaEntity } from './infrastructure/EvolucionMedicaEntity';
import { EvolucionMedicaRepository } from './infrastructure/EvolucionMedicaRepository';
import { EvolucionMedicaService } from './application/EvolucionMedicaService';
import { EvolucionMedicaController } from './adapters/EvolucionMedicaController';
import { createEvolucionMedicaRoutes } from './adapters/evolucionMedicaRoutes';

// Estudios médicos
import { EstudioMedicoEntity } from './infrastructure/EstudioMedicoEntity';
import { EstudioMedicoRepository } from './infrastructure/EstudioMedicoRepository';
import { EstudioMedicoService } from './application/EstudioMedicoService';
import { EstudioMedicoController } from './adapters/EstudioMedicoController';
import { createEstudioMedicoRoutes } from './adapters/estudioMedicoRoutes';

// Eventos clínicos
import { EventoClinicoEntity } from './infrastructure/EventoClinicoEntity';
import { EventoClinicoRepository } from './infrastructure/EventoClinicoRepository';
import { EventoClinicoService } from './application/EventoClinicoService';
import { EventoClinicoController } from './adapters/EventoClinicoController';
import { createEventoClinicoRoutes } from './adapters/eventoClinicoRoutes';

import type { IEventBus } from '../../shared/domain/events/IEventBus';
import { DomainEvents } from '../../shared/domain/events/DomainEvents';

// Repositorio de pacientes
const pacienteRepository = new PacienteRepository(
  AppDataSource.getRepository(PacienteEntity)
);

// Alergias
const alergiaRepository = new AlergiaRepository(
  AppDataSource.getRepository(AlergiaEntity)
);
const alergiaService = new AlergiaService(
  alergiaRepository,
  pacienteRepository
);
const alergiaController = new AlergiaController(alergiaService);

// Antecedentes familiares
const antecedenteFamiliarRepository = new AntecedenteFamiliarRepository(
  AppDataSource.getRepository(AntecedenteFamiliarEntity)
);
const antecedenteFamiliarService = new AntecedenteFamiliarService(
  antecedenteFamiliarRepository,
  pacienteRepository
);
const antecedenteFamiliarController = new AntecedenteFamiliarController(
  antecedenteFamiliarService
);

// Evoluciones médicas
const evolucionMedicaRepository = new EvolucionMedicaRepository(
  AppDataSource.getRepository(EvolucionMedicaEntity)
);
const evolucionMedicaService = new EvolucionMedicaService(
  evolucionMedicaRepository,
  pacienteRepository
);
const evolucionMedicaController = new EvolucionMedicaController(
  evolucionMedicaService
);

// Estudios médicos
const estudioMedicoRepository = new EstudioMedicoRepository(
  AppDataSource.getRepository(EstudioMedicoEntity)
);
const estudioMedicoService = new EstudioMedicoService(
  estudioMedicoRepository,
  pacienteRepository
);
const estudioMedicoController = new EstudioMedicoController(
  estudioMedicoService
);

// Línea de tiempo clínica (eventos de Admisión y Enfermería)
const eventoClinicoRepository = new EventoClinicoRepository(
  AppDataSource.getRepository(EventoClinicoEntity)
);
const eventoClinicoService = new EventoClinicoService(
  eventoClinicoRepository,
  pacienteRepository
);
const eventoClinicoController = new EventoClinicoController(
  eventoClinicoService
);

/**
 * La HCE recibe los hechos clínicos de los demás módulos:
 * - PACIENTE_INGRESADO (Admisión)
 * - PACIENTE_DADO_DE_ALTA (Enfermería)
 * - SIGNOS_VITALES_REGISTRADO (Enfermería)
 * - MEDICACION_ADMINISTRADA (Enfermería)
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
  // Alergias
  controller: alergiaController,
  routes: createAlergiaRoutes(alergiaController),
  alergiaService,
  eventoClinicoService,
  // Antecedentes familiares
  antecedenteFamiliarRoutes: createAntecedenteFamiliarRoutes(
    antecedenteFamiliarController
  ),

  // Evoluciones médicas
  evolucionMedicaRoutes: createEvolucionMedicaRoutes(
    evolucionMedicaController
  ),

  // Estudios médicos
  estudioMedicoRoutes: createEstudioMedicoRoutes(
    estudioMedicoController
  ),

  // Eventos clínicos (línea de tiempo)
  eventosRoutes: createEventoClinicoRoutes(
    eventoClinicoController
  ),
};
