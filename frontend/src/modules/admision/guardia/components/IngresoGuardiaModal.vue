<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    @click.self="cerrar"
  >
    <div class="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
      <h2 class="text-lg font-semibold text-gray-900">Registrar ingreso a guardia</h2>
      <p class="mt-1 text-sm text-gray-500">
        Paciente sin turno previo. El nivel de triaje define su lugar en la cola; un Riesgo Vital
        pasa primero y alerta a los médicos de guardia.
      </p>

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

      <div class="mt-5 flex flex-col gap-1.5">
        <label class="text-sm font-medium text-gray-700">Enfermero que realiza el triaje</label>
        <select v-model="datos.enfermeroId" :class="inputClass">
          <option value="">Seleccione…</option>
          <option v-for="e in enfermeros" :key="e.id" :value="e.id">
            {{ nombreProfesional(e) }}
          </option>
        </select>
        <p v-if="errores.enfermeroId" class="text-xs text-red-500">{{ errores.enfermeroId }}</p>
      </div>

      <div class="mt-5 flex flex-col gap-2">
        <label class="text-sm font-medium text-gray-700">Nivel de triaje</label>
        <div class="grid gap-2 sm:grid-cols-5">
          <button
            v-for="nivel in NIVELES_TRIAJE"
            :key="nivel.value"
            type="button"
            class="rounded-lg border border-gray-200 px-2 py-2 text-center text-xs font-medium text-gray-700 transition hover:bg-gray-50"
            :class="datos.nivelTriaje === nivel.value ? nivel.seleccion : ''"
            @click="datos.nivelTriaje = nivel.value"
          >
            <span
              class="mb-1 block rounded-full px-2 py-0.5 ring-1 ring-inset"
              :class="nivel.clase"
            >
              {{ nivel.codigo }}
            </span>
            {{ nivel.label }}
          </button>
        </div>
        <p v-if="errores.nivelTriaje" class="text-xs text-red-500">{{ errores.nivelTriaje }}</p>
      </div>

      <div class="mt-5 flex flex-col gap-1.5">
        <label class="text-sm font-medium text-gray-700">Motivo de consulta</label>
        <input
          v-model="datos.motivoConsulta"
          type="text"
          :maxlength="MOTIVO_MAX"
          placeholder="Ej. dolor torácico intenso"
          :class="inputClass"
        />
        <p v-if="errores.motivoConsulta" class="text-xs text-red-500">{{ errores.motivoConsulta }}</p>
      </div>

      <div class="mt-4 flex flex-col gap-1.5">
        <label class="text-sm font-medium text-gray-700">Observaciones (opcional)</label>
        <textarea
          v-model="datos.observaciones"
          rows="3"
          :maxlength="OBSERVACIONES_MAX"
          :class="inputClass"
        ></textarea>
        <p v-if="errores.observaciones" class="text-xs text-red-500">{{ errores.observaciones }}</p>
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
          {{ guardando ? 'Registrando…' : 'Registrar ingreso' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { registrarIngreso } from '../services/guardiaService'
import {
  NIVELES_TRIAJE,
  MOTIVO_MAX,
  OBSERVACIONES_MAX,
  ingresoVacio,
  erroresIngresoVacios,
  validarIngreso
} from '../utils/guardiaForm'
import { nombreProfesional, nombrePaciente, mensajeError } from '@/shared/utils/formato'

const inputClass =
  'rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

const props = defineProps({
  modelValue: Boolean,
  enfermeros: { type: Array, default: () => [] }, // solo activos
  pacientes: { type: Array, default: () => [] }
})

// registrado: recibe la respuesta del backend { ingreso, desplazados, medicosAlertados }
// conflicto: el backend rechazó por estado (409, ej. paciente ya en guardia); el padre refresca la cola
const emit = defineEmits(['update:modelValue', 'registrado', 'conflicto'])

const datos = reactive(ingresoVacio())
const errores = reactive(erroresIngresoVacios())
const busqueda = ref('')
const error = ref('')
const guardando = ref(false)

// cada vez que se abre, arranca limpio
watch(
  () => props.modelValue,
  (abierto) => {
    if (!abierto) return
    Object.assign(datos, ingresoVacio())
    Object.assign(errores, erroresIngresoVacios())
    busqueda.value = ''
    error.value = ''
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

const guardar = async () => {
  error.value = ''
  if (!validarIngreso(datos, errores)) return

  guardando.value = true
  try {
    const observaciones = datos.observaciones.trim()
    const response = await registrarIngreso({
      pacienteId: datos.pacienteId,
      enfermeroId: Number(datos.enfermeroId),
      nivelTriaje: datos.nivelTriaje,
      motivoConsulta: datos.motivoConsulta.trim(),
      ...(observaciones && { observaciones })
    })
    emit('registrado', response.data)
    cerrar()
  } catch (e) {
    console.error('Error registrando ingreso a guardia:', e)
    // Se queda abierto para poder corregir con el mensaje a la vista
    error.value = mensajeError(e, 'No se pudo registrar el ingreso')
    if (e.response?.status === 409) emit('conflicto')
  } finally {
    guardando.value = false
  }
}
</script>
