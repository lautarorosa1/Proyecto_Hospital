<script setup>
import { ref, computed, onMounted, watch } from 'vue'

import { getProfesionales } from '@/modules/admision/profesionales/services/profesionalService'
import { useEventStream } from '@/shared/composables/useEventStream'
import { mensajeError } from '@/shared/utils/formato'

import {
  listarConsultorios,
  abrirConsultorio,
  obtenerOcupacion,
  cerrarConsultorio,
  obtenerAgenda,
  obtenerSalaEspera,
  atenderTurno,
  listarNotificaciones,
  marcarLeida,
  marcarTodasLeidas,
  urlStreamProfesional,
  urlStreamConsultorios
} from '../services/consultorioService'

const CLAVE_PROFESIONAL = 'consultorio.profesionalId'

const hoyLocal = () => {
  const d = new Date()
  const dos = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`
}

// ---------- Estado ----------
const profesionales = ref([])
const profesionalId = ref(localStorage.getItem(CLAVE_PROFESIONAL) || '')
const fecha = ref(hoyLocal())

const ocupacion = ref(null) // consultorio que el profesional ocupa ahora
const consultorios = ref([]) // todos los consultorios y quién los ocupa
const consultorioElegido = ref('')
const agenda = ref({ turnos: [], resumen: {} })
const salaEspera = ref([])
const notificaciones = ref([])
const noLeidas = ref(0)

const cargando = ref(false)
const procesando = ref(false)
const error = ref('')
const mensaje = ref('')
const toast = ref(null) // última notificación recibida en vivo

const ESTADOS = {
  programado: { etiqueta: 'Programado', clase: 'bg-gray-100 text-gray-700 ring-gray-200' },
  confirmado: { etiqueta: 'Confirmado', clase: 'bg-blue-50 text-blue-700 ring-blue-200' },
  en_sala_espera: { etiqueta: 'En sala de espera', clase: 'bg-amber-50 text-amber-700 ring-amber-200' },
  atendido: { etiqueta: 'Atendido', clase: 'bg-green-50 text-green-700 ring-green-200' },
  cancelado: { etiqueta: 'Cancelado', clase: 'bg-red-50 text-red-600 ring-red-200' }
}

const ICONOS = {
  SALA_ESPERA: '🪑',
  ENTRETURNO: '⏱️',
  TURNO_CANCELADO: '🚫',
  LISTA_ESPERA: '📋',
  RIESGO_VITAL: '🚨'
}

const profesional = computed(() =>
  profesionales.value.find((p) => Number(p.id) === Number(profesionalId.value))
)
const consultoriosLibres = computed(() => consultorios.value.filter((c) => !c.ocupacion))
const consultoriosOcupados = computed(() => consultorios.value.filter((c) => c.ocupacion))

const nombreCompleto = (p) => (p ? `${p.nombre} ${p.apellido}` : '')
const nombrePaciente = (turno) =>
  turno.paciente ? `${turno.paciente.apellido}, ${turno.paciente.nombre}` : `Paciente #${turno.pacienteId}`
const hora = (iso) =>
  new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
const fechaHora = (iso) =>
  new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })

// ---------- Carga ----------
const cargarProfesionales = async () => {
  try {
    const res = await getProfesionales({ estado: 'activo' })
    profesionales.value = Array.isArray(res.data) ? res.data : res.data?.data || []
  } catch (err) {
    error.value = mensajeError(err, 'No se pudieron cargar los profesionales.')
  }
}

const cargarConsultorios = async () => {
  try {
    consultorios.value = await listarConsultorios()
  } catch (err) {
    console.error('Error al cargar consultorios:', err)
  }
}

const cargarOcupacion = async () => {
  if (!profesionalId.value) return
  ocupacion.value = await obtenerOcupacion(profesionalId.value)
  await cargarConsultorios()
}

const cargarTurnos = async () => {
  if (!profesionalId.value) return
  const [a, s] = await Promise.all([
    obtenerAgenda(profesionalId.value, fecha.value),
    obtenerSalaEspera(profesionalId.value, fecha.value)
  ])
  agenda.value = a
  salaEspera.value = s
}

const cargarNotificaciones = async () => {
  if (!profesionalId.value) return
  const r = await listarNotificaciones(profesionalId.value)
  notificaciones.value = r.notificaciones
  noLeidas.value = r.noLeidas
}

const cargarTodo = async () => {
  if (!profesionalId.value) return
  cargando.value = true
  error.value = ''
  try {
    await Promise.all([cargarOcupacion(), cargarTurnos(), cargarNotificaciones()])
  } catch (err) {
    error.value = mensajeError(err, 'No se pudieron cargar los datos del consultorio.')
  } finally {
    cargando.value = false
  }
}

// ---------- Acciones ----------
const ejecutar = async (accion, errorPorDefecto) => {
  error.value = ''
  mensaje.value = ''
  procesando.value = true
  try {
    await accion()
  } catch (err) {
    error.value = mensajeError(err, errorPorDefecto)
    // otro usuario pudo cambiar el estado: se refresca lo que se ve
    if (err.response?.status === 409) await cargarTodo().catch(() => {})
  } finally {
    procesando.value = false
  }
}

const abrir = () =>
  ejecutar(async () => {
    if (!consultorioElegido.value) {
      error.value = 'Elegí un consultorio libre.'
      return
    }
    const o = await abrirConsultorio(Number(profesionalId.value), Number(consultorioElegido.value))
    mensaje.value = `Consultorio ${o.habitacion.numero} abierto. Ya podés atender pacientes.`
    consultorioElegido.value = ''
    await cargarOcupacion()
  }, 'No se pudo abrir el consultorio.')

const cerrar = () =>
  ejecutar(async () => {
    if (salaEspera.value.length > 0) {
      const sigue = window.confirm(
        `Todavía hay ${salaEspera.value.length} paciente(s) en sala de espera. ¿Cerrar el consultorio igual?`
      )
      if (!sigue) return
    }
    await cerrarConsultorio(Number(profesionalId.value))
    mensaje.value = 'Consultorio cerrado: quedó libre para otros profesionales.'
    await cargarOcupacion()
  }, 'No se pudo cerrar el consultorio.')

const atender = (turno) =>
  ejecutar(async () => {
    await atenderTurno(Number(profesionalId.value), turno.id)
    mensaje.value = `Atención de ${nombrePaciente(turno)} registrada.`
    await cargarTurnos()
  }, 'No se pudo registrar la atención.')

const leer = async (n) => {
  if (n.leida) return
  try {
    await marcarLeida(Number(profesionalId.value), n.id)
    n.leida = true
    noLeidas.value = Math.max(0, noLeidas.value - 1)
  } catch (err) {
    error.value = mensajeError(err, 'No se pudo marcar la notificación.')
  }
}

const leerTodas = async () => {
  try {
    await marcarTodasLeidas(Number(profesionalId.value))
    notificaciones.value.forEach((n) => (n.leida = true))
    noLeidas.value = 0
  } catch (err) {
    error.value = mensajeError(err, 'No se pudieron marcar las notificaciones.')
  }
}

// ---------- Tiempo real ----------
// Cada aviso que llega (paciente en sala de espera, entreturno, cancelación...) actualiza la pantalla.
const { conectado } = useEventStream(
  computed(() => (profesionalId.value ? urlStreamProfesional(profesionalId.value) : null)),
  {
    notificacion: async (n) => {
      toast.value = n
      setTimeout(() => {
        if (toast.value?.id === n.id) toast.value = null
      }, 8000)
      await Promise.all([cargarTurnos(), cargarNotificaciones()]).catch(() => {})
    },
    ocupacion: () => cargarOcupacion().catch(() => {})
  }
)

// Quién ocupa cada sala se refleja al instante en todos los puestos
useEventStream(urlStreamConsultorios(), { consultorio_estado: cargarConsultorios })

// ---------- Ciclo de vida ----------
watch(profesionalId, (id) => {
  if (id) localStorage.setItem(CLAVE_PROFESIONAL, id)
  else localStorage.removeItem(CLAVE_PROFESIONAL)
  ocupacion.value = null
  agenda.value = { turnos: [], resumen: {} }
  salaEspera.value = []
  notificaciones.value = []
  noLeidas.value = 0
  mensaje.value = ''
  cargarTodo()
})

watch(fecha, () => {
  cargarTurnos().catch((err) => {
    error.value = mensajeError(err, 'No se pudo cargar la agenda.')
  })
})

onMounted(async () => {
  await cargarProfesionales()
  // si el profesional guardado ya no existe o está inactivo, se limpia la selección
  if (profesionalId.value && !profesional.value) profesionalId.value = ''
  else await cargarTodo()
})
</script>

<template>
  <main class="min-h-screen bg-gray-50 p-6">
    <div class="mx-auto max-w-6xl">
      <!-- ENCABEZADO -->
      <header class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Consultorio</h1>
          <p class="text-sm text-gray-500">
            Agenda, sala de espera y avisos del profesional
            <span
              v-if="profesionalId"
              class="ml-2 text-xs"
              :class="conectado ? 'text-green-600' : 'text-amber-600'"
            >
              {{ conectado ? '● En vivo' : '● Reconectando…' }}
            </span>
          </p>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-gray-500">Profesional</label>
          <select
            v-model="profesionalId"
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Seleccionar profesional…</option>
            <option v-for="p in profesionales" :key="p.id" :value="p.id">
              {{ nombreCompleto(p) }} ({{ p.tipoProfesional }})
            </option>
          </select>
        </div>
      </header>

      <p
        v-if="!profesionalId"
        class="rounded-xl bg-white p-10 text-center text-gray-500 shadow-sm"
      >
        Elegí un profesional para ver su consultorio.
      </p>

      <template v-else>
        <!-- MENSAJES -->
        <p v-if="error" class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{{ error }}</p>
        <p v-if="mensaje" class="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{{ mensaje }}</p>

        <!-- AVISO EN VIVO -->
        <div
          v-if="toast"
          class="mb-4 flex items-start justify-between gap-3 rounded-xl bg-indigo-600 p-4 text-white shadow-lg"
          role="alert"
        >
          <p class="text-sm">
            <span class="font-semibold">{{ ICONOS[toast.tipo] }} {{ toast.titulo }}:</span>
            {{ toast.mensaje }}
          </p>
          <button type="button" class="text-xs underline" @click="toast = null">Cerrar</button>
        </div>

        <!-- CONSULTORIO QUE OCUPA -->
        <section class="mb-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <div v-if="ocupacion" class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-xs font-medium uppercase tracking-wide text-green-700">Atendiendo en</p>
              <p class="text-xl font-bold text-gray-900">
                Consultorio {{ ocupacion.habitacion.numero }}
              </p>
              <p class="text-sm text-gray-500">
                Piso {{ ocupacion.habitacion.piso }} · {{ ocupacion.habitacion.sector }} ·
                desde las {{ hora(ocupacion.iniciadaEn) }}
              </p>
            </div>
            <button
              type="button"
              :disabled="procesando"
              class="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
              @click="cerrar"
            >
              Cerrar consultorio
            </button>
          </div>

          <div v-else>
            <p class="text-sm font-medium text-gray-800">
              No tenés un consultorio abierto. Para atender pacientes ocupá uno libre.
            </p>
            <div class="mt-3 flex flex-col gap-2 sm:flex-row">
              <select
                v-model="consultorioElegido"
                class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Seleccionar consultorio libre…</option>
                <option v-for="c in consultoriosLibres" :key="c.id" :value="c.id">
                  Consultorio {{ c.numero }} — piso {{ c.piso }}, {{ c.sector }}
                </option>
              </select>
              <button
                type="button"
                :disabled="procesando || !consultorioElegido"
                class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                @click="abrir"
              >
                Abrir consultorio
              </button>
            </div>
            <p v-if="consultorios.length === 0" class="mt-2 text-xs text-amber-600">
              No hay consultorios cargados. Creá una habitación de tipo "Consultorio" en Recursos y camas.
            </p>
            <p v-else-if="consultoriosLibres.length === 0" class="mt-2 text-xs text-amber-600">
              Todos los consultorios están ocupados.
            </p>
          </div>

          <!-- OTROS CONSULTORIOS -->
          <div v-if="consultoriosOcupados.length" class="mt-4 border-t border-gray-100 pt-3">
            <p class="mb-2 text-xs font-medium text-gray-500">Consultorios ocupados</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="c in consultoriosOcupados"
                :key="c.id"
                class="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
              >
                {{ c.numero }} · {{ c.ocupacion.profesionalNombre }}
              </span>
            </div>
          </div>
        </section>

        <!-- CONTADORES -->
        <section class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div v-for="(info, estado) in ESTADOS" :key="estado" class="rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-200">
            <p class="text-xs text-gray-500">{{ info.etiqueta }}</p>
            <p class="text-2xl font-bold text-gray-900">{{ agenda.resumen?.[estado] ?? 0 }}</p>
          </div>
        </section>

        <p v-if="cargando" class="mb-4 text-sm text-gray-500">Cargando…</p>

        <div class="grid gap-6 lg:grid-cols-3">
          <div class="space-y-6 lg:col-span-2">
            <!-- SALA DE ESPERA -->
            <section class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-amber-200">
              <h2 class="mb-3 text-lg font-semibold text-gray-900">
                Sala de espera
                <span class="ml-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                  {{ salaEspera.length }}
                </span>
              </h2>

              <p v-if="salaEspera.length === 0" class="text-sm text-gray-400">
                No hay pacientes esperando.
              </p>

              <ul v-else class="divide-y divide-gray-100">
                <li
                  v-for="turno in salaEspera"
                  :key="turno.id"
                  class="flex items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p class="font-medium text-gray-900">{{ nombrePaciente(turno) }}</p>
                    <p class="text-xs text-gray-500">
                      Turno {{ turno.horaInicio }} · DNI {{ turno.paciente?.dni ?? '—' }}
                    </p>
                  </div>
                  <button
                    type="button"
                    :disabled="procesando || !ocupacion"
                    :title="ocupacion ? '' : 'Abrí un consultorio para atender'"
                    class="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
                    @click="atender(turno)"
                  >
                    Atender
                  </button>
                </li>
              </ul>
              <p v-if="salaEspera.length && !ocupacion" class="mt-2 text-xs text-amber-600">
                Abrí un consultorio para poder atender a los pacientes.
              </p>
            </section>

            <!-- AGENDA -->
            <section class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
              <div class="mb-3 flex items-center justify-between gap-3">
                <h2 class="text-lg font-semibold text-gray-900">Agenda</h2>
                <input v-model="fecha" type="date" class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
              </div>

              <p v-if="agenda.turnos.length === 0" class="text-sm text-gray-400">
                No hay turnos reservados para este día.
              </p>

              <div v-else class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                  <thead class="text-gray-500">
                    <tr class="border-b border-gray-200">
                      <th class="py-2 pr-3 font-medium">Hora</th>
                      <th class="py-2 pr-3 font-medium">Paciente</th>
                      <th class="py-2 pr-3 font-medium">Estado</th>
                      <th class="py-2 font-medium">Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="turno in agenda.turnos" :key="turno.id" class="border-b border-gray-100">
                      <td class="py-2 pr-3 font-medium text-gray-900">
                        {{ turno.horaInicio }}–{{ turno.horaFin }}
                      </td>
                      <td class="py-2 pr-3">{{ nombrePaciente(turno) }}</td>
                      <td class="py-2 pr-3">
                        <span
                          class="rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset"
                          :class="ESTADOS[turno.estado]?.clase"
                        >
                          {{ ESTADOS[turno.estado]?.etiqueta ?? turno.estado }}
                        </span>
                      </td>
                      <td class="py-2 text-xs">
                        <span v-if="turno.esEntreturno" class="mr-1 rounded bg-purple-50 px-1.5 py-0.5 text-purple-700">
                          Entreturno
                        </span>
                        <span
                          v-if="turno.reducido"
                          class="rounded bg-orange-50 px-1.5 py-0.5 text-orange-700"
                          :title="turno.advertencia"
                        >
                          Tiempo reducido ({{ turno.duracionOriginalMin }}→{{ turno.duracionMin }} min)
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <!-- NOTIFICACIONES -->
          <aside class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <div class="mb-3 flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">
                Notificaciones
                <span
                  v-if="noLeidas"
                  class="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white"
                >
                  {{ noLeidas }}
                </span>
              </h2>
              <button
                v-if="noLeidas"
                type="button"
                class="text-xs text-indigo-600 hover:underline"
                @click="leerTodas"
              >
                Marcar todas leídas
              </button>
            </div>

            <p v-if="notificaciones.length === 0" class="text-sm text-gray-400">
              No tenés notificaciones.
            </p>

            <ul v-else class="max-h-[32rem] space-y-2 overflow-y-auto">
              <li
                v-for="n in notificaciones"
                :key="n.id"
                class="cursor-pointer rounded-lg border p-3 text-sm transition"
                :class="[
                  n.leida ? 'border-gray-100 bg-gray-50 text-gray-500' : 'border-indigo-200 bg-indigo-50 text-gray-800',
                  n.tipo === 'RIESGO_VITAL' && !n.leida ? '!border-red-300 !bg-red-50' : ''
                ]"
                @click="leer(n)"
              >
                <p class="font-semibold">{{ ICONOS[n.tipo] }} {{ n.titulo }}</p>
                <p class="mt-0.5">{{ n.mensaje }}</p>
                <p class="mt-1 text-xs text-gray-400">{{ fechaHora(n.creadaEn) }}</p>
              </li>
            </ul>
          </aside>
        </div>
      </template>
    </div>
  </main>
</template>
