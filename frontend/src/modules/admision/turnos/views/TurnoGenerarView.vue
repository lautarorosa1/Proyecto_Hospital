<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
      <router-link to="/turnos" class="text-sm text-indigo-600 hover:underline">
        ← Volver a la agenda
      </router-link>

      <h1 class="mb-6 mt-3 text-2xl font-semibold text-gray-900">Generar turno</h1>

      <form class="flex flex-col gap-5" @submit.prevent="generar">
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium text-gray-700">Profesional</label>
            <small class="text-xs text-red-500">{{ errores.profesionalId }}</small>
          </div>
          <select v-model="datos.profesionalId" :class="inputClass">
            <option value="" disabled>Seleccione un profesional</option>
            <option v-for="p in profesionalesActivos" :key="p.id" :value="p.id">
              {{ nombreProfesional(p) }}
            </option>
          </select>
        </div>

        <div class="flex flex-col gap-1.5">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium text-gray-700">Fecha</label>
            <small class="text-xs text-red-500">{{ errores.fecha }}</small>
          </div>
          <input v-model="datos.fecha" type="date" :min="hoy" :class="inputClass" />
        </div>

        <div class="flex flex-col gap-1.5">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium text-gray-700">Horario del turno</label>
            <small class="text-xs text-red-500">{{ errores.horaInicio }}</small>
          </div>
          <select
            v-model="datos.horaInicio"
            :disabled="!profesionalSeleccionado || !datos.fecha || horariosLibres.length === 0"
            :class="inputClass"
          >
            <option value="" disabled>{{ textoPlaceholderHorario }}</option>
            <option v-for="hora in horariosLibres" :key="hora" :value="hora">
              {{ hora }} – {{ calcularHoraFin(hora, profesionalSeleccionado.duracionTurnoMin) }}
            </option>
          </select>
        </div>

        <p
          v-if="profesionalSeleccionado && sinAgenda"
          class="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200"
        >
          Este profesional todavía no tiene horarios de atención cargados.
          <router-link
            :to="`/profesionales/${profesionalSeleccionado.id}/horarios`"
            class="font-medium underline"
          >
            Cargar horarios
          </router-link>
        </p>

        <p
          v-else-if="profesionalSeleccionado"
          class="rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-700"
        >
          Los turnos de {{ nombreProfesional(profesionalSeleccionado) }} duran
          {{ profesionalSeleccionado.duracionTurnoMin }} min.
          <template v-if="rangosDelDia.length">
            Ese día atiende de {{ textoRangos }}.
          </template>
          Solo se muestran los horarios libres.
        </p>

        <p v-if="exito" class="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {{ exito }}
        </p>

        <p v-if="errorGeneral" class="text-sm text-red-500">{{ errorGeneral }}</p>

        <div class="mt-2 flex justify-end gap-3">
          <router-link
            :to="{ path: '/turnos', query: datos.profesionalId ? { profesionalId: datos.profesionalId, fecha: datos.fecha } : {} }"
            class="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Ver agenda
          </router-link>

          <button
            type="submit"
            :disabled="guardando"
            class="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
          >
            Generar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { hoyISO } from '@/shared/utils/validators'
import { getProfesionales } from '../../profesionales/services/profesionalService'
import { getHorarios } from '../../profesionales/services/profesionalService'
import { crearTurno, getTurnos } from '../services/turnoService'
import {
  generarVacio,
  erroresGenerarVacios,
  validarGenerar,
  horaActual,
  calcularHoraFin,
  calcularHorariosLibres,
  diaSemanaISO,
  formatearFecha,
  nombreProfesional,
  mensajeError
} from '../utils/turnoForm'

const inputClass =
  'rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

const hoy = hoyISO()

const datos = reactive({ ...generarVacio(), fecha: hoy })
const errores = reactive(erroresGenerarVacios())
const errorGeneral = ref('')
const exito = ref('')
const guardando = ref(false)

const profesionales = ref([])
const profesionalesActivos = computed(() =>
  profesionales.value.filter((p) => p.estado === 'activo')
)
const profesionalSeleccionado = computed(() =>
  profesionales.value.find((p) => p.id === datos.profesionalId)
)

// turnos ya cargados del profesional en la fecha elegida (para no ofrecer horarios ocupados)
const ocupados = ref([])

// agenda semanal del profesional elegido (null = todavía no se cargó)
const agendaProfesional = ref(null)

const sinAgenda = computed(
  () => agendaProfesional.value !== null && agendaProfesional.value.length === 0
)

// rangos de atención del profesional en el día de la semana de la fecha elegida
const rangosDelDia = computed(() => {
  if (!agendaProfesional.value || !datos.fecha) return []
  const dia = diaSemanaISO(datos.fecha)
  return agendaProfesional.value.filter((h) => h.diaSemana === dia)
})

const textoRangos = computed(() =>
  rangosDelDia.value.map((r) => `${r.horaDesde} a ${r.horaHasta}`).join(' y de ')
)

const horariosLibres = computed(() => {
  if (!profesionalSeleccionado.value || !datos.fecha) return []
  return calcularHorariosLibres({
    duracionMin: profesionalSeleccionado.value.duracionTurnoMin,
    rangos: rangosDelDia.value,
    ocupados: ocupados.value,
    fecha: datos.fecha,
    hoy,
    ahora: horaActual()
  })
})

const textoPlaceholderHorario = computed(() => {
  if (!profesionalSeleccionado.value) return 'Primero elija un profesional'
  if (!datos.fecha) return 'Primero elija una fecha'
  if (agendaProfesional.value === null) return 'Cargando horarios...'
  if (sinAgenda.value) return 'Sin horarios de atención cargados'
  if (rangosDelDia.value.length === 0) return 'No atiende ese día'
  if (horariosLibres.value.length === 0) return 'No hay horarios libres ese día'
  return 'Seleccione un horario'
})

const cargarAgenda = async () => {
  agendaProfesional.value = null
  if (!datos.profesionalId) return
  try {
    const { data } = await getHorarios(datos.profesionalId)
    agendaProfesional.value = data
  } catch (error) {
    console.error('Error cargando horarios del profesional:', error)
    errorGeneral.value = mensajeError(error)
  }
}

const cargarOcupados = async () => {
  if (!datos.profesionalId || !datos.fecha) {
    ocupados.value = []
    return
  }
  try {
    const { data } = await getTurnos({ profesionalId: datos.profesionalId, fecha: datos.fecha })
    ocupados.value = data
  } catch (error) {
    console.error('Error cargando turnos del profesional:', error)
    ocupados.value = []
    errorGeneral.value = mensajeError(error)
  }
}

// al cambiar de profesional o de fecha cambia la grilla: se limpia el horario elegido
watch(
  () => [datos.profesionalId, datos.fecha],
  () => {
    exito.value = ''
    errorGeneral.value = ''
    datos.horaInicio = ''
    cargarOcupados()
  }
)

// la agenda semanal solo depende del profesional
watch(() => datos.profesionalId, cargarAgenda)

const cargarProfesionales = async () => {
  try {
    const { data } = await getProfesionales({ estado: 'activo' })
    profesionales.value = data
  } catch (error) {
    console.error('Error cargando profesionales:', error)
    errorGeneral.value = mensajeError(error)
  }
}

const generar = async () => {
  errorGeneral.value = ''
  exito.value = ''
  if (!validarGenerar(datos, errores, hoy, horaActual())) return

  guardando.value = true
  try {
    const { data } = await crearTurno({
      profesionalId: Number(datos.profesionalId),
      fecha: datos.fecha,
      horaInicio: datos.horaInicio
    })
    exito.value = `Turno creado: ${formatearFecha(data.fecha)} de ${data.horaInicio} a ${data.horaFin}.`
    // se mantiene profesional y fecha; se refrescan los horarios libres
    // y se sugiere el siguiente si sigue libre
    await cargarOcupados()
    datos.horaInicio = horariosLibres.value.includes(data.horaFin) ? data.horaFin : ''
  } catch (error) {
    console.error('Error creando turno:', error)
    errorGeneral.value = mensajeError(error)
    // si fue un conflicto, la lista de horarios puede estar desactualizada
    if (error.response?.status === 409) cargarOcupados()
  } finally {
    guardando.value = false
  }
}

onMounted(() => {
  cargarProfesionales()
})
</script>
