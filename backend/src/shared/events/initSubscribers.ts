import { eventBus } from './index';
import { suscribirTurnos } from '../../modules/admision/turnos/turno.module';
import { suscribirGuardia } from '../../modules/admision/guardia/guardia.module';
import {
  recursosCamasModule,
  suscribirRecursosCamas,
} from '../../modules/recursos-camas/recursos-camas.module';
import {
  suscribirEnfermeria,
  verificadorIngreso,
} from '../../modules/atencion-enfermeria/atencion-enfermeria.module';
import { suscribirHistoriaClinica } from '../../modules/historia-clinica/historiaClinica.module';

/**
 * Raíz de composición de las interacciones entre módulos. Cada módulo expone
 * qué eventos escucha; acá se conectan al bus (una sola vez, al arrancar).
 */
export function initSubscribers(): void {
  // Admisión (consultorios, recepción y monitores de guardia)
  suscribirTurnos(eventBus);
  suscribirGuardia(eventBus);

  // Admisión → Enfermería (ingreso) · Recursos → Enfermería (cama)
  suscribirEnfermeria(eventBus);

  // Enfermería → Recursos (insumos y limpieza de cama al alta)
  suscribirRecursosCamas(eventBus);

  // Enfermería / Admisión → Historia Clínica
  suscribirHistoriaClinica(eventBus);

  // Recursos pregunta a Enfermería si el paciente ya está ingresado antes de asignarle cama.
  recursosCamasModule.camaService.definirVerificadorIngreso(verificadorIngreso);
}
