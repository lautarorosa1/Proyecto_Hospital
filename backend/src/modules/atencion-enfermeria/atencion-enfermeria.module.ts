import { ProtocolosRepositoryPostgres } from './infrastructure/ProtocolosRepositoryPostgres';
import { NotaEnfermeriaRepositoryPostgres } from './infrastructure/NotaEnfermeriaRepositoryPostgres';
import { IndicacionesRepositoryPostgres } from './infrastructure/IndicacionesRepositoryPostgres';
import { InternacionRepositoryPostgres } from './infrastructure/InternacionRepositoryPostgres';
import { MedicacionesRepositoryPostgres } from './infrastructure/MedicacionesRepositoryPostgres';
import { SignosVitalesRepositoryPostgres } from './infrastructure/SignosVitalesRepositoryPostgres';
import { AdministracionesRepositoryPostgres } from './infrastructure/AdministracionesRepositoryPostgres';
import { EventosEnfermeriaBus } from './infrastructure/EventosEnfermeriaBus';
import { eventBus } from '../../shared/events';
import type { IEventBus } from '../../shared/domain/events/IEventBus';
import { DomainEvents } from '../../shared/domain/events/DomainEvents';
import type {
  IAlergiasPaciente,
  IUbicacionInternacion,
} from './domain/IEventosEnfermeria';
import { recursosCamasModule } from '../recursos-camas/recursos-camas.module';
import { historiaClinicaModule } from '../historia-clinica/historiaClinica.module';
import { GenerarProtocoloDeIngreso } from './application/protocolos/GenerarProtocoloDeIngreso';
import { FinalizarInternacion } from './application/FinalizarInternacion';
import { VincularCamaAInternacion } from './application/VincularCamaAInternacion';
import { AdministrarDosis } from './application/AdministrarDosis';
import { ConsultarAdministraciones } from './application/ConsultarAdministraciones';
import { AdministracionController } from './adapters/AdministracionController';
import { createAdministracionRoutes } from './adapters/administracionRoutes';

// Casos de uso de Protocolos
import { CrearProtocolo } from './application/protocolos/CrearProtocolo';
import { ConsultarProtocolos } from './application/protocolos/ConsultarProtocolos';
import { ActualizarProtocolo } from './application/protocolos/ActualizarProtocolo';
import { EliminarProtocolo } from './application/protocolos/EliminarProtocolo';

// Casos de uso de Notas
import { CrearNotaEnfermeria } from './application/notas/CrearNotaEnfermeria';
import { ConsultarNotasEnfermeria } from './application/notas/ConsultarNotasEnfermeria';
import { ActualizarNotaEnfermeria } from './application/notas/ActualizarNotaEnfermeria';
import { EliminarNotaEnfermeria } from './application/notas/EliminarNotaEnfermeria';

// Casos de uso de Indicaciones
import { RegistrarIndicacion } from './application/RegistrarIndicacion';
import { ConsultarIndicaciones } from './application/ConsultarIndicaciones';
import { ActualizarIndicacion } from './application/ActualizarIndicacion';

// Casos de uso de Internaciones
import { RegistrarInternacion } from './application/RegistrarInternacion';
import { ConsultarInternaciones } from './application/ConsultarInternaciones';

// Casos de uso de Medicaciones
import { RegistrarMedicacion } from './application/RegistrarMedicacion';
import { ConsultarMedicaciones } from './application/ConsultarMedicaciones';
import { ActualizarMedicacion } from './application/ActualizarMedicacion';

// Casos de uso de Signos Vitales
import { RegistrarSignosVitales } from './application/RegistrarSignosVitales';
import { ActualizarSignosVitales } from './application/ActualizarSignosVitales';
import { EliminarSignosVitales } from './application/EliminarSignosVitales';

// Controllers
import { ProtocoloController } from './adapters/ProtocoloController';
import { NotaEnfermeriaController } from './adapters/NotaEnfermeriaController';
import { IndicacionController } from './adapters/IndicacionController';
import { InternacionController } from './adapters/InternacionController';
import { MedicacionController } from './adapters/MedicacionController';
import { SignosVitalesController } from './adapters/SignosVitalesController';

// Rutas
import { createProtocoloRoutes } from './adapters/protocoloRoutes';
import { createNotaEnfermeriaRoutes } from './adapters/notaEnfermeriaRoutes';
import { createIndicacionRoutes } from './adapters/indicacionRoutes';
import { createInternacionRoutes } from './adapters/internacionRoutes';
import { createMedicacionRoutes } from './adapters/medicacionRoutes';
import { createSignosVitalesRoutes } from './adapters/signosVitalesRoutes';

// REPOSITORIOS
const protocoloRepository = new ProtocolosRepositoryPostgres();
const notaRepository = new NotaEnfermeriaRepositoryPostgres();
const indicacionesRepository = new IndicacionesRepositoryPostgres();
const internacionRepository = new InternacionRepositoryPostgres();
const medicacionesRepository = new MedicacionesRepositoryPostgres();
const signosVitalesRepository = new SignosVitalesRepositoryPostgres();
const administracionesRepository = new AdministracionesRepositoryPostgres();

// PUERTOS HACIA OTROS MÓDULOS
const eventos = new EventosEnfermeriaBus(eventBus);

// Recursos y Camas: sector donde está internado el paciente (para ubicar alertas)
const ubicacion: IUbicacionInternacion = {
  sectorDeCama: (camaId) => recursosCamasModule.camaService.obtenerSector(camaId),
};

// Historia Clínica: alergias registradas del paciente
const normalizar = (texto: string) =>
  texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

const alergias: IAlergiasPaciente = {
  async alergiaA(pacienteId, medicamento) {
    const registradas = await historiaClinicaModule.alergiaService.obtenerPorPaciente(pacienteId);
    const medicamentoNorm = normalizar(medicamento);
    const coincidente = registradas.find((alergia) => {
      const alergeno = normalizar(alergia.alergeno);
      return alergeno !== '' && (medicamentoNorm.includes(alergeno) || alergeno.includes(medicamentoNorm));
    });
    return coincidente ? coincidente.alergeno : null;
  },
};

// CASOS DE USO DE PROTOCOLOS
const crearProtocolo = new CrearProtocolo(protocoloRepository);
const consultarProtocolos = new ConsultarProtocolos(protocoloRepository);
const actualizarProtocolo = new ActualizarProtocolo(protocoloRepository);
const eliminarProtocolo = new EliminarProtocolo(protocoloRepository);

// CASOS DE USO DE NOTAS
const crearNota = new CrearNotaEnfermeria(notaRepository);
const consultarNotas = new ConsultarNotasEnfermeria(notaRepository);
const actualizarNota = new ActualizarNotaEnfermeria(notaRepository);
const eliminarNota = new EliminarNotaEnfermeria(notaRepository);

// CASOS DE USO DE INDICACIONES
const registrarIndicacion = new RegistrarIndicacion(indicacionesRepository);
const consultarIndicaciones = new ConsultarIndicaciones(indicacionesRepository);
const actualizarIndicacion = new ActualizarIndicacion(indicacionesRepository);

// CASOS DE USO DE INTERNACIONES
const generarProtocoloDeIngreso = new GenerarProtocoloDeIngreso(protocoloRepository);
const registrarInternacion = new RegistrarInternacion(internacionRepository, {
  generarProtocolo: generarProtocoloDeIngreso,
  eventos,
});
const consultarInternaciones = new ConsultarInternaciones(internacionRepository);
const finalizarInternacion = new FinalizarInternacion(internacionRepository, eventos);
const vincularCamaAInternacion = new VincularCamaAInternacion(internacionRepository);

// CASOS DE USO DE MEDICACIONES
const registrarMedicacion = new RegistrarMedicacion(medicacionesRepository, {
  internaciones: internacionRepository,
  alergias,
});
const consultarMedicaciones = new ConsultarMedicaciones(medicacionesRepository);
const actualizarMedicacion = new ActualizarMedicacion(medicacionesRepository);

// CASOS DE USO DE SIGNOS VITALES
const registrarSignosVitales = new RegistrarSignosVitales(signosVitalesRepository, {
  internaciones: internacionRepository,
  notas: notaRepository,
  eventos,
  ubicacion,
});
const actualizarSignosVitales = new ActualizarSignosVitales(signosVitalesRepository);
const eliminarSignosVitales = new EliminarSignosVitales(signosVitalesRepository);

// CASOS DE USO DE ADMINISTRACIÓN DE DOSIS
const administrarDosis = new AdministrarDosis(
  medicacionesRepository,
  internacionRepository,
  administracionesRepository,
  eventos
);
const consultarAdministraciones = new ConsultarAdministraciones(administracionesRepository);

// CONTROLLERS
const protocoloController = new ProtocoloController(
  crearProtocolo,
  consultarProtocolos,
  actualizarProtocolo,
  eliminarProtocolo
);

const notaController = new NotaEnfermeriaController(
  crearNota,
  consultarNotas,
  actualizarNota,
  eliminarNota
);

const indicacionController = new IndicacionController(
  registrarIndicacion,
  consultarIndicaciones,
  actualizarIndicacion
);

const internacionController = new InternacionController(
  registrarInternacion,
  consultarInternaciones,
  finalizarInternacion
);

const administracionController = new AdministracionController(
  administrarDosis,
  consultarAdministraciones
);

const medicacionController = new MedicacionController(
  registrarMedicacion,
  consultarMedicaciones,
  actualizarMedicacion
);

const signosVitalesController = new SignosVitalesController(
  registrarSignosVitales,
  signosVitalesRepository,
  actualizarSignosVitales,
  eliminarSignosVitales
);

/**
 * Reacciona a los eventos de otros módulos:
 *  - PACIENTE_INGRESADO (Admisión): crea la internación y arma el protocolo de
 *    cuidados con el Builder que corresponde al tipo de ingreso.
 *  - CAMA_ASIGNADA (Recursos y Camas): guarda la cama en la internación activa.
 */
export function suscribirEnfermeria(bus: IEventBus): void {
  bus.subscribe(DomainEvents.PACIENTE_INGRESADO, async (e) => {
    await registrarInternacion.ejecutar({
      pacienteId: e.pacienteId,
      fechaIngreso: e.timestamp.toISOString().split('T')[0],
      motivoIngreso: e.motivoIngreso,
      estado: 'ACTIVA',
      tipoIngreso: e.tipoIngreso,
      observaciones: e.diagnosticoInicial,
    });
  });

  bus.subscribe(DomainEvents.CAMA_ASIGNADA, async (e) => {
    await vincularCamaAInternacion.ejecutar(e.pacienteId, e.camaId);
  });
}

/** Puerto que consume Recursos y Camas: ¿el paciente ya fue ingresado? */
export const verificadorIngreso = {
  async tieneInternacionActiva(pacienteId: number): Promise<boolean> {
    const internaciones = await internacionRepository.findByPacienteId(pacienteId);
    return internaciones.some((item) => item.estado === 'ACTIVA');
  },
};

// MÓDULO
export const atencionEnfermeriaModule = {
  administracionController,
  administracionesRoutes: createAdministracionRoutes(administracionController),
  administrarDosis,
  finalizarInternacion,
  protocoloController,
  notaController,
  indicacionController,
  internacionController,
  medicacionController,
  signosVitalesController,

  // Indicaciones
  registrarIndicacion,
  consultarIndicaciones,
  actualizarIndicacion,

  // Internaciones
  registrarInternacion,
  consultarInternaciones,

  // Medicaciones
  registrarMedicacion,
  consultarMedicaciones,
  actualizarMedicacion,

  // Signos Vitales
  registrarSignosVitales,
  actualizarSignosVitales,
  eliminarSignosVitales,

  // Rutas
  routes: createProtocoloRoutes(protocoloController),
  notasRoutes: createNotaEnfermeriaRoutes(notaController),
  indicacionesRoutes: createIndicacionRoutes(indicacionController),
  internacionesRoutes: createInternacionRoutes(internacionController),
  medicacionesRoutes: createMedicacionRoutes(medicacionController),
  signosVitalesRoutes: createSignosVitalesRoutes(signosVitalesController),
};