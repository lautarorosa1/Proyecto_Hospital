<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-5xl rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
      <router-link to="/admision" class="text-sm text-indigo-600 hover:underline">
        ← Volver a Admisión
      </router-link>

      <div class="mb-6 mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-2xl font-semibold text-gray-900">Agenda de turnos</h1>

        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 shadow-sm transition hover:bg-amber-100"
            @click="mostrarEntreturno = true"
          >
            Insertar entreturno
          </button>

          <router-link to="/turnos/generar">
            <button class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700">
              Generar turnos
            </button>
          </router-link>
        </div>
      </div>

      <div class="mb-6 grid gap-3 sm:grid-cols-3">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-gray-500">Profesional</label>
          <select v-model="filtros.profesionalId" :class="inputClass" @change="cargarTurnos">
            <option value="">Todos</option>
            <option v-for="p in profesionalesActivos" :key="p.id" :value="p.id">
              {{ nombreProfesional(p) }}
            </option>
          </select>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-gray-500">Fecha</label>
          <input v-model="filtros.fecha" type="date" :class="inputClass" @change="cargarTurnos" />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-gray-500">Mostrar</label>
          <div class="grid grid-cols-2 overflow-hidden rounded-lg border border-gray-300 text-sm">
            <button
              type="button"
              class="px-3 py-2 transition"
              :class="soloDisponibles ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
              @click="cambiarModo(true)"
            >
              Disponibles
            </button>
            <button
              type="button"
              class="px-3 py-2 transition"
              :class="!soloDisponibles ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
              @click="cambiarModo(false)"
            >
              Todos
            </button>
          </div>
        </div>
      </div>

      <p
        v-if="aviso"
        class="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200"
      >
        {{ aviso }}
      </p>

      <div
        v-if="advertencias.length"
        class="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200"
        role="alert"
      >
        <div class="flex items-start justify-between gap-3">
          <p class="font-medium">Entreturno insertado. Se redujo el tiempo de estos turnos:</p>
          <button
            type="button"
            class="text-xs text-amber-700 hover:underline"
            @click="advertencias = []"
          >
            Cerrar
          </button>
        </div>
        <ul class="mt-1 list-disc pl-5">
          <li v-for="(texto, i) in advertencias" :key="i">{{ texto }}</li>
        </ul>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left text-sm">
          <thead>
            <tr class="border-b border-gray-200 text-gray-500">
              <th class="px-4 py-3 font-medium">Fecha</th>
              <th class="px-4 py-3 font-medium">Horario</th>
              <th class="px-4 py-3 font-medium">Profesional</th>
              <th class="px-4 py-3 font-medium">Paciente</th>
              <th class="px-4 py-3 font-medium">Estado</th>
              <th class="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="turno in turnos"
              :key="turno.id"
              class="border-b border-gray-100 text-gray-700 transition hover:bg-gray-50"
              :class="turno.reducido ? 'bg-amber-50/60' : ''"
            >
              <td class="px-4 py-3">{{ formatearFecha(turno.fecha) }}</td>
              <td class="px-4 py-3">
                <div>{{ turno.horaInicio }} – {{ turno.horaFin }}</div>
                <div class="mt-1 flex flex-wrap gap-1">
                  <span
                    v-if="turno.esEntreturno"
                    class="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-200"
                  >
                    Entreturno
                  </span>
                  <span
                    v-if="turno.reducido"
                    :title="turno.advertencia"
                    class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-300"
                  >
                    ⚠ Tiempo reducido: {{ turno.duracionOriginalMin }} → {{ turno.duracionMin }} min
                  </span>
                </div>
              </td>
              <td class="px-4 py-3">{{ nombreProfesional(profesionalesPorId[turno.profesionalId]) }}</td>
              <td class="px-4 py-3">
                {{ turno.pacienteId ? nombrePaciente(pacientesPorId[turno.pacienteId]) : '—' }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset"
                  :class="claseEstadoTurno(turno.estado)"
                >
                  {{ etiquetaEstadoTurno(turno.estado) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <button
                  v-if="turno.estado === 'disponible'"
                  class="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100"
                  @click="abrirReserva(turno)"
                >
                  Reservar
                </button>

                <div v-else class="flex flex-wrap gap-2">
                  <button
                    v-for="accion in accionesDisponibles(turno.estado)"
                    :key="accion"
                    :disabled="procesandoId === turno.id"
                    class="rounded-md border px-3 py-1.5 text-xs font-medium transition disabled:opacity-60"
                    :class="ACCIONES_TURNO[accion].clase"
                    @click="accion === 'cancelar' ? abrirCancelacion(turno) : ejecutarAccion(turno, accion)"
                  >
                    {{ ACCIONES_TURNO[accion].label }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="errorLista" class="mt-6 text-center text-sm text-red-500">{{ errorLista }}</p>

      <p v-else-if="!cargando && turnos.length === 0" class="mt-6 text-center text-sm text-gray-400">
        {{ soloDisponibles ? 'No hay turnos disponibles con esos filtros' : 'No hay turnos con esos filtros' }}
      </p>

      <p v-if="errorAccion" class="mt-4 text-center text-sm text-red-500">{{ errorAccion }}</p>
    </div>
  </div>

  <ReservarTurnoModal
    v-model="mostrarReserva"
    :turno="turnoSeleccionado"
    :profesional="profesionalesPorId[turnoSeleccionado?.profesionalId]"
    :pacientes="pacientes"
    @reservado="alReservar"
    @conflicto="alConflicto"
  />

  <EntreturnoModal
    v-model="mostrarEntreturno"
    :profesionales="profesionalesActivos"
    :pacientes="pacientes"
    :profesionalId="filtros.profesionalId"
    :fecha="filtros.fecha"
    @creado="alCrearEntreturno"
    @conflicto="cargarTurnos"
  />

  <ConfirmModal
    v-model="mostrarCancelacion"
    titulo="Cancelar turno"
    :mensaje="mensajeCancelacion"
    textoConfirmar="Sí, cancelar turno"
    @confirm="confirmarCancelacion"
  />
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ConfirmModal from '@/shared/components/ConfirmModal.vue'
import { hoyISO } from '@/shared/utils/validators'
import { getProfesionales } from '../../profesionales/services/profesionalService'
import { getPacientes } from '../../pacientes/services/pacienteService'
import ReservarTurnoModal from '../components/ReservarTurnoModal.vue'
import EntreturnoModal from '../components/EntreturnoModal.vue'
import {
  getTurnos,
  getTurnosDisponibles,
  confirmarTurno,
  registrarLlegadaTurno,
  atenderTurno,
  cancelarTurno
} from '../services/turnoService'
import {
  ACCIONES_TURNO,
  accionesDisponibles,
  etiquetaEstadoTurno,
  claseEstadoTurno,
  formatearFecha,
  nombreProfesional,
  nombrePaciente,
  mensajeError
} from '../utils/turnoForm'

const inputClass =
  'rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

const route = useRoute()

const turnos = ref([])
const profesionales = ref([])
const pacientes = ref([])
const cargando = ref(true)
const errorLista = ref('')
const errorAccion = ref('')
const aviso = ref('')
const procesandoId = ref(null)

const soloDisponibles = ref(true)

// al venir de "Generar turnos" se reciben profesional y fecha por query
const filtros = reactive({
  profesionalId: route.query.profesionalId ? Number(route.query.profesionalId) : '',
  fecha: typeof route.query.fecha === 'string' ? route.query.fecha : hoyISO()
})

const mostrarReserva = ref(false)
const mostrarEntreturno = ref(false)
// avisos devueltos por el backend al recortar turnos con un entreturno
const advertencias = ref([])
const mostrarCancelacion = ref(false)
const turnoSeleccionado = ref(null)

const profesionalesActivos = computed(() =>
  profesionales.value.filter((p) => p.estado === 'activo')
)
const profesionalesPorId = computed(() =>
  Object.fromEntries(profesionales.value.map((p) => [p.id, p]))
)
const pacientesPorId = computed(() =>
  Object.fromEntries(pacientes.value.map((p) => [p.id, p]))
)

const mensajeCancelacion = computed(() => {
  const t = turnoSeleccionado.value
  if (!t) return ''
  return `Se cancelará el turno del ${formatearFecha(t.fecha)} a las ${t.horaInicio}. El horario volverá a quedar disponible.`
})

const cargarTurnos = async () => {
  errorLista.value = ''
  cargando.value = true

  // los filtros vacíos no se envían
  const params = {}
  if (filtros.profesionalId !== '') params.profesionalId = filtros.profesionalId
  if (filtros.fecha) params.fecha = filtros.fecha

  try {
    const response = soloDisponibles.value
      ? await getTurnosDisponibles(params)
      : await getTurnos(params)
    turnos.value = response.data
  } catch (error) {
    console.error(error)
    turnos.value = []
    errorLista.value = mensajeError(error)
  } finally {
    cargando.value = false
  }
}

// profesionales y pacientes se cargan una vez: sirven para mostrar nombres y para el modal
const cargarReferencias = async () => {
  try {
    const [resProfesionales, resPacientes] = await Promise.all([getProfesionales(), getPacientes()])
    profesionales.value = resProfesionales.data
    pacientes.value = resPacientes.data
  } catch (error) {
    console.error('Error cargando profesionales y pacientes:', error)
    errorLista.value = mensajeError(error)
  }
}

const cambiarModo = (disponibles) => {
  soloDisponibles.value = disponibles
  aviso.value = ''
  cargarTurnos()
}

const abrirReserva = (turno) => {
  aviso.value = ''
  errorAccion.value = ''
  turnoSeleccionado.value = turno
  mostrarReserva.value = true
}

const alReservar = () => {
  aviso.value = ''
  cargarTurnos()
}

// Entreturno insertado: se muestra la lista completa (el entreturno y los turnos
// recortados no están "disponibles") en la fecha/profesional del entreturno.
const alCrearEntreturno = ({ entreturno, advertencias: avisos }) => {
  aviso.value = ''
  errorAccion.value = ''
  advertencias.value = avisos
  filtros.profesionalId = entreturno.profesionalId
  filtros.fecha = entreturno.fecha
  soloDisponibles.value = false
  cargarTurnos()
}

// otro usuario tomó o modificó el turno: se avisa y se refresca la lista
const alConflicto = (mensaje) => {
  aviso.value = mensaje
  cargarTurnos()
}

// Transiciones de estado sin confirmación (confirmar, llegada, atender).
// Si el backend rechaza (409: transición inválida o turno cambiado por otro
// usuario) se muestra su mensaje y se refresca la lista.
const ACCIONES_API = {
  confirmar: confirmarTurno,
  llegada: registrarLlegadaTurno,
  atender: atenderTurno
}

const ejecutarAccion = async (turno, accion) => {
  aviso.value = ''
  errorAccion.value = ''
  procesandoId.value = turno.id
  try {
    await ACCIONES_API[accion](turno.id)
    await cargarTurnos()
  } catch (error) {
    console.error(`Error en acción "${accion}":`, error)
    errorAccion.value = mensajeError(error, 'No se pudo actualizar el turno')
    if (error.response?.status === 409) cargarTurnos()
  } finally {
    procesandoId.value = null
  }
}

const abrirCancelacion = (turno) => {
  aviso.value = ''
  errorAccion.value = ''
  turnoSeleccionado.value = turno
  mostrarCancelacion.value = true
}

const confirmarCancelacion = async () => {
  errorAccion.value = ''
  try {
    await cancelarTurno(turnoSeleccionado.value.id)
    await cargarTurnos()
  } catch (error) {
    console.error('Error cancelando turno:', error)
    errorAccion.value = mensajeError(error, 'No se pudo cancelar el turno')
    // si cambió de estado mientras tanto, la lista ya no es fiel
    if (error.response?.status === 409) cargarTurnos()
  }
}

onMounted(async () => {
  await cargarReferencias()
  await cargarTurnos()
})
</script>
