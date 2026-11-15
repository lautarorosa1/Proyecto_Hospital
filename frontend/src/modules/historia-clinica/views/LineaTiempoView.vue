<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import {
  obtenerPacientePorId,
  obtenerEventosClinicos
} from '../services/historiaClinicaService'
import { mensajeError } from '@/shared/utils/formato'

const route = useRoute()
const pacienteId = route.params.id

const paciente = ref(null)
const eventos = ref([])
const cargando = ref(true)
const error = ref('')
const filtro = ref('TODOS')

// Cada hecho clínico que publican Admisión y Enfermería queda registrado en la historia
const TIPOS = {
  INGRESO: { etiqueta: 'Ingreso', icono: '🏥', clase: 'bg-blue-50 text-blue-700 ring-blue-200' },
  SIGNOS_VITALES: { etiqueta: 'Signos vitales', icono: '❤️', clase: 'bg-teal-50 text-teal-700 ring-teal-200' },
  MEDICACION_ADMINISTRADA: { etiqueta: 'Medicación', icono: '💊', clase: 'bg-purple-50 text-purple-700 ring-purple-200' },
  ALTA: { etiqueta: 'Alta', icono: '✅', clase: 'bg-green-50 text-green-700 ring-green-200' }
}

const tipoDe = (tipo) =>
  TIPOS[tipo] ?? { etiqueta: tipo, icono: '•', clase: 'bg-gray-50 text-gray-700 ring-gray-200' }

const eventosFiltrados = computed(() =>
  filtro.value === 'TODOS' ? eventos.value : eventos.value.filter((e) => e.tipo === filtro.value)
)

const alertas = computed(() => eventos.value.filter((e) => e.alerta).length)

const fechaHora = (iso) => new Date(iso).toLocaleString('es-AR')

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    const [resPaciente, lista] = await Promise.all([
      obtenerPacientePorId(pacienteId),
      obtenerEventosClinicos(pacienteId)
    ])
    paciente.value = resPaciente.data
    eventos.value = lista
  } catch (err) {
    console.error(err)
    error.value = mensajeError(err, 'No se pudo cargar la línea de tiempo.')
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)
</script>

<template>
  <main class="mx-auto max-w-3xl p-8">
    <RouterLink :to="`/historia-clinica/${pacienteId}`" class="text-sm text-indigo-600 hover:underline">
      ← Volver a Historia Clínica
    </RouterLink>

    <h1 class="mb-1 mt-4 text-2xl font-bold text-gray-900">Línea de tiempo clínica</h1>
    <p v-if="paciente" class="mb-6 text-sm text-gray-500">
      {{ paciente.nombre }} {{ paciente.apellido }} · DNI {{ paciente.dni }}
    </p>

    <p v-if="cargando" class="text-gray-500">Cargando…</p>
    <p v-else-if="error" class="rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ error }}</p>

    <template v-else>
      <div class="mb-5 flex flex-wrap items-center gap-3">
        <select v-model="filtro" class="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="TODOS">Todos los eventos</option>
          <option v-for="(info, clave) in TIPOS" :key="clave" :value="clave">
            {{ info.etiqueta }}
          </option>
        </select>
        <button
          type="button"
          class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          @click="cargar"
        >
          Actualizar
        </button>
        <span v-if="alertas" class="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
          ⚠ {{ alertas }} registro{{ alertas === 1 ? '' : 's' }} con alerta
        </span>
      </div>

      <p v-if="eventosFiltrados.length === 0" class="text-gray-500">
        Todavía no hay eventos clínicos registrados para este paciente.
      </p>

      <ol v-else class="space-y-3">
        <li
          v-for="evento in eventosFiltrados"
          :key="evento.id"
          class="rounded-xl border bg-white p-4 shadow-sm"
          :class="evento.alerta ? 'border-red-300 bg-red-50' : 'border-gray-200'"
        >
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span
              class="rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset"
              :class="tipoDe(evento.tipo).clase"
            >
              {{ tipoDe(evento.tipo).icono }} {{ tipoDe(evento.tipo).etiqueta }}
            </span>
            <span class="text-xs text-gray-500">{{ fechaHora(evento.fecha) }}</span>
          </div>
          <p class="mt-2 text-sm text-gray-800">{{ evento.resumen }}</p>
          <p v-if="evento.alerta" class="mt-1 text-xs font-semibold text-red-700">
            ⚠ Valores fuera de rango
          </p>
        </li>
      </ol>
    </template>
  </main>
</template>
