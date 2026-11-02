<template>
  <AlertaRiesgoVital :alertas="alertas" @descartar="descartar" />

  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-5xl rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
      <router-link to="/guardia" class="text-sm text-indigo-600 hover:underline">
        ← Volver a Guardia
      </router-link>

      <div class="mb-6 mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Monitor de guardia</h1>
          <p class="mt-1 text-sm" :class="conectado ? 'text-green-600' : 'text-amber-600'">
            {{ conectado ? '● Recibiendo alertas en tiempo real' : '● Reconectando con el servidor…' }}
          </p>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-gray-500">Médico</label>
          <select v-model="profesionalId" :class="inputClass">
            <option value="">Todos (monitor general)</option>
            <option v-for="m in medicos" :key="m.id" :value="m.id">
              {{ nombreProfesional(m) }}
            </option>
          </select>
        </div>
      </div>

      <ColaGuardiaTabla :cola="cola" :pacientesPorId="pacientesPorId" />

      <p v-if="errorCola" class="mt-6 text-center text-sm text-red-500">{{ errorCola }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { getProfesionales } from '../../profesionales/services/profesionalService'
import { getPacientes } from '../../pacientes/services/pacienteService'
import { getColaGuardia } from '../services/guardiaService'
import { useAlertasGuardia } from '../composables/useAlertasGuardia'
import { nombreProfesional, mensajeError } from '../../turnos/utils/turnoForm'
import AlertaRiesgoVital from '../components/AlertaRiesgoVital.vue'
import ColaGuardiaTabla from '../components/ColaGuardiaTabla.vue'

const inputClass =
  'rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

const REFRESCO_MS = 15000

const route = useRoute()

const cola = ref([])
const pacientes = ref([])
const medicos = ref([])
const errorCola = ref('')
// el monitor de un médico se puede abrir directo con /guardia/monitor?profesionalId=7
const profesionalId = ref(route.query.profesionalId ? Number(route.query.profesionalId) : '')
let temporizador = null

const pacientesPorId = computed(() => Object.fromEntries(pacientes.value.map((p) => [p.id, p])))

const cargarCola = async () => {
  try {
    cola.value = (await getColaGuardia()).data
    errorCola.value = ''
  } catch (error) {
    console.error('Error cargando la cola de guardia:', error)
    errorCola.value = mensajeError(error)
  }
}

// Al llegar una alerta el paciente ya está en la cola: se refresca para mostrarlo primero.
// Los pacientes se recargan también, por si recién se creó el que ingresó.
const alAlerta = async () => {
  try {
    pacientes.value = (await getPacientes()).data
  } catch (error) {
    console.error('Error recargando pacientes:', error)
  }
  cargarCola()
}

const { alertas, conectado, descartar } = useAlertasGuardia(profesionalId, { onAlerta: alAlerta })

onMounted(async () => {
  try {
    const [resPacientes, resMedicos] = await Promise.all([
      getPacientes(),
      getProfesionales({ tipoProfesional: 'medico', estado: 'activo' })
    ])
    pacientes.value = resPacientes.data
    medicos.value = resMedicos.data
  } catch (error) {
    console.error('Error cargando pacientes y médicos:', error)
    errorCola.value = mensajeError(error)
  }
  await cargarCola()
  temporizador = setInterval(cargarCola, REFRESCO_MS)
})

onBeforeUnmount(() => clearInterval(temporizador))
</script>
