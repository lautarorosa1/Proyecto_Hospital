<template>
  <section class="mt-8 rounded-xl border border-gray-200 p-5">
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <div>
        <h2 class="text-lg font-semibold text-gray-900">Lista de espera (entreturnos)</h2>
        <p class="text-xs text-gray-500">
          Si la agenda del día está completa y un paciente cancela, el horario se asigna
          automáticamente al primero de la cola y recepción recibe el aviso.
        </p>
      </div>
      <span class="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
        {{ cola.length }} en espera
      </span>
    </div>

    <form class="mb-4 flex flex-col gap-2 sm:flex-row" @submit.prevent="agregar">
      <select v-model="pacienteId" :class="inputClass" class="flex-1">
        <option value="">Seleccionar paciente a agregar…</option>
        <option v-for="p in pacientesDisponibles" :key="p.id" :value="p.id">
          {{ nombrePaciente(p) }} — DNI {{ p.dni }}
        </option>
      </select>
      <button
        type="submit"
        :disabled="agregando || !pacienteId"
        class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
      >
        {{ agregando ? 'Agregando…' : 'Agregar a la lista' }}
      </button>
    </form>

    <p v-if="error" class="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ error }}</p>

    <ol v-if="cola.length" class="divide-y divide-gray-100 rounded-lg border border-gray-100">
      <li v-for="item in cola" :key="item.id" class="flex items-center gap-3 px-4 py-2.5 text-sm">
        <span
          class="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white"
        >
          {{ item.posicion }}
        </span>
        <span class="text-gray-800">{{ nombrePacienteDe(pacientesPorId, item.pacienteId) }}</span>
        <span v-if="item.posicion === 1" class="ml-auto text-xs font-medium text-indigo-600">
          Próximo en recibir un horario
        </span>
      </li>
    </ol>
    <p v-else class="text-sm text-gray-400">No hay pacientes en la lista de espera de este día.</p>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { getListaEspera, agregarAListaEspera } from '../services/turnoService'
import { nombrePaciente, nombrePacienteDe, mensajeError } from '@/shared/utils/formato'

const inputClass =
  'rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

const props = defineProps({
  profesionalId: { type: [Number, String], required: true },
  fecha: { type: String, required: true },
  pacientes: { type: Array, default: () => [] }
})

const emit = defineEmits(['agregado'])

const cola = ref([])
const pacienteId = ref('')
const agregando = ref(false)
const error = ref('')

const pacientesPorId = computed(() => Object.fromEntries(props.pacientes.map((p) => [p.id, p])))

// los que ya esperan no se vuelven a ofrecer
const pacientesDisponibles = computed(() => {
  const enCola = new Set(cola.value.map((c) => c.pacienteId))
  return props.pacientes.filter((p) => !enCola.has(p.id))
})

const recargar = async () => {
  try {
    cola.value = (
      await getListaEspera({ profesionalId: props.profesionalId, fecha: props.fecha })
    ).data
  } catch (e) {
    console.error('Error cargando la lista de espera:', e)
    cola.value = []
  }
}

const agregar = async () => {
  error.value = ''
  agregando.value = true
  try {
    await agregarAListaEspera({
      profesionalId: Number(props.profesionalId),
      pacienteId: Number(pacienteId.value),
      fecha: props.fecha
    })
    pacienteId.value = ''
    await recargar()
    emit('agregado')
  } catch (e) {
    // 409: todavía hay horarios disponibles, el paciente ya está en la cola, etc.
    error.value = mensajeError(e, 'No se pudo agregar a la lista de espera')
  } finally {
    agregando.value = false
  }
}

watch(() => [props.profesionalId, props.fecha], recargar)
onMounted(recargar)

defineExpose({ recargar })
</script>
