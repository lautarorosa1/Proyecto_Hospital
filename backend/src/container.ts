import { pacienteModule } from './modules/admision/pacientes/paciente.module';
import { profesionalModule } from './modules/admision/profesionales/profesional.module';

export const container = {
  pacienteModule,
  profesionalModule,
};

//JUNTAMOS LOS MODULOS PARA QUE APP LOS PUEDA USAR - INDICE DE MODULOS