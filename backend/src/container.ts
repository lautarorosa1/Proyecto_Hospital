import { pacienteModule } from './modules/admision/pacientes/paciente.module';
import { profesionalModule } from './modules/admision/profesionales/profesional.module';

import { historiaClinicaModule } from './modules/historia-clinica/historiaClinica.module';

export const container = {
  pacienteModule,
  profesionalModule,
  historiaClinicaModule,
};