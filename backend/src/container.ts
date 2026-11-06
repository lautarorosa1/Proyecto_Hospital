
import { pacienteModule } from './modules/admision/pacientes/paciente.module';
import { profesionalModule } from './modules/admision/profesionales/profesional.module';
import { atencionEnfermeriaModule } from './modules/atencion-enfermeria/atencion-enfermeria.module';

export const container = {
  pacienteModule,
  profesionalModule,
  atencionEnfermeriaModule,
};

// JUNTAMOS LOS MODULOS PARA QUE APP LOS PUEDA USAR - INDICE DE MODULOS