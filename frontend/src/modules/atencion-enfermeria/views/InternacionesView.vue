
<script setup>
import { ref, onMounted, computed } from 'vue'

import { getPacientes } from '@/modules/admision/pacientes/services/pacienteService'

import {
  listarInternaciones,
  registrarInternacion
} from '../services/internacionService'

// DATOS
const pacientes = ref([])
const internaciones = ref([])

// ESTADOS DE LA PANTALLA
const mostrarFormulario = ref(false)
const guardando = ref(false)
const cargando = ref(false)

// MENSAJES
const mensaje = ref('')
const error = ref('')

// FORMULARIO
const formulario = ref({
  pacienteId: '',
  fechaIngreso: '',
  motivoIngreso: '',
  observaciones: '',
  estado: 'ACTIVA'
})

// FILTROS
const busqueda = ref('')
const filtroEstado = ref('TODOS')

// INTERNACIÓN SELECCIONADA PARA VER DETALLES
const internacionDetalle = ref(null)

// RESTABLECER FORMULARIO
const limpiarFormulario = () => {
  formulario.value = {
    pacienteId: '',
    fechaIngreso: '',
    motivoIngreso: '',
    observaciones: '',
    estado: 'ACTIVA'
  }
}

// ABRIR O CERRAR FORMULARIO
const alternarFormulario = () => {
  mostrarFormulario.value = !mostrarFormulario.value

  mensaje.value = ''
  error.value = ''

  if (!mostrarFormulario.value) {
    limpiarFormulario()
  }
}

// CARGAR PACIENTES E INTERNACIONES
const cargarDatos = async () => {
  cargando.value = true
  error.value = ''

  try {
    const [respuestaPacientes, respuestaInternaciones] =
      await Promise.all([
        getPacientes(),
        listarInternaciones()
      ])

    pacientes.value = Array.isArray(respuestaPacientes.data)
      ? respuestaPacientes.data
      : respuestaPacientes.data?.data || []

    internaciones.value = respuestaInternaciones

  } catch (err) {
    error.value = 'No se pudieron cargar los datos.'

    console.error('Error al cargar datos:', err)

  } finally {
    cargando.value = false
  }
}

// BUSCAR PACIENTE POR ID
const obtenerPaciente = (pacienteId) => {
  return pacientes.value.find(
    p => Number(p.id) === Number(pacienteId)
  )
}

// BUSCAR NOMBRE DEL PACIENTE POR ID
const obtenerNombrePaciente = (pacienteId) => {
  const paciente = obtenerPaciente(pacienteId)

  return paciente
    ? `${paciente.nombre || ''} ${paciente.apellido || ''}`.trim()
    : `Paciente #${pacienteId}`
}

// BUSCAR DNI DEL PACIENTE POR ID
const obtenerDniPaciente = (pacienteId) => {
  const paciente = obtenerPaciente(pacienteId)

  return paciente ? `DNI: ${paciente.dni}` : 'DNI no disponible'
}

// MOSTRAR FECHAS EN FORMATO ARGENTINO
const fechaLegible = (fecha) => {
  if (!fecha) return '-'

  const fechaConvertida = new Date(fecha)

  if (Number.isNaN(fechaConvertida.getTime())) {
    return fecha
  }

  return fechaConvertida.toLocaleDateString('es-AR')
}

// ABRIR DETALLES
const verDetalles = (internacion) => {
  internacionDetalle.value = internacion
}

// CERRAR DETALLES
const cerrarDetalles = () => {
  internacionDetalle.value = null
}

// REGISTRAR INTERNACIÓN
const guardarInternacion = async () => {
  mensaje.value = ''
  error.value = ''

  if (!formulario.value.pacienteId) {
    error.value = 'Debés seleccionar un paciente.'
    return
  }

  if (!formulario.value.fechaIngreso) {
    error.value = 'Debés ingresar una fecha de ingreso.'
    return
  }

  if (!formulario.value.motivoIngreso.trim()) {
    error.value = 'Debés ingresar el motivo de ingreso.'
    return
  }

  guardando.value = true

  try {
    const datos = {
      ...formulario.value,
      pacienteId: Number(formulario.value.pacienteId),
      motivoIngreso: formulario.value.motivoIngreso.trim(),
      observaciones: formulario.value.observaciones.trim()
    }

    await registrarInternacion(datos)

    mensaje.value = 'Internación registrada correctamente.'

    limpiarFormulario()
    mostrarFormulario.value = false

    await cargarDatos()

  } catch (err) {
    error.value =
      err.response?.data?.mensaje ||
      err.response?.data?.error ||
      'No se pudo registrar la internación.'

    console.error('Error al registrar internación:', err)

  } finally {
    guardando.value = false
  }
}

// FILTRAR INTERNACIONES
const internacionesFiltradas = computed(() => {
  return internaciones.value.filter(internacion => {
    const paciente = obtenerPaciente(internacion.pacienteId)

    const nombreCompleto = paciente
      ? `${paciente.nombre || ''} ${paciente.apellido || ''}`.toLowerCase()
      : ''

    const dni = paciente?.dni?.toString() || ''

    const textoBusqueda = busqueda.value.toLowerCase().trim()

    const coincideBusqueda =
      nombreCompleto.includes(textoBusqueda) ||
      dni.includes(textoBusqueda) ||
      String(internacion.id).includes(textoBusqueda) ||
      (internacion.motivoIngreso || '').toLowerCase().includes(textoBusqueda)

    const coincideEstado =
      filtroEstado.value === 'TODOS' ||
      internacion.estado === filtroEstado.value

    return coincideBusqueda && coincideEstado
  })
})

// CONTADORES
const totalActivas = computed(() =>
  internaciones.value.filter(
    i => i.estado === 'ACTIVA'
  ).length
)

const totalFinalizadas = computed(() =>
  internaciones.value.filter(
    i => i.estado === 'FINALIZADA'
  ).length
)

// CARGAR DATOS AL ENTRAR
onMounted(cargarDatos)
</script>

<template>
  <main class="min-h-screen bg-gray-50 p-6">
    <div class="mx-auto max-w-6xl">

      <!-- ENCABEZADO -->
      <header class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            Internaciones
          </h1>

          <p class="text-sm text-gray-500">
            Gestión de ingresos hospitalarios
          </p>
        </div>

        <button
          @click="alternarFormulario"
          class="rounded-lg bg-teal-600 px-4 py-2 text-white hover:bg-teal-700"
        >
          {{ mostrarFormulario ? 'Cancelar' : '+ Nueva internación' }}
        </button>
      </header>

      <!-- CONTADORES -->
      <section class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

        <div class="rounded-xl bg-green-50 p-4">
          <p class="text-sm text-green-700">
            Internaciones activas
          </p>

          <p class="text-2xl font-bold text-green-800">
            {{ totalActivas }}
          </p>
        </div>

        <div class="rounded-xl bg-gray-100 p-4">
          <p class="text-sm text-gray-600">
            Internaciones finalizadas
          </p>

          <p class="text-2xl font-bold text-gray-800">
            {{ totalFinalizadas }}
          </p>
        </div>

      </section>

      <!-- FORMULARIO -->
      <section
        v-if="mostrarFormulario"
        class="mb-6 rounded-xl bg-white p-6 shadow-sm"
      >
        <h2 class="mb-4 text-lg font-semibold">
          Registrar internación
        </h2>

        <form @submit.prevent="guardarInternacion" class="space-y-4">

          <!-- PACIENTE -->
          <div>
            <label class="mb-1 block text-sm font-medium">
              Paciente
            </label>

            <select
              v-model="formulario.pacienteId"
              required
              class="w-full rounded-lg border border-gray-300 p-2"
            >
              <option value="" disabled>
                Seleccionar paciente
              </option>

              <option
                v-for="paciente in pacientes"
                :key="paciente.id"
                :value="paciente.id"
              >
                {{ paciente.nombre }} {{ paciente.apellido }}
                — DNI: {{ paciente.dni }}
              </option>
            </select>

            <p
              v-if="pacientes.length === 0"
              class="mt-1 text-xs text-amber-600"
            >
              No hay pacientes disponibles para seleccionar.
            </p>
          </div>

          <!-- FECHA DE INGRESO -->
          <div>
            <label class="mb-1 block text-sm font-medium">
              Fecha de ingreso
            </label>

            <input
              v-model="formulario.fechaIngreso"
              type="date"
              required
              class="w-full rounded-lg border border-gray-300 p-2"
            />
          </div>

          <!-- MOTIVO -->
          <div>
            <label class="mb-1 block text-sm font-medium">
              Motivo de ingreso
            </label>

            <textarea
              v-model="formulario.motivoIngreso"
              required
              rows="3"
              class="w-full rounded-lg border border-gray-300 p-2"
              placeholder="Describir el motivo de ingreso..."
            ></textarea>
          </div>

          <!-- OBSERVACIONES -->
          <div>
            <label class="mb-1 block text-sm font-medium">
              Observaciones
            </label>

            <textarea
              v-model="formulario.observaciones"
              rows="2"
              class="w-full rounded-lg border border-gray-300 p-2"
              placeholder="Observaciones adicionales..."
            ></textarea>
          </div>

          <!-- BOTÓN -->
          <button
            type="submit"
            :disabled="guardando || pacientes.length === 0"
            class="rounded-lg bg-teal-600 px-5 py-2 text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ guardando ? 'Guardando...' : 'Registrar internación' }}
          </button>

        </form>
      </section>

      <!-- MENSAJES -->
      <p
        v-if="mensaje"
        class="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700"
      >
        {{ mensaje }}
      </p>

      <p
        v-if="error"
        class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600"
      >
        {{ error }}
      </p>

      <!-- BUSCADOR Y FILTROS -->
      <section class="mb-4 flex flex-col gap-3 sm:flex-row">

        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar por paciente, DNI, motivo o ID..."
          class="flex-1 rounded-lg border border-gray-300 bg-white p-3"
        />

        <select
          v-model="filtroEstado"
          class="rounded-lg border border-gray-300 bg-white p-3"
        >
          <option value="TODOS">Todos los estados</option>
          <option value="ACTIVA">Activas</option>
          <option value="FINALIZADA">Finalizadas</option>
        </select>

      </section>

      <!-- CARGANDO -->
      <div
        v-if="cargando"
        class="rounded-xl bg-white p-8 text-center text-gray-500 shadow-sm"
      >
        Cargando internaciones...
      </div>

      <!-- TABLA -->
      <div
        v-else
        class="overflow-x-auto rounded-xl bg-white shadow-sm"
      >
        <table class="w-full text-left text-sm">

          <thead class="bg-gray-100 text-gray-600">
            <tr>
              <th class="p-4">ID</th>
              <th class="p-4">Paciente</th>
              <th class="p-4">Fecha de ingreso</th>
              <th class="p-4">Motivo</th>
              <th class="p-4">Estado</th>
              <th class="p-4">Detalles</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="internacion in internacionesFiltradas"
              :key="internacion.id"
              class="border-t border-gray-100 hover:bg-gray-50"
            >
              <td class="p-4">
                #{{ internacion.id }}
              </td>

              <!-- PACIENTE Y DNI -->
              <td class="p-4">
                <div class="font-medium text-gray-900">
                  {{ obtenerNombrePaciente(internacion.pacienteId) }}
                </div>

                <div class="text-xs text-gray-500">
                  {{ obtenerDniPaciente(internacion.pacienteId) }}
                </div>
              </td>

              <td class="p-4">
                {{ fechaLegible(internacion.fechaIngreso) }}
              </td>

              <td class="p-4">
                {{ internacion.motivoIngreso }}
              </td>

              <!-- ESTADO -->
              <td class="p-4">
                <span
                  :class="internacion.estado === 'ACTIVA'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'"
                  class="rounded-full px-3 py-1 text-xs font-medium"
                >
                  {{ internacion.estado }}
                </span>
              </td>

              <!-- DETALLES -->
              <td class="p-4">
                <button
                  type="button"
                  @click="verDetalles(internacion)"
                  class="rounded-lg bg-teal-100 px-3 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-200"
                >
                  Ver detalles
                </button>
              </td>
            </tr>

            <tr v-if="internacionesFiltradas.length === 0">
              <td
                colspan="6"
                class="p-6 text-center text-gray-500"
              >
                No se encontraron internaciones.
              </td>
            </tr>
          </tbody>

        </table>
      </div>

    </div>

    <!-- MODAL DE DETALLES -->
    <div
      v-if="internacionDetalle"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="cerrarDetalles"
    >

      <div class="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

        <!-- ENCABEZADO -->
        <div class="mb-5 flex items-center justify-between">

          <h2 class="text-xl font-bold text-gray-800">
            Detalles de internación
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

        <!-- INFORMACIÓN -->
        <div class="space-y-4">

          <div>
            <p class="text-sm text-gray-500">
              Número de internación
            </p>

            <p class="font-semibold">
              #{{ internacionDetalle.id }}
            </p>
          </div>

          <div>
            <p class="text-sm text-gray-500">
              Paciente
            </p>

            <p class="font-semibold">
              {{ obtenerNombrePaciente(internacionDetalle.pacienteId) }}
            </p>

            <p class="text-sm text-gray-500">
              {{ obtenerDniPaciente(internacionDetalle.pacienteId) }}
            </p>
          </div>

          <div>
            <p class="text-sm text-gray-500">
              Fecha de ingreso
            </p>

            <p class="font-semibold">
              {{ fechaLegible(internacionDetalle.fechaIngreso) }}
            </p>
          </div>

          <div>
            <p class="text-sm text-gray-500">
              Fecha de egreso
            </p>

            <p class="font-semibold">
              {{ fechaLegible(internacionDetalle.fechaEgreso) }}
            </p>
          </div>

          <div>
            <p class="text-sm text-gray-500">
              Motivo de ingreso
            </p>

            <p class="font-semibold whitespace-pre-wrap">
              {{ internacionDetalle.motivoIngreso }}
            </p>
          </div>

          <div>
            <p class="text-sm text-gray-500">
              Observaciones
            </p>

            <p class="font-semibold whitespace-pre-wrap">
              {{ internacionDetalle.observaciones || 'Sin observaciones' }}
            </p>
          </div>

          <div>
            <p class="text-sm text-gray-500">
              Estado
            </p>

            <span
              class="inline-block rounded-full px-3 py-1 text-xs font-semibold"
              :class="internacionDetalle.estado === 'ACTIVA'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'"
            >
              {{ internacionDetalle.estado }}
            </span>
          </div>

        </div>

        <!-- CERRAR -->
        <button
          type="button"
          @click="cerrarDetalles"
          class="mt-6 w-full rounded-lg bg-teal-600 px-4 py-3 font-semibold text-white hover:bg-teal-700"
        >
          Cerrar
        </button>

      </div>
    </div>

  </main>
</template>