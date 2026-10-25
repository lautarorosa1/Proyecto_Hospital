<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
      <router-link to="/profesionales" class="text-sm text-indigo-600 hover:underline">
        ← Volver a profesionales
      </router-link>

      <h1 class="mb-1 mt-3 text-2xl font-semibold text-gray-900">Horarios de atención</h1>

      <div v-if="cargando" class="py-10 text-center text-sm text-gray-400">Cargando...</div>

      <template v-else-if="profesional">
        <p class="mb-6 text-sm text-gray-500">
          {{ profesional.apellido }}, {{ profesional.nombre }} · turnos de
          {{ profesional.duracionTurnoMin }} min
        </p>

        <div class="flex flex-col divide-y divide-gray-100">
          <div v-for="dia in DIAS_SEMANA" :key="dia.value" class="py-4">
            <div class="flex items-start justify-between gap-4">
              <div class="w-24 pt-2 text-sm font-medium text-gray-700">{{ dia.label }}</div>

              <div class="flex flex-1 flex-col gap-2">
                <p v-if="agenda[dia.value].length === 0" class="pt-2 text-sm text-gray-400">
                  No atiende
                </p>

                <div
                  v-for="(rango, i) in agenda[dia.value]"
                  :key="i"
                  class="flex items-center gap-2"
                >
                  <input v-model="rango.horaDesde" type="time" :class="inputClass" />
                  <span class="text-gray-400">a</span>
                  <input v-model="rango.horaHasta" type="time" :class="inputClass" />
                  <button
                    type="button"
                    class="rounded-md px-2 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                    @click="quitarRango(dia.value, i)"
                  >
                    Quitar
                  </button>
                </div>

                <p v-if="erroresDia[dia.value]" class="text-xs text-red-500">
                  {{ erroresDia[dia.value] }}
                </p>

                <div>
                  <button
                    type="button"
                    class="text-xs font-medium text-indigo-600 hover:underline"
                    @click="agregarRango(dia.value)"
                  >
                    + Agregar rango
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p v-if="exito" class="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {{ exito }}
        </p>
        <p v-if="errorGeneral" class="mt-4 text-sm text-red-500">{{ errorGeneral }}</p>

        <div class="mt-6 flex justify-end">
          <button
            type="button"
            :disabled="guardando"
            class="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
            @click="guardar"
          >
            Guardar horarios
          </button>
        </div>
      </template>

      <p v-else class="py-10 text-center text-sm text-red-500">{{ errorGeneral }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getProfesionalById, getHorarios, guardarHorarios } from '../services/profesionalService'
import {
  DIAS_SEMANA,
  agendaVacia,
  agendaDesdeLista,
  listaDesdeAgenda,
  validarAgenda
} from '../utils/horariosForm'

const inputClass =
  'rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

const route = useRoute()

const profesional = ref(null)
const agenda = reactive(agendaVacia())
const erroresDia = reactive({})
const cargando = ref(true)
const guardando = ref(false)
const errorGeneral = ref('')
const exito = ref('')

const mensajeError = (error) =>
  error.response
    ? error.response.data?.error || 'Ocurrió un error inesperado'
    : 'No se pudo conectar con el servidor'

const cargar = async () => {
  try {
    const [resProfesional, resHorarios] = await Promise.all([
      getProfesionalById(route.params.id),
      getHorarios(route.params.id)
    ])
    profesional.value = resProfesional.data
    Object.assign(agenda, agendaDesdeLista(resHorarios.data))
  } catch (error) {
    console.error('Error cargando horarios:', error)
    errorGeneral.value = mensajeError(error)
  } finally {
    cargando.value = false
  }
}

const agregarRango = (dia) => {
  exito.value = ''
  agenda[dia].push({ horaDesde: '', horaHasta: '' })
}

const quitarRango = (dia, indice) => {
  exito.value = ''
  agenda[dia].splice(indice, 1)
}

const guardar = async () => {
  errorGeneral.value = ''
  exito.value = ''

  // limpia errores previos y valida
  for (const clave of Object.keys(erroresDia)) delete erroresDia[clave]
  Object.assign(erroresDia, validarAgenda(agenda, profesional.value.duracionTurnoMin))
  if (Object.keys(erroresDia).length > 0) return

  guardando.value = true
  try {
    const { data } = await guardarHorarios(route.params.id, listaDesdeAgenda(agenda))
    Object.assign(agenda, agendaDesdeLista(data))
    exito.value = 'Horarios guardados'
  } catch (error) {
    console.error('Error guardando horarios:', error)
    errorGeneral.value = mensajeError(error)
  } finally {
    guardando.value = false
  }
}

onMounted(() => {
  cargar()
})
</script>
