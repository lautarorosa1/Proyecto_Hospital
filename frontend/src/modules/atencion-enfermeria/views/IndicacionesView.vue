<script setup>
import { ref, onMounted, computed } from 'vue'

import { listarInternaciones } from '../services/internacionService'
import {
  registrarIndicacion,
  listarIndicacionesPorInternacion,
  actualizarIndicacion
} from '../services/indicacionService'

import { getProfesionales } from '@/modules/admision/profesionales/services/profesionalService'
import { getPacientes } from '@/modules/admision/pacientes/services/pacienteService'

// Datos principales
const internaciones = ref([])
const profesionales = ref([])
const indicaciones = ref([])
const pacientes = ref([])

// Selecciones del usuario
const internacionSeleccionada = ref('')
const profesionalSeleccionado = ref('')

// Datos del formulario
const descripcion = ref('')
const observaciones = ref('')

// Estados de la pantalla
const cargando = ref(false)
const mensaje = ref('')
const error = ref('')

// Estados posibles de una indicación
const estados = ['ACTIVA', 'CUMPLIDA', 'SUSPENDIDA']

// Filtros del historial
const busqueda = ref('')
const filtroEstado = ref('TODOS')

// Indicación seleccionada para ver sus detalles
const indicacionDetalle = ref(null)

// Cargar datos al entrar a la pantalla
onMounted(async () => {
  await cargarDatos()
})

// Obtener internaciones, profesionales y pacientes
async function cargarDatos() {
  try {
    cargando.value = true
    error.value = ''

    const [
      respuestaInternaciones,
      respuestaProfesionales,
      respuestaPacientes
    ] = await Promise.all([
      listarInternaciones(),
      getProfesionales(),
      getPacientes()
    ])

    internaciones.value = respuestaInternaciones.filter(
      internacion => internacion.estado === 'ACTIVA'
    )

    profesionales.value = Array.isArray(respuestaProfesionales.data)
      ? respuestaProfesionales.data
      : respuestaProfesionales.data?.data || []

    pacientes.value = Array.isArray(respuestaPacientes.data)
      ? respuestaPacientes.data
      : respuestaPacientes.data?.data || []

  } catch (err) {
    console.error(err)
    error.value = 'No se pudieron cargar las internaciones, los profesionales o los pacientes.'
  } finally {
    cargando.value = false
  }
}

// Consultar indicaciones de una internación
async function cargarIndicaciones() {
  mensaje.value = ''
  error.value = ''
  busqueda.value = ''
  filtroEstado.value = 'TODOS'
  indicacionDetalle.value = null

  if (!internacionSeleccionada.value) {
    indicaciones.value = []
    return
  }

  try {
    cargando.value = true

    indicaciones.value = await listarIndicacionesPorInternacion(
      internacionSeleccionada.value
    )

  } catch (err) {
    console.error(err)
    error.value = 'No se pudieron cargar las indicaciones.'
  } finally {
    cargando.value = false
  }
}

// Registrar una nueva indicación
async function guardarIndicacion() {
  mensaje.value = ''
  error.value = ''

  if (!internacionSeleccionada.value) {
    error.value = 'Seleccioná una internación.'
    return
  }

  if (!profesionalSeleccionado.value) {
    error.value = 'Seleccioná un profesional.'
    return
  }

  if (!descripcion.value.trim()) {
    error.value = 'Ingresá la descripción de la indicación.'
    return
  }

  const nuevaIndicacion = {
    internacionId: Number(internacionSeleccionada.value),
    profesionalId: Number(profesionalSeleccionado.value),
    descripcion: descripcion.value.trim(),
    fecha: new Date().toISOString(),
    estado: 'ACTIVA',
    observaciones: observaciones.value.trim()
  }

  try {
    cargando.value = true

    await registrarIndicacion(nuevaIndicacion)

    mensaje.value = 'Indicación registrada correctamente.'

    descripcion.value = ''
    observaciones.value = ''

    await cargarIndicaciones()

  } catch (err) {
    console.error(err)

    error.value =
      err.response?.data?.mensaje ||
      'No se pudo registrar la indicación.'

  } finally {
    cargando.value = false
  }
}

// Actualizar el estado de una indicación
async function cambiarEstado(indicacion, nuevoEstado) {
  try {
    error.value = ''
    mensaje.value = ''

    await actualizarIndicacion(indicacion.id, {
      estado: nuevoEstado
    })

    mensaje.value = 'Estado actualizado correctamente.'

    // Actualizar también la ventana de detalles si está abierta
    if (indicacionDetalle.value?.id === indicacion.id) {
      indicacionDetalle.value = {
        ...indicacionDetalle.value,
        estado: nuevoEstado
      }
    }

    await cargarIndicaciones()

  } catch (err) {
    console.error(err)

    error.value =
      err.response?.data?.mensaje ||
      'No se pudo actualizar el estado.'
  }
}

// Obtener nombre del profesional
function nombreProfesional(id) {
  const profesional = profesionales.value.find(
    p => Number(p.id) === Number(id)
  )

  if (!profesional) return `Profesional #${id}`

  return `${profesional.nombre || ''} ${profesional.apellido || ''}`.trim()
}

// Obtener nombre del paciente
function nombrePaciente(id) {
  const paciente = pacientes.value.find(
    p => Number(p.id) === Number(id)
  )

  if (!paciente) return `Paciente #${id}`

  return `${paciente.nombre || ''} ${paciente.apellido || ''}`.trim()
}

// Obtener el nombre del paciente desde una indicación
function nombrePacienteDeIndicacion(indicacion) {
  const internacion = internaciones.value.find(
    i => Number(i.id) === Number(indicacion.internacionId)
  )

  if (!internacion) return 'Paciente no disponible'

  return nombrePaciente(internacion.pacienteId)
}

// Mostrar fecha en formato argentino
function fechaLegible(fecha) {
  if (!fecha) return '-'

  const fechaConvertida = new Date(fecha)

  if (Number.isNaN(fechaConvertida.getTime())) return '-'

  return fechaConvertida.toLocaleString('es-AR')
}

// Abrir detalles de una indicación
function verDetalles(indicacion) {
  indicacionDetalle.value = indicacion
}

// Cerrar detalles
function cerrarDetalles() {
  indicacionDetalle.value = null
}

// Contar indicaciones activas
const totalActivas = computed(() =>
  indicaciones.value.filter(
    indicacion => indicacion.estado === 'ACTIVA'
  ).length
)

// Contar indicaciones cumplidas
const totalCumplidas = computed(() =>
  indicaciones.value.filter(
    indicacion => indicacion.estado === 'CUMPLIDA'
  ).length
)

// Contar indicaciones suspendidas
const totalSuspendidas = computed(() =>
  indicaciones.value.filter(
    indicacion => indicacion.estado === 'SUSPENDIDA'
  ).length
)

// Filtrar y ordenar indicaciones
const indicacionesFiltradas = computed(() => {
  return indicaciones.value
    .filter(indicacion => {
      const textoDescripcion = (
        indicacion.descripcion || ''
      ).toLowerCase()

      const coincideBusqueda = textoDescripcion.includes(
        busqueda.value.toLowerCase().trim()
      )

      const coincideEstado =
        filtroEstado.value === 'TODOS' ||
        indicacion.estado === filtroEstado.value

      return coincideBusqueda && coincideEstado
    })
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})
</script>

<template>
  <main class="min-h-screen bg-gray-100 p-6">
    <div class="mx-auto max-w-6xl">

      <!-- Encabezado -->
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800">
          Indicaciones de Enfermería
        </h1>

        <p class="mt-2 text-gray-600">
          Registro y seguimiento de las indicaciones de cada internación.
        </p>
      </header>

      <!-- Mensajes -->
      <div
        v-if="mensaje"
        class="mb-4 rounded-lg bg-green-100 p-4 text-green-700"
      >
        {{ mensaje }}
      </div>

      <div
        v-if="error"
        class="mb-4 rounded-lg bg-red-100 p-4 text-red-700"
      >
        {{ error }}
      </div>

      <!-- Selección de internación -->
      <section class="mb-6 rounded-xl bg-white p-6 shadow">
        <h2 class="mb-4 text-xl font-semibold text-gray-800">
          Seleccionar internación
        </h2>

        <select
          v-model="internacionSeleccionada"
          @change="cargarIndicaciones"
          class="w-full rounded-lg border border-gray-300 p-3"
        >
          <option value="">
            Seleccionar internación...
          </option>

          <option
            v-for="internacion in internaciones"
            :key="internacion.id"
            :value="internacion.id"
          >
            Internación #{{ internacion.id }} -
            {{ nombrePaciente(internacion.pacienteId) }}
          </option>
        </select>

        <p
          v-if="!cargando && internaciones.length === 0"
          class="mt-3 text-sm text-gray-500"
        >
          No hay internaciones activas disponibles.
        </p>
      </section>

      <!-- Formulario -->
      <section class="mb-8 rounded-xl bg-white p-6 shadow">
        <h2 class="mb-5 text-xl font-semibold text-gray-800">
          Registrar nueva indicación
        </h2>

        <form
          @submit.prevent="guardarIndicacion"
          class="space-y-5"
        >
          <!-- Profesional -->
          <div>
            <label class="mb-2 block font-medium text-gray-700">
              Profesional responsable
            </label>

            <select
              v-model="profesionalSeleccionado"
              class="w-full rounded-lg border border-gray-300 p-3"
            >
              <option value="">
                Seleccionar profesional...
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

          <!-- Descripción -->
          <div>
            <label class="mb-2 block font-medium text-gray-700">
              Descripción
            </label>

            <textarea
              v-model="descripcion"
              rows="3"
              placeholder="Describí la indicación de enfermería..."
              class="w-full rounded-lg border border-gray-300 p-3"
            ></textarea>
          </div>

          <!-- Observaciones -->
          <div>
            <label class="mb-2 block font-medium text-gray-700">
              Observaciones
            </label>

            <textarea
              v-model="observaciones"
              rows="2"
              placeholder="Observaciones adicionales (opcional)"
              class="w-full rounded-lg border border-gray-300 p-3"
            ></textarea>
          </div>

          <!-- Botón -->
          <button
            type="submit"
            :disabled="cargando"
            class="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {{ cargando ? 'Procesando...' : 'Registrar indicación' }}
          </button>
        </form>
      </section>

      <!-- Historial -->
      <section class="rounded-xl bg-white p-6 shadow">
        <h2 class="mb-5 text-xl font-semibold text-gray-800">
          Indicaciones registradas
        </h2>

        <!-- Contadores -->
        <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div class="rounded-xl bg-blue-50 p-4">
            <p class="text-sm text-blue-700">Activas</p>
            <p class="text-2xl font-bold text-blue-800">
              {{ totalActivas }}
            </p>
          </div>

          <div class="rounded-xl bg-green-50 p-4">
            <p class="text-sm text-green-700">Cumplidas</p>
            <p class="text-2xl font-bold text-green-800">
              {{ totalCumplidas }}
            </p>
          </div>

          <div class="rounded-xl bg-gray-100 p-4">
            <p class="text-sm text-gray-600">Suspendidas</p>
            <p class="text-2xl font-bold text-gray-800">
              {{ totalSuspendidas }}
            </p>
          </div>
        </div>

        <!-- Buscador y filtros -->
        <div
          v-if="internacionSeleccionada"
          class="mb-6 flex flex-col gap-3 sm:flex-row"
        >
          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar por descripción..."
            class="flex-1 rounded-lg border border-gray-300 p-3"
          />

          <select
            v-model="filtroEstado"
            class="rounded-lg border border-gray-300 p-3"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="ACTIVA">Activas</option>
            <option value="CUMPLIDA">Cumplidas</option>
            <option value="SUSPENDIDA">Suspendidas</option>
          </select>
        </div>

        <!-- Sin internación seleccionada -->
        <p
          v-if="!internacionSeleccionada"
          class="text-gray-500"
        >
          Seleccioná una internación para consultar sus indicaciones.
        </p>

        <!-- Cargando -->
        <p
          v-else-if="cargando"
          class="text-gray-500"
        >
          Cargando información...
        </p>

        <!-- Sin registros -->
        <p
          v-else-if="indicaciones.length === 0"
          class="text-gray-500"
        >
          No hay indicaciones registradas para esta internación.
        </p>

        <!-- Sin resultados de búsqueda -->
        <p
          v-else-if="indicacionesFiltradas.length === 0"
          class="text-gray-500"
        >
          No se encontraron indicaciones con esos filtros.
        </p>

        <!-- Tabla de indicaciones -->
        <div v-else class="overflow-x-auto">
          <table class="w-full border-collapse text-left">
            <thead>
              <tr class="border-b bg-gray-50 text-gray-600">
                <th class="p-3">Fecha</th>
                <th class="p-3">Profesional</th>
                <th class="p-3">Descripción</th>
                <th class="p-3">Observaciones</th>
                <th class="p-3">Estado</th>
                <th class="p-3">Actualizar estado</th>
                <th class="p-3">Detalles</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="indicacion in indicacionesFiltradas"
                :key="indicacion.id"
                class="border-b hover:bg-gray-50"
              >
                <td class="p-3 text-sm">
                  {{ fechaLegible(indicacion.fecha) }}
                </td>

                <td class="p-3">
                  {{ nombreProfesional(indicacion.profesionalId) }}
                </td>

                <td class="p-3">
                  {{ indicacion.descripcion }}
                </td>

                <td class="p-3">
                  {{ indicacion.observaciones || '-' }}
                </td>

                <!-- Estado actual -->
                <td class="p-3">
                  <span
                    class="rounded-full px-3 py-1 text-xs font-semibold"
                    :class="{
                      'bg-blue-100 text-blue-700': indicacion.estado === 'ACTIVA',
                      'bg-green-100 text-green-700': indicacion.estado === 'CUMPLIDA',
                      'bg-gray-200 text-gray-700': indicacion.estado === 'SUSPENDIDA'
                    }"
                  >
                    {{ indicacion.estado }}
                  </span>
                </td>

                <!-- Actualizar estado -->
                <td class="p-3">
                  <select
                    :value="indicacion.estado"
                    @change="cambiarEstado(indicacion, $event.target.value)"
                    class="rounded-lg border border-gray-300 p-2"
                  >
                    <option
                      v-for="estado in estados"
                      :key="estado"
                      :value="estado"
                    >
                      {{ estado }}
                    </option>
                  </select>
                </td>

                <!-- Ver detalles -->
                <td class="p-3">
                  <button
                    type="button"
                    @click="verDetalles(indicacion)"
                    class="rounded-lg bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-200"
                  >
                    Ver detalles
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- Ventana de detalles -->
    <div
      v-if="indicacionDetalle"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="cerrarDetalles"
    >
      <div class="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <!-- Encabezado de la ventana -->
        <div class="mb-5 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-800">
            Detalles de la indicación
          </h2>

          <button
            type="button"
            @click="cerrarDetalles"
            class="text-2xl text-gray-500 hover:text-gray-800"
            aria-label="Cerrar detalles"
          >
            &times;
          </button>
        </div>

        <!-- Información -->
        <div class="space-y-4">
          <div>
            <p class="text-sm text-gray-500">Número de indicación</p>
            <p class="font-semibold">
              #{{ indicacionDetalle.id }}
            </p>
          </div>

          <div>
            <p class="text-sm text-gray-500">Paciente</p>
            <p class="font-semibold">
              {{ nombrePacienteDeIndicacion(indicacionDetalle) }}
            </p>
          </div>

          <div>
            <p class="text-sm text-gray-500">Profesional responsable</p>
            <p class="font-semibold">
              {{ nombreProfesional(indicacionDetalle.profesionalId) }}
            </p>
          </div>

          <div>
            <p class="text-sm text-gray-500">Fecha y hora</p>
            <p class="font-semibold">
              {{ fechaLegible(indicacionDetalle.fecha) }}
            </p>
          </div>

          <div>
            <p class="text-sm text-gray-500">Descripción</p>
            <p class="font-semibold whitespace-pre-wrap">
              {{ indicacionDetalle.descripcion }}
            </p>
          </div>

          <div>
            <p class="text-sm text-gray-500">Observaciones</p>
            <p class="font-semibold whitespace-pre-wrap">
              {{ indicacionDetalle.observaciones || 'Sin observaciones' }}
            </p>
          </div>

          <div>
            <p class="text-sm text-gray-500">Estado</p>
            <span
              class="inline-block rounded-full px-3 py-1 text-xs font-semibold"
              :class="{
                'bg-blue-100 text-blue-700': indicacionDetalle.estado === 'ACTIVA',
                'bg-green-100 text-green-700': indicacionDetalle.estado === 'CUMPLIDA',
                'bg-gray-200 text-gray-700': indicacionDetalle.estado === 'SUSPENDIDA'
              }"
            >
              {{ indicacionDetalle.estado }}
            </span>
          </div>
        </div>

        <!-- Cerrar -->
        <button
          type="button"
          @click="cerrarDetalles"
          class="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Cerrar
        </button>
      </div>
    </div>
  </main>
</template>