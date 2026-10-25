import { pacienteModule } from './modules/admision/pacientes/paciente.module';
import { profesionalModule } from './modules/admision/profesionales/profesional.module';
import { turnoModule } from './modules/admision/turnos/turno.module';
import { horarioModule } from './modules/admision/horarios/horario.module';

export const container = {
  pacienteModule,
  profesionalModule,
  turnoModule,
  horarioModule,
};

//JUNTAMOS LOS MODULOS PARA QUE APP LOS PUEDA USAR - INDICE DE MODULOS