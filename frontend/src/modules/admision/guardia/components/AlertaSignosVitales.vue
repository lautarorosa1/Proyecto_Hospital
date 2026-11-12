<template>
  <div
    v-if="alertas.length"
    class="fixed inset-x-0 bottom-0 z-[60] flex flex-col gap-3 p-4"
    role="alert"
    aria-live="assertive"
  >
    <div
      v-for="alerta in alertas"
      :key="alerta.signosVitalesId"
      class="mx-auto w-full max-w-3xl rounded-xl bg-orange-500 p-4 text-white shadow-2xl ring-4 ring-orange-200"
    >
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-sm font-bold uppercase tracking-widest">
            ⚠ Signos vitales fuera de rango
          </p>
          <p class="mt-1 text-xl font-bold">
            {{ nombrePaciente(alerta.pacienteId) }} · {{ alerta.temperatura }} °C
          </p>
          <p class="mt-1 text-sm">
            Internación #{{ alerta.internacionId }}
            <template v-if="alerta.sector"> · Sector {{ alerta.sector }}</template>
            <template v-if="alerta.camaId"> · Cama #{{ alerta.camaId }}</template>
          </p>
          <p class="mt-1 text-xs text-orange-100">
            Registrado a las {{ formatearHora(alerta.timestamp) }}
          </p>
        </div>
        <button
          type="button"
          class="shrink-0 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-orange-700 shadow-sm transition hover:bg-orange-50"
          @click="emit('descartar', alerta.signosVitalesId)"
        >
          Entendido
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatearHora } from '../utils/guardiaForm'
import { nombrePacienteDe } from '@/shared/utils/formato'

// Alertas clínicas de Enfermería (temperatura > 39 °C) recibidas por SSE;
// quedan a la vista hasta que el médico las descarta.
const props = defineProps({
  alertas: { type: Array, default: () => [] },
  pacientesPorId: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['descartar'])

const nombrePaciente = (id) => nombrePacienteDe(props.pacientesPorId, id)
</script>
