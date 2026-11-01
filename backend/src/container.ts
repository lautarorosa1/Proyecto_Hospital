
import { pacienteModule } from './modules/admision/pacientes/paciente.module';
import { profesionalModule } from './modules/admision/profesionales/profesional.module';
import { turnoModule } from './modules/admision/turnos/turno.module';
import { horarioModule } from './modules/admision/horarios/horario.module';

import { recursosCamasModule } from './modules/recursos-camas/recursos-camas.module';
import { historiaClinicaModule } from './modules/historia-clinica/historiaClinica.module';

export const container = {
  pacienteModule,
  profesionalModule,
  turnoModule,
  horarioModule,
  recursosCamasModule,
  historiaClinicaModule,
};

// JUNTAMOS LOS MODULOS PARA QUE APP LOS PUEDA USAR - INDICE DE MODULOS
