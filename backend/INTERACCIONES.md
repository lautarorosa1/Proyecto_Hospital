# Interacciones entre módulos

Todos los módulos se comunican **solo por eventos de dominio** (`src/shared/domain/events/DomainEvents.ts`)
a través de un único bus (`src/shared/events`). Ningún módulo importa clases de otro para reaccionar a un hecho.
La conexión de suscriptores se hace una sola vez en `src/shared/events/initSubscribers.ts`.

| Evento | Publica | Escucha | Efecto |
|---|---|---|---|
| `PACIENTE_INGRESADO` | Admisión (`POST /ingresos-internacion`) | Enfermería, HCE | Crea la internación y arma el protocolo con el Builder del tipo de ingreso (Pre-Op, Respiratorio, General) |
| `INTERNACION_REGISTRADA` | Enfermería | — | Hecho informativo (incluye `protocoloId`) |
| `CAMA_ASIGNADA` | Recursos (`POST /camas/:id/asignaciones`) | Enfermería | Guarda `camaId` en la internación activa |
| `CAMA_ESTADO_CAMBIADO` | Recursos | Monitores (`GET /camas/eventos/stream`) | Tiempo real del mapa de camas |
| `MEDICACION_ADMINISTRADA` | Enfermería (`POST /atencion-enfermeria/administraciones`) | Recursos, HCE | Descuento atómico del insumo del piso |
| `SIGNOS_VITALES_REGISTRADO` | Enfermería | HCE | Línea de tiempo clínica |
| `SIGNOS_VITALES_ALERTA` (T > 39 °C) | Enfermería | Guardia (`GET /guardia/alertas/stream`) | Alerta de alta prioridad con sector |
| `PACIENTE_DADO_DE_ALTA` | Enfermería (`POST /atencion-enfermeria/internaciones/:id/alta`) | Recursos, HCE | La cama pasa a "En limpieza" |
| `TURNO_CANCELADO` | Admisión | — | Además promueve al primero de la lista de espera |
| `LISTA_ESPERA_PROMOVIDA` | Admisión | Recepción (`GET /turnos/espera/alertas/stream`) | Avisar al paciente de su nuevo horario |

Consultas síncronas (puertos, sin acoplar módulos): Recursos → Enfermería (`IVerificadorIngreso`: solo se asigna cama a un
paciente con internación activa), Enfermería → Recursos (`IUbicacionInternacion`: sector de la cama) y
Enfermería → HCE (`IAlergiasPaciente`: no se registra un fármaco al que el paciente es alérgico).

Línea de tiempo del paciente: `GET /historia-clinica/pacientes/:id/eventos`.

## Módulo Consultorio

El profesional que atiende turnos **ocupa una habitación de tipo `CONSULTORIO`** (las habitaciones tienen `tipo`:
`INTERNACION` con camas, o `CONSULTORIO` sin camas, que no aparece en el mapa de camas).

| Endpoint (`/consultorio/...`) | Qué hace |
|---|---|
| `GET /habitaciones` · `GET /habitaciones/stream` | Consultorios y quién los ocupa (SSE: `consultorio_estado`) |
| `POST /ocupaciones` `{profesionalId, habitacionId}` | Abre el consultorio (409 si la sala está ocupada o el profesional ya tiene otra abierta) |
| `POST /profesionales/:id/ocupacion/cerrar` · `GET .../ocupacion` | Cierra / consulta el consultorio actual |
| `GET /profesionales/:id/agenda?fecha=` | Turnos del día con datos del paciente y contadores por estado |
| `GET /profesionales/:id/sala-espera` | Pacientes que ya llegaron (`en_sala_espera`) |
| `POST /profesionales/:id/turnos/:turnoId/atender` | Atiende el turno: exige consultorio abierto y que el turno sea del profesional |
| `GET/POST /profesionales/:id/notificaciones...` | Bandeja persistente, marcar leída(s) |
| `GET /profesionales/:id/stream` | SSE: `notificacion` y `ocupacion` |

Concurrencia: dos índices únicos **parciales** (`estado = 'activa'`) sobre `ocupaciones_consultorio` impiden, a nivel de base,
dos profesionales en una sala o un profesional en dos salas.

| Evento que escucha | Notificación al profesional |
|---|---|
| `TURNO_PACIENTE_EN_SALA_ESPERA` | Paciente en sala de espera |
| `TURNOS_REDUCIDOS` | Entreturno insertado (menos tiempo por paciente) |
| `TURNO_CANCELADO` / `LISTA_ESPERA_PROMOVIDA` | Cambios en la agenda |
| `ALERTA_RIESGO_VITAL` | Código Rojo (a los médicos destinatarios) |

Publica `CONSULTORIO_OCUPADO` y `CONSULTORIO_LIBERADO`.
