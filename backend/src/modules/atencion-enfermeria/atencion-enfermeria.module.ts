import { ProtocolosRepositoryPostgres } from './infrastructure/ProtocolosRepositoryPostgres';
import { NotaEnfermeriaRepositoryPostgres } from './infrastructure/NotaEnfermeriaRepositoryPostgres';
import { IndicacionesRepositoryPostgres } from './infrastructure/IndicacionesRepositoryPostgres';
import { InternacionRepositoryPostgres } from './infrastructure/InternacionRepositoryPostgres';
import { MedicacionesRepositoryPostgres } from './infrastructure/MedicacionesRepositoryPostgres';
import { SignosVitalesRepositoryPostgres } from './infrastructure/SignosVitalesRepositoryPostgres';

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
const registrarInternacion = new RegistrarInternacion(internacionRepository);
const consultarInternaciones = new ConsultarInternaciones(internacionRepository);

// CASOS DE USO DE MEDICACIONES
const registrarMedicacion = new RegistrarMedicacion(medicacionesRepository);
const consultarMedicaciones = new ConsultarMedicaciones(medicacionesRepository);
const actualizarMedicacion = new ActualizarMedicacion(medicacionesRepository);

// CASOS DE USO DE SIGNOS VITALES
const registrarSignosVitales = new RegistrarSignosVitales(signosVitalesRepository);
const actualizarSignosVitales = new ActualizarSignosVitales(signosVitalesRepository);
const eliminarSignosVitales = new EliminarSignosVitales(signosVitalesRepository);

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
  consultarInternaciones
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

// MÓDULO
export const atencionEnfermeriaModule = {
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