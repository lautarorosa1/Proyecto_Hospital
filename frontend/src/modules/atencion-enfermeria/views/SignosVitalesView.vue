<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="mx-auto max-w-7xl">

      <!-- ENCABEZADO -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">
          Signos Vitales
        </h1>
        <p class="text-sm text-gray-500">
          Registro y seguimiento de controles de enfermería
        </p>
      </div>

      <!-- MENSAJES -->
      <p
        v-if="mensaje"
        class="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700"
      >
        {{ mensaje }}
      </p>

      <p
        v-if="error"
        class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
      >
        {{ error }}
      </p>

      <!-- SELECCIÓN DE INTERNACIÓN -->
      <div class="mb-6 rounded-xl bg-white p-6 shadow-sm">
        <label class="mb-2 block text-sm font-semibold">
          Seleccionar internación
        </label>

        <select
          v-model="internacionSeleccionada"
          @change="cargarSignosVitales"
          class="w-full rounded-lg border border-gray-300 p-3"
        >
          <option value="">
            Seleccionar una internación
          </option>

          <option
            v-for="internacion in internacionesActivas"
            :key="internacion.id"
            :value="internacion.id"
          >
            Internación #{{ internacion.id }}
            — Paciente:
            {{ obtenerNombrePaciente(internacion.pacienteId) }}
          </option>
        </select>

        <p
          v-if="internacionesActivas.length === 0"
          class="mt-2 text-sm text-amber-600"
        >
          No hay internaciones activas disponibles.
        </p>
      </div>

      <!-- BOTÓN NUEVO REGISTRO -->
      <div class="mb-4 flex justify-end">
        <button
          @click="alternarFormulario"
          :disabled="!internacionSeleccionada"
          class="rounded-lg bg-teal-600 px-5 py-2 text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {{ mostrarFormulario ? 'Cancelar' : '+ Registrar control' }}
        </button>
      </div>

      <!-- FORMULARIO -->
      <div
        v-if="mostrarFormulario"
        class="mb-6 rounded-xl bg-white p-6 shadow-sm"
      >
        <h2 class="mb-5 text-lg font-semibold">
          Registrar signos vitales
        </h2>

        <form @submit.prevent="guardarSignosVitales">

          <div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">

            <!-- PROFESIONAL -->
            <div>
              <label class="mb-1 block text-sm font-medium">
                Profesional responsable
              </label>

              <select
                v-model="formulario.profesionalId"
                required
                class="w-full rounded-lg border border-gray-300 p-2"
              >
                <option value="" disabled>
                  Seleccionar profesional
                </option>

                <option
                  v-for="profesional in profesionales"
                  :key="profesional.id"
                  :value="profesional.id"
                >
                  {{ profesional.nombre }} {{ profesional.apellido }}
                </option>
              </select>
            </div>

            <!-- FECHA -->
            <div>
              <label class="mb-1 block text-sm font-medium">
                Fecha y hora
              </label>

              <input
                v-model="formulario.fechaHora"
                type="datetime-local"
                required
                class="w-full rounded-lg border border-gray-300 p-2"
              />
            </div>

            <!-- TEMPERATURA -->
            <div>
              <label class="mb-1 block text-sm font-medium">
                Temperatura (°C)
              </label>

              <input
                v-model.number="formulario.temperatura"
                type="number"
                min="0.1"
                step="0.1"
                required
                placeholder="Ej: 36.5"
                class="w-full rounded-lg border border-gray-300 p-2"
              />
            </div>

            <!-- FRECUENCIA CARDÍACA -->
            <div>
              <label class="mb-1 block text-sm font-medium">
                Frecuencia cardíaca (lpm)
              </label>

              <input
                v-model.number="formulario.frecuenciaCardiaca"
                type="number"
                min="1"
                required
                placeholder="Ej: 80"
                class="w-full rounded-lg border border-gray-300 p-2"
              />
            </div>

            <!-- FRECUENCIA RESPIRATORIA -->
            <div>
              <label class="mb-1 block text-sm font-medium">
                Frecuencia respiratoria (rpm)
              </label>

              <input
                v-model.number="formulario.frecuenciaRespiratoria"
                type="number"
                min="1"
                required
                placeholder="Ej: 18"
                class="w-full rounded-lg border border-gray-300 p-2"
              />
            </div>

            <!-- PRESIÓN SISTÓLICA -->
            <div>
              <label class="mb-1 block text-sm font-medium">
                Presión sistólica (mmHg)
              </label>

              <input
                v-model.number="formulario.presionSistolica"
                type="number"
                min="1"
                required
                placeholder="Ej: 120"
                class="w-full rounded-lg border border-gray-300 p-2"
              />
            </div>

            <!-- PRESIÓN DIASTÓLICA -->
            <div>
              <label class="mb-1 block text-sm font-medium">
                Presión diastólica (mmHg)
              </label>

              <input
                v-model.number="formulario.presionDiastolica"
                type="number"
                min="1"
                required
                placeholder="Ej: 80"
                class="w-full rounded-lg border border-gray-300 p-2"
              />
            </div>

            <!-- SATURACIÓN -->
            <div>
              <label class="mb-1 block text-sm font-medium">
                Saturación de oxígeno (%)
              </label>

              <input
                v-model.number="formulario.saturacionOxigeno"
                type="number"
                min="0"
                max="100"
                step="0.1"
                required
                placeholder="Ej: 98"
                class="w-full rounded-lg border border-gray-300 p-2"
              />
            </div>

          </div>

          <!-- OBSERVACIONES -->
          <div class="mb-5">
            <label class="mb-1 block text-sm font-medium">
              Observaciones
            </label>

            <textarea
              v-model="formulario.observaciones"
              rows="3"
              placeholder="Observaciones adicionales..."
              class="w-full rounded-lg border border-gray-300 p-2"
            ></textarea>
          </div>

          <button
            type="submit"
            :disabled="guardando"
            class="rounded-lg bg-teal-600 px-5 py-2 text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {{ guardando ? 'Guardando...' : 'Guardar control' }}
          </button>

        </form>
      </div>

      <!-- HISTORIAL -->
      <div class="rounded-xl bg-white p-6 shadow-sm">

        <h2 class="mb-4 text-lg font-semibold">
          Historial de controles
        </h2>

        <div v-if="cargando" class="py-8 text-center text-gray-500">
          Cargando controles...
        </div>

        <div
          v-else-if="!internacionSeleccionada"
          class="py-8 text-center text-gray-500"
        >
          Seleccioná una internación para consultar sus controles.
        </div>

        <div
          v-else
          class="overflow-x-auto"
        >
          <table class="w-full text-left text-sm">

            <thead class="bg-gray-100 text-gray-600">
              <tr>
                <th class="p-3">Fecha</th>
                <th class="p-3">Temperatura</th>
                <th class="p-3">FC</th>
                <th class="p-3">FR</th>
                <th class="p-3">Presión</th>
                <th class="p-3">Saturación</th>
                <th class="p-3">Observaciones</th>
                <th class="p-3">Estado</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="registro in signosVitales"
                :key="registro.id"
                class="border-t border-gray-100"
                :class="esAlerta(registro) ? 'bg-red-50 text-red-800' : ''"
              >
                <td class="p-3">
                  {{ formatearFecha(registro.fechaHora) }}
                </td>

                <td class="p-3">
                  {{ registro.temperatura }} °C
                </td>

                <td class="p-3">
                  {{ registro.frecuenciaCardiaca }} lpm
                </td>

                <td class="p-3">
                  {{ registro.frecuenciaRespiratoria }} rpm
                </td>

                <td class="p-3">
                  {{ registro.presionSistolica }}/{{ registro.presionDiastolica }}
                </td>

                <td class="p-3">
                  {{ registro.saturacionOxigeno }}%
                </td>

                <td class="p-3">
                  {{ registro.observaciones || '—' }}
                </td>

                <td class="p-3">
                  <span
                    v-if="esAlerta(registro)"
                    class="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700"
                  >
                    ⚠ Temperatura elevada
                  </span>

                  <span
                    v-else
                    class="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                  >
                    Sin alerta de temperatura
                  </span>
                </td>
              </tr>

              <tr v-if="signosVitales.length === 0">
                <td colspan="8" class="p-6 text-center text-gray-500">
                  No hay controles registrados para esta internación.
                </td>
              </tr>
            </tbody>

          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import { getProfesionales } from '@/modules/admision/profesionales/services/profesionalService'

import { getPacientes } from '@/modules/admision/pacientes/services/pacienteService'

import { listarInternaciones } from '../services/internacionService'

import {
  registrarSignosVitales,
  listarSignosVitalesPorInternacion
} from '../services/signosVitalesService'

// DATOS
const internaciones = ref([])
const pacientes = ref([])
const profesionales = ref([])
const signosVitales = ref([])

// SELECCIÓN
const internacionSeleccionada = ref('')

// ESTADOS
const mostrarFormulario = ref(false)
const guardando = ref(false)
const cargando = ref(false)

// MENSAJES
const mensaje = ref('')
const error = ref('')

// FORMULARIO
const formulario = ref({
  profesionalId: '',
  fechaHora: '',
  temperatura: null,
  frecuenciaCardiaca: null,
  frecuenciaRespiratoria: null,
  presionSistolica: null,
  presionDiastolica: null,
  saturacionOxigeno: null,
  observaciones: ''
})

// INTERNACIONES ACTIVAS
const internacionesActivas = computed(() =>
  internaciones.value.filter(
    internacion => internacion.estado === 'ACTIVA'
  )
)

// RESTABLECER FORMULARIO
const limpiarFormulario = () => {
  formulario.value = {
    profesionalId: '',
    fechaHora: '',
    temperatura: null,
    frecuenciaCardiaca: null,
    frecuenciaRespiratoria: null,
    presionSistolica: null,
    presionDiastolica: null,
    saturacionOxigeno: null,
    observaciones: ''
  }
}

// NOMBRE DEL PACIENTE
const obtenerNombrePaciente = (pacienteId) => {
  const paciente = pacientes.value.find(
    p => p.id === pacienteId
  )

  return paciente
    ? `${paciente.nombre} ${paciente.apellido}`
    : `Paciente #${pacienteId}`
}

// El backend marca `alerta` cuando la temperatura supera 39 °C (y avisa al médico de guardia)
const UMBRAL_TEMPERATURA = 39
const esAlerta = (registro) =>
  registro.alerta ?? Number(registro.temperatura) > UMBRAL_TEMPERATURA

// FORMATEAR FECHA
const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleString('es-AR')
}

// CARGAR DATOS INICIALES
const cargarDatos = async () => {
  cargando.value = true
  error.value = ''

  try {
    const [
      respuestaInternaciones,
      respuestaPacientes,
      respuestaProfesionales
    ] = await Promise.all([
      listarInternaciones(),
      getPacientes(),
      getProfesionales()
    ])

    internaciones.value = respuestaInternaciones || []
    pacientes.value = Array.isArray(respuestaPacientes.data)
      ? respuestaPacientes.data
      : respuestaPacientes.data.data || []

    const datosProfesionales = respuestaProfesionales.data

    profesionales.value = Array.isArray(datosProfesionales)
      ? datosProfesionales
      : datosProfesionales.data || []

  } catch (err) {
    error.value = 'No se pudieron cargar los datos iniciales.'
    console.error('Error al cargar datos:', err)

  } finally {
    cargando.value = false
  }
}

// CONSULTAR HISTORIAL
const cargarSignosVitales = async () => {
  signosVitales.value = []
  mensaje.value = ''
  error.value = ''

  if (!internacionSeleccionada.value) return

  cargando.value = true

  try {
    signosVitales.value = await listarSignosVitalesPorInternacion(
      Number(internacionSeleccionada.value)
    )

  } catch (err) {
    error.value = 'No se pudieron consultar los signos vitales.'
    console.error('Error al consultar signos vitales:', err)

  } finally {
    cargando.value = false
  }
}

// ABRIR Y CERRAR FORMULARIO
const alternarFormulario = () => {
  mostrarFormulario.value = !mostrarFormulario.value
  mensaje.value = ''
  error.value = ''

  if (!mostrarFormulario.value) {
    limpiarFormulario()
  }
}

// REGISTRAR CONTROL
const guardarSignosVitales = async () => {
  mensaje.value = ''
  error.value = ''

  if (!internacionSeleccionada.value) {
    error.value = 'Seleccioná una internación.'
    return
  }

  if (!formulario.value.profesionalId) {
    error.value = 'Seleccioná un profesional.'
    return
  }

  guardando.value = true

  try {
    const datos = {
      ...formulario.value,
      internacionId: Number(internacionSeleccionada.value),
      profesionalId: Number(formulario.value.profesionalId),
      fechaHora: new Date(formulario.value.fechaHora).toISOString(),
      temperatura: Number(formulario.value.temperatura),
      frecuenciaCardiaca: Number(formulario.value.frecuenciaCardiaca),
      frecuenciaRespiratoria: Number(formulario.value.frecuenciaRespiratoria),
      presionSistolica: Number(formulario.value.presionSistolica),
      presionDiastolica: Number(formulario.value.presionDiastolica),
      saturacionOxigeno: Number(formulario.value.saturacionOxigeno)
    }

    const registro = await registrarSignosVitales(datos)

    mensaje.value = esAlerta(registro)
      ? `⚠ Temperatura de ${registro.temperatura} °C: se notificó al médico de guardia y se dejó una nota de enfermería.`
      : 'Signos vitales registrados correctamente. Se agregó una nota de enfermería automática.'

    limpiarFormulario()
    mostrarFormulario.value = false

    await cargarSignosVitales()

  } catch (err) {
    error.value =
      err.response?.data?.mensaje ||
      'No se pudieron registrar los signos vitales.'

    console.error('Error al registrar:', err)

  } finally {
    guardando.value = false
  }
}

// INICIALIZAR
onMounted(cargarDatos)
</script>