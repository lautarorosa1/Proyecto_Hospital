<template>
  <div
    v-if="modelValue && turno"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    @click.self="cerrar"
  >
    <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
      <h2 class="text-lg font-semibold text-gray-900">Reservar turno</h2>

      <p class="mt-1 text-sm text-gray-500">
        {{ formatearFecha(turno.fecha) }} · {{ turno.horaInicio }} – {{ turno.horaFin }}
        <br />
        {{ nombreProfesional(profesional) }}
      </p>

      <div class="mt-5 flex flex-col gap-2">
        <label class="text-sm font-medium text-gray-700">Paciente</label>
        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar por apellido, nombre o DNI"
          class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />

        <ul class="max-h-48 divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200">
          <li v-for="paciente in pacientesFiltrados" :key="paciente.id">
            <button
              type="button"
              class="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-gray-50"
              :class="pacienteId === paciente.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'"
              @click="pacienteId = paciente.id"
            >
              <span>{{ nombrePaciente(paciente) }}</span>
              <span class="text-xs text-gray-400">DNI {{ paciente.dni }}</span>
            </button>
          </li>

          <li v-if="pacientesFiltrados.length === 0" class="px-3 py-4 text-center text-sm text-gray-400">
            No se encontraron pacientes
          </li>
        </ul>

        <router-link to="/pacientes/create" class="text-xs text-indigo-600 hover:underline">
          ¿No está registrado? Crear paciente
        </router-link>
      </div>

      <p v-if="error" class="mt-4 text-sm text-red-500">{{ error }}</p>

      <div class="mt-6 flex justify-end gap-3">
        <button
          type="button"
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          @click="cerrar"
        >
          Cancelar
        </button>

        <button
          type="button"
          :disabled="pacienteId === null || reservando"
          class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
          @click="reservar"
        >
          Reservar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { reservarTurno } from '../services/turnoService'
import { formatearFecha, nombreProfesional, nombrePaciente, mensajeError } from '../utils/turnoForm'

const props = defineProps({
  modelValue: Boolean,
  turno: { type: Object, default: null },
  profesional: { type: Object, default: null },
  pacientes: { type: Array, default: () => [] }
})

// reservado: la reserva se hizo. conflicto: otro usuario modificó el turno (409);
// el padre debería refrescar la lista.
const emit = defineEmits(['update:modelValue', 'reservado', 'conflicto'])

const busqueda = ref('')
const pacienteId = ref(null)
const error = ref('')
const reservando = ref(false)

// cada vez que se abre, arranca limpio
watch(
  () => props.modelValue,
  (abierto) => {
    if (abierto) {
      busqueda.value = ''
      pacienteId.value = null
      error.value = ''
    }
  }
)

const pacientesFiltrados = computed(() => {
  const texto = busqueda.value.trim().toLowerCase()
  if (!texto) return props.pacientes
  return props.pacientes.filter((p) =>
    `${p.apellido} ${p.nombre} ${p.dni}`.toLowerCase().includes(texto)
  )
})

const cerrar = () => emit('update:modelValue', false)

const reservar = async () => {
  error.value = ''
  reservando.value = true
  try {
    // se envía la versión que se vio al listar: si cambió, el backend responde 409
    await reservarTurno(props.turno.id, {
      pacienteId: pacienteId.value,
      version: props.turno.version
    })
    emit('reservado')
    cerrar()
  } catch (e) {
    console.error('Error reservando turno:', e)
    const mensaje = mensajeError(e)
    if (e.response?.status === 409) {
      emit('conflicto', mensaje)
      cerrar()
    } else {
      error.value = mensaje
    }
  } finally {
    reservando.value = false
  }
}
</script>
