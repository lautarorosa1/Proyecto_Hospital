<template>
  <form class="flex flex-col gap-5" @submit.prevent="emit('submit')">
    <div class="flex flex-col gap-1.5">
      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-gray-700">Nombre</label>
        <small class="text-xs text-red-500">{{ errores.nombre }}</small>
      </div>
      <input v-model="profesional.nombre" type="text" :class="inputClass" />
    </div>

    <div class="flex flex-col gap-1.5">
      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-gray-700">Apellido</label>
        <small class="text-xs text-red-500">{{ errores.apellido }}</small>
      </div>
      <input v-model="profesional.apellido" type="text" :class="inputClass" />
    </div>

    <div class="flex flex-col gap-1.5">
      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-gray-700">DNI</label>
        <small class="text-xs text-red-500">{{ errores.dni }}</small>
      </div>
      <input v-model="profesional.dni" type="text" inputmode="numeric" :class="inputClass" />
    </div>

    <div class="flex flex-col gap-1.5">
      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-gray-700">Email</label>
        <small class="text-xs text-red-500">{{ errores.email }}</small>
      </div>
      <input v-model="profesional.email" type="email" :class="inputClass" />
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-gray-700">
        Teléfono <span class="font-normal text-gray-400">(opcional)</span>
      </label>
      <input v-model="profesional.telefono" type="tel" :class="inputClass" />
    </div>

    <div class="flex flex-col gap-1.5">
      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-gray-700">Matrícula</label>
        <small class="text-xs text-red-500">{{ errores.matricula }}</small>
      </div>
      <input v-model="profesional.matricula" type="text" :class="inputClass" />
    </div>

    <div class="flex flex-col gap-1.5">
      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-gray-700">Tipo de profesional</label>
        <small class="text-xs text-red-500">{{ errores.tipoProfesional }}</small>
      </div>
      <select v-model="profesional.tipoProfesional" :class="inputClass">
        <option value="" disabled>Seleccione una opción</option>
        <option v-for="tipo in TIPOS_PROFESIONAL" :key="tipo.value" :value="tipo.value">
          {{ tipo.label }}
        </option>
      </select>
    </div>

    <!-- TODO: cuando existan los servicios de Especialidad y Usuario (otros módulos),
         reemplazar estos inputs numéricos por <select> con sus listados. -->
    <div class="flex flex-col gap-1.5">
      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-gray-700">ID de especialidad</label>
        <small class="text-xs text-red-500">{{ errores.especialidadId }}</small>
      </div>
      <input
        v-model.number="profesional.especialidadId"
        type="number"
        min="1"
        step="1"
        :class="inputClass"
      />
    </div>

    <div class="flex flex-col gap-1.5">
      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-gray-700">ID de usuario</label>
        <small class="text-xs text-red-500">{{ errores.usuarioId }}</small>
      </div>
      <input
        v-model.number="profesional.usuarioId"
        type="number"
        min="1"
        step="1"
        :class="inputClass"
      />
    </div>

    <div class="flex flex-col gap-1.5">
      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-gray-700">Duración de cada turno (minutos)</label>
        <small class="text-xs text-red-500">{{ errores.duracionTurnoMin }}</small>
      </div>
      <input
        v-model.number="profesional.duracionTurnoMin"
        type="number"
        min="5"
        max="240"
        step="5"
        :class="inputClass"
      />
    </div>

    <div v-if="mostrarEstado" class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-gray-700">Estado</label>
      <select v-model="profesional.estado" :class="inputClass">
        <option v-for="estado in ESTADOS_PROFESIONAL" :key="estado.value" :value="estado.value">
          {{ estado.label }}
        </option>
      </select>
    </div>

    <p v-if="errorGeneral" class="text-sm text-red-500">{{ errorGeneral }}</p>

    <div class="mt-2 flex justify-end">
      <button
        type="submit"
        :disabled="guardando"
        class="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
      >
        {{ textoBoton }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { TIPOS_PROFESIONAL, ESTADOS_PROFESIONAL } from '../utils/profesionalForm'

// Formulario compartido por Crear y Editar. El estado (valores y errores)
// vive en la vista que lo usa; este componente solo lo muestra.
const profesional = defineModel({ type: Object, required: true })

defineProps({
  errores: { type: Object, required: true },
  errorGeneral: { type: String, default: '' },
  guardando: { type: Boolean, default: false },
  mostrarEstado: { type: Boolean, default: false },
  textoBoton: { type: String, default: 'Guardar' }
})

const emit = defineEmits(['submit'])

const inputClass =
  'rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
</script>
