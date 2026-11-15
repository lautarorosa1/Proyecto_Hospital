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

    <div class="flex flex-col gap-1.5">
      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-gray-700">
          Usuario de acceso <span class="font-normal text-gray-400">(opcional)</span>
        </label>
        <small class="text-xs text-red-500">{{ errores.usuarioId }}</small>
      </div>
      <select v-model="profesional.usuarioId" :class="inputClass">
        <option value="">Sin usuario vinculado</option>
        <option v-for="usuario in usuarios" :key="usuario.id" :value="usuario.id">
          {{ usuario.apellido }}, {{ usuario.nombre }} — {{ usuario.email }}
        </option>
      </select>
      <p v-if="errorUsuarios" class="text-xs text-amber-600">{{ errorUsuarios }}</p>
      <p v-else class="text-xs text-gray-500">
        Elegí la cuenta con la que inicia sesión. Si dejás "Sin usuario" al crear, se vincula
        sola cuando existe un usuario con el mismo email.
      </p>
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
import { watch } from 'vue'
import { TIPOS_PROFESIONAL, ESTADOS_PROFESIONAL } from '../utils/profesionalForm'

// Formulario compartido por Crear y Editar. El estado (valores y errores)
// vive en la vista que lo usa; este componente solo lo muestra.
const profesional = defineModel({ type: Object, required: true })

const props = defineProps({
  errores: { type: Object, required: true },
  // Usuarios que se pueden vincular ({ id, nombre, apellido, email })
  usuarios: { type: Array, default: () => [] },
  errorUsuarios: { type: String, default: '' },
  // Al crear: preselecciona el usuario cuyo email coincide con el escrito
  sugerirPorEmail: { type: Boolean, default: false },
  errorGeneral: { type: String, default: '' },
  guardando: { type: Boolean, default: false },
  mostrarEstado: { type: Boolean, default: false },
  textoBoton: { type: String, default: 'Guardar' }
})

const emit = defineEmits(['submit'])

watch(
  () => [profesional.value.email, props.usuarios],
  () => {
    if (!props.sugerirPorEmail || profesional.value.usuarioId) return
    const email = (profesional.value.email || '').trim().toLowerCase()
    if (!email) return
    const coincidente = props.usuarios.find((u) => u.email?.toLowerCase() === email)
    if (coincidente) profesional.value.usuarioId = coincidente.id
  }
)

const inputClass =
  'rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
</script>
