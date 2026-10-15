import { pacienteModule } from './modules/admision/pacientes/paciente.module';
import { profesionalModule } from './modules/admision/profesionales/profesional.module';
import { recursosCamasModule } from './modules/recursos-camas/recursos-camas.module';

export const container = {
  pacienteModule,
  profesionalModule,
  recursosCamasModule,
};

//JUNTAMOS LOS MODULOS PARA QUE APP LOS PUEDA USAR - INDICE DE MODULOS