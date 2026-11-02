<template>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse text-left text-sm">
      <thead>
        <tr class="border-b border-gray-200 text-gray-500">
          <th class="px-4 py-3 font-medium">Pos.</th>
          <th class="px-4 py-3 font-medium">Nivel</th>
          <th class="px-4 py-3 font-medium">Paciente</th>
          <th class="px-4 py-3 font-medium">Motivo de consulta</th>
          <th class="px-4 py-3 font-medium">Ingreso</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="item in cola"
          :key="item.id"
          class="border-b border-gray-100 text-gray-700 transition hover:bg-gray-50"
          :class="item.nivelTriaje === 'rojo' ? 'bg-red-50' : ''"
        >
          <td class="px-4 py-3 font-semibold">{{ item.posicion }}</td>
          <td class="px-4 py-3">
            <span
              class="rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset"
              :class="claseNivel(item.nivelTriaje)"
            >
              {{ etiquetaNivel(item.nivelTriaje) }}
            </span>
          </td>
          <td class="px-4 py-3">{{ nombrePacienteDe(pacientesPorId, item.pacienteId) }}</td>
          <td class="px-4 py-3">{{ item.motivoConsulta }}</td>
          <td class="px-4 py-3">{{ formatearHora(item.ingresadoEn) }}</td>
        </tr>
      </tbody>
    </table>

    <p v-if="cola.length === 0" class="mt-6 text-center text-sm text-gray-400">
      No hay pacientes en la cola de espera
    </p>
  </div>
</template>

<script setup>
import { claseNivel, etiquetaNivel, formatearHora, nombrePacienteDe } from '../utils/guardiaForm'

defineProps({
  cola: { type: Array, default: () => [] },
  pacientesPorId: { type: Object, default: () => ({}) }
})
</script>
