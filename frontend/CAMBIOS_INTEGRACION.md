# Ajustes del frontend por la integración entre módulos

El backend ahora conecta los módulos por eventos (ver `backend/INTERACCIONES.md`). Cambios en la UI:

| Pantalla | Cambio |
|---|---|
| Enfermería › Internaciones | El alta de internación ahora es **"Confirmar ingreso"** (Admisión → `POST /ingresos-internacion`): tipo de ingreso + diagnóstico. La ficha muestra tipo, cama, **protocolo generado** (Pre-Op / Respiratorio / General), permite **asignar cama libre** y **dar de alta** (la cama pasa a limpieza). |
| Enfermería › Medicaciones | Cada indicación puede llevar un **insumo** y unidades por dosis. Nuevo botón **Administrar** (enfermero + horario, ±30 min) y tabla de dosis administradas; al administrar, el stock del piso se descuenta. Muestra el rechazo por **alergia** (HCE). |
| Enfermería › Signos vitales | Usa la marca `alerta` del backend (T > 39 °C): fila en rojo y aviso de que se notificó al médico y se creó la nota automática. |
| Recursos › Mapa de camas | **En vivo** por SSE (`/camas/eventos/stream`) y estados con color. |
| Recursos › Detalle de cama | Asignación por **selector de pacientes internados sin cama** (el backend exige internación activa). Aclara que la limpieza se libera con confirmación de higiene. |
| Admisión › Guardia › Monitor | Además del Código Rojo, muestra **alertas de signos vitales** (temperatura alta) con sector y cama. |
| Admisión › Turnos | **Lista de espera (standby)**: panel por profesional y día, y aviso a recepción (SSE) cuando un cancelado se asigna al primero de la cola. |
| Historia Clínica | Nueva **línea de tiempo** (ingresos, signos vitales, medicación, altas) y **alergias conectadas al backend** (antes eran datos de prueba). |

Compartido: `shared/composables/useEventStream.js` (SSE), `mensajeError` entiende `{ error }` y `{ mensaje }`, y `usuarioIdActual()`.
