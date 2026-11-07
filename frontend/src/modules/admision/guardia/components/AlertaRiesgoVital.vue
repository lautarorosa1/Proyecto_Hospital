<template>
  <div
    v-if="alertas.length"
    class="fixed inset-x-0 top-0 z-[60] flex flex-col gap-3 p-4"
    role="alert"
    aria-live="assertive"
  >
    <div
      v-for="alerta in alertas"
      :key="alerta.ingresoId"
      class="mx-auto w-full max-w-3xl animate-pulse rounded-xl bg-red-600 p-5 text-white shadow-2xl ring-4 ring-red-300"
    >
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-sm font-bold uppercase tracking-widest">
            ⚠ Código Rojo · {{ alerta.etiquetaNivel }}
          </p>
          <p class="mt-1 text-2xl font-bold">{{ alerta.pacienteNombre }}</p>
          <p class="mt-1 text-base">{{ alerta.motivoConsulta }}</p>
          <p class="mt-2 text-xs text-red-100">
            Ingresó a las {{ formatearHora(alerta.ingresadoEn) }} · primero en la cola de espera
          </p>
        </div>

        <button
          type="button"
          class="shrink-0 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-50"
          @click="emit('descartar', alerta.ingresoId)"
        >
          Entendido
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatearHora } from '../utils/guardiaForm'

// Alertas de Riesgo Vital recibidas por SSE; quedan a la vista hasta que el médico las descarta.
defineProps({
  alertas: { type: Array, default: () => [] }
})

const emit = defineEmits(['descartar'])
</script>
