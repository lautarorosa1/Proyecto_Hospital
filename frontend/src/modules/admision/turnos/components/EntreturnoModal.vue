<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    @click.self="cerrar"
  >
    <div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
      <h2 class="text-lg font-semibold text-gray-900">Insertar entreturno</h2>
      <p class="mt-1 text-sm text-gray-500">
        Para urgencias menores. Si el horario se superpone con turnos existentes, se les reduce el
        tiempo de atención para hacerle lugar.
      </p>

      <div class="mt-5 grid gap-4 sm:grid-cols-2">
        <div class="flex flex-col gap-1.5 sm:col-span-2">
          <label class="text-sm font-medium text-gray-700">Profesional</label>
          <select v-model="datos.profesionalId" :class="inputClass">
            <option value="">Seleccione…</option>
            <option v-for="p in profesionales" :key="p.id" :value="p.id">
              {{ nombreProfesional(p) }}
            </option>
          </select>
          <p v-if="errores.profesionalId" class="text-xs text-red-500">
            {{ errores.profesionalId }}
          </p>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-700">Fecha</label>
          <input v-model="datos.fecha" type="date" :min="hoy" :class="inputClass" />
          <p v-if="errores.fecha" class="text-xs text-red-500">{{ errores.fecha }}</p>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-700">Hora de inicio</label>
          <input v-model="datos.horaInicio" type="time" step="300" :class="inputClass" />
          <p v-if="errores.horaInicio" class="text-xs text-red-500">{{ errores.horaInicio }}</p>
        </div>

        <div class="flex flex-col gap-1.5 sm:col-span-2">
          <label class="text-sm font-medium text-gray-700">Duración (min)</label>
          <input
            v-model.number="datos.duracionMin"
            type="number"
            :min="ENTRETURNO_DURACION_MIN"
            :max="ENTRETURNO_DURACION_MAX"
            step="5"
            :class="inputClass"
          />
          <p v-if="errores.duracionMin" class="text-xs text-red-500">{{ errores.duracionMin }}</p>
          <p v-else-if="horaFin" class="text-xs text-gray-500">
            Ocupará de {{ datos.horaInicio }} a {{ horaFin }}
          </p>
        </div>
      </div>

      <div class="mt-5 flex flex-col gap-2">
        <label class="text-sm font-medium text-gray-700">Paciente</label>
        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar por apellido, nombre o DNI"
          :class="inputClass"
        />

        <ul class="max-h-40 divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200">
          <li v-for="paciente in pacientesFiltrados" :key="paciente.id">
            <button
              type="button"
              class="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-gray-50"
              :class="datos.pacienteId === paciente.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'"
              @click="datos.pacienteId = paciente.id"
            >
              <span>{{ nombrePaciente(paciente) }}</span>
              <span class="text-xs text-gray-400">DNI {{ paciente.dni }}</span>
            </button>
          </li>

          <li v-if="pacientesFiltrados.length === 0" class="px-3 py-4 text-center text-sm text-gray-400">
            No se encontraron pacientes
          </li>
        </ul>
        <p v-if="errores.pacienteId" class="text-xs text-red-500">{{ errores.pacienteId }}</p>

        <router-link to="/pacientes/create" class="text-xs text-indigo-600 hover:underline">
          ¿No está registrado? Crear paciente
        </router-link>
      </div>

      <p v-if="error" class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-red-200">
        {{ error }}
      </p>

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
          :disabled="guardando"
          class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
          @click="guardar"
        >
          {{ guardando ? 'Insertando…' : 'Insertar entreturno' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { hoyISO } from '@/shared/utils/validators'
import { crearEntreturno } from '../services/turnoService'
import {
  ENTRETURNO_DURACION_MIN,
  ENTRETURNO_DURACION_MAX,
  entreturnoVacio,
  erroresEntreturnoVacios,
  validarEntreturno,
  horaActual,
  calcularHoraFin,
  nombreProfesional,
  nombrePaciente,
  mensajeError
} from '../utils/turnoForm'

const inputClass =
  'rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

const props = defineProps({
  modelValue: Boolean,
  profesionales: { type: Array, default: () => [] }, // solo activos
  pacientes: { type: Array, default: () => [] },
  // valores iniciales tomados de los filtros de la agenda
  profesionalId: { type: [Number, String], default: '' },
  fecha: { type: String, default: '' }
})

// creado: recibe la respuesta del backend { entreturno, afectados, advertencias }
// conflicto: el backend rechazó por estado de la agenda (409); el padre refresca la lista
const emit = defineEmits(['update:modelValue', 'creado', 'conflicto'])

const hoy = hoyISO()
const datos = reactive(entreturnoVacio())
const errores = reactive(erroresEntreturnoVacios())
const busqueda = ref('')
const error = ref('')
const guardando = ref(false)

// cada vez que se abre, arranca limpio con los filtros de la agenda
watch(
  () => props.modelValue,
  (abierto) => {
    if (!abierto) return
    Object.assign(datos, entreturnoVacio(), {
      profesionalId: props.profesionalId,
      fecha: props.fecha || hoy
    })
    Object.assign(errores, erroresEntreturnoVacios())
    busqueda.value = ''
    error.value = ''
  }
)

const horaFin = computed(() =>
  datos.horaInicio ? calcularHoraFin(datos.horaInicio, datos.duracionMin) : ''
)

const pacientesFiltrados = computed(() => {
  const texto = busqueda.value.trim().toLowerCase()
  if (!texto) return props.pacientes
  return props.pacientes.filter((p) =>
    `${p.apellido} ${p.nombre} ${p.dni}`.toLowerCase().includes(texto)
  )
})

const cerrar = () => emit('update:modelValue', false)

const guardar = async () => {
  error.value = ''
  if (!validarEntreturno(datos, errores, hoy, horaActual())) return

  guardando.value = true
  try {
    const response = await crearEntreturno({
      profesionalId: Number(datos.profesionalId),
      pacienteId: datos.pacienteId,
      fecha: datos.fecha,
      horaInicio: datos.horaInicio,
      duracionMin: Number(datos.duracionMin)
    })
    emit('creado', response.data)
    cerrar()
  } catch (e) {
    console.error('Error insertando entreturno:', e)
    // Se queda abierto para poder corregir hora/duración con el mensaje a la vista
    error.value = mensajeError(e, 'No se pudo insertar el entreturno')
    if (e.response?.status === 409) emit('conflicto')
  } finally {
    guardando.value = false
  }
}
</script>
