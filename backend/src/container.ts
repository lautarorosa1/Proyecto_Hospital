import { iamModule } from './modules/iam/iam.module';
import { pacienteModule } from './modules/admision/pacientes/paciente.module';
import { profesionalModule } from './modules/admision/profesionales/profesional.module';
import { turnoModule } from './modules/admision/turnos/turno.module';
import { horarioModule } from './modules/admision/horarios/horario.module';
import { guardiaModule } from './modules/admision/guardia/guardia.module';
import { ingresoInternacionModule } from './modules/admision/ingresos-internacion/ingresoInternacion.module';
import { recursosCamasModule } from './modules/recursos-camas/recursos-camas.module';
import { historiaClinicaModule } from './modules/historia-clinica/historiaClinica.module';
import { atencionEnfermeriaModule } from './modules/atencion-enfermeria/atencion-enfermeria.module';
import { facturacionModule } from './modules/facturacion/facturacion.module';

export const container = {
  iamModule,
  pacienteModule,
  profesionalModule,
  turnoModule,
  horarioModule,
  guardiaModule,
  ingresoInternacionModule,
  recursosCamasModule,
  historiaClinicaModule,
  atencionEnfermeriaModule,
  facturacionModule,
};