<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-5xl rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
      <router-link to="/admision" class="text-sm text-indigo-600 hover:underline">
        ← Volver a Admisión
      </router-link>

      <div class="mb-6 mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-2xl font-semibold text-gray-900">Guardia · Triaje y cola de espera</h1>

        <div class="flex flex-wrap gap-2">
          <router-link to="/guardia/monitor">
            <button
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Monitor de médicos
            </button>
          </router-link>

          <button
            type="button"
            class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
            @click="abrirIngreso"
          >
            Registrar ingreso
          </button>
        </div>
      </div>

      <p
        v-if="aviso"
        class="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 ring-1 ring-green-200"
        role="status"
      >
        {{ aviso }}
      </p>

      <ColaGuardiaTabla :cola="cola" :pacientesPorId="pacientesPorId" />

      <p v-if="errorCola" class="mt-6 text-center text-sm text-red-500">{{ errorCola }}</p>
    </div>
  </div>

  <IngresoGuardiaModal
    v-model="mostrarIngreso"
    :enfermeros="enfermeros"
    :pacientes="pacientes"
    @registrado="alRegistrar"
    @conflicto="cargarCola"
  />
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { getProfesionales } from '../../profesionales/services/profesionalService'
import { getPacientes } from '../../pacientes/services/pacienteService'
import { getColaGuardia } from '../services/guardiaService'
import { mensajeRegistro } from '../utils/guardiaForm'
import { mensajeError } from '@/shared/utils/formato'
import ColaGuardiaTabla from '../components/ColaGuardiaTabla.vue'
import IngresoGuardiaModal from '../components/IngresoGuardiaModal.vue'

// La cola cambia por otros usuarios (otro enfermero, un médico que atiende): se refresca sola.
const REFRESCO_MS = 15000

const cola = ref([])
const pacientes = ref([])
const enfermeros = ref([])
const errorCola = ref('')
const aviso = ref('')
const mostrarIngreso = ref(false)
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

const cargarReferencias = async () => {
  try {
    const [resPacientes, resEnfermeros] = await Promise.all([
      getPacientes(),
      getProfesionales({ tipoProfesional: 'enfermero', estado: 'activo' })
    ])
    pacientes.value = resPacientes.data
    enfermeros.value = resEnfermeros.data
  } catch (error) {
    console.error('Error cargando pacientes y enfermeros:', error)
    errorCola.value = mensajeError(error)
  }
}

const abrirIngreso = () => {
  aviso.value = ''
  mostrarIngreso.value = true
}

const alRegistrar = (resultado) => {
  aviso.value = mensajeRegistro(resultado)
  cargarCola()
}

onMounted(async () => {
  await cargarReferencias()
  await cargarCola()
  temporizador = setInterval(cargarCola, REFRESCO_MS)
})

onBeforeUnmount(() => clearInterval(temporizador))
</script>
