
import { pacienteModule } from './modules/admision/pacientes/paciente.module';
import { profesionalModule } from './modules/admision/profesionales/profesional.module';

// Módulos de admisión
import { turnoModule } from './modules/admision/turnos/turno.module';
import { horarioModule } from './modules/admision/horarios/horario.module';
import { guardiaModule } from './modules/admision/guardia/guardia.module';

// Módulos de recursos y camas
import { recursosCamasModule } from './modules/recursos-camas/recursos-camas.module';

// Módulo de historia clínica
import { historiaClinicaModule } from './modules/historia-clinica/historiaClinica.module';

// Módulo de atención de enfermería
import { atencionEnfermeriaModule } from './modules/atencion-enfermeria/atencion-enfermeria.module';

// JUNTAMOS LOS MODULOS PARA QUE APP LOS PUEDA USAR - INDICE DE MODULOS
export const container = {
  pacienteModule,
  profesionalModule,
  turnoModule,
  horarioModule,
  guardiaModule,
  recursosCamasModule,
  historiaClinicaModule,
  atencionEnfermeriaModule,
};
