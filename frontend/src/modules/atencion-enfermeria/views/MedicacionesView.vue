
<script setup>
import { ref, onMounted, computed } from 'vue'

import { listarInternaciones } from '../services/internacionService'

import {
  registrarMedicacion,
  listarMedicacionesPorInternacion,
  actualizarMedicacion
} from '../services/medicacionService'

import { getProfesionales } from '@/modules/admision/profesionales/services/profesionalService'
import { getPacientes } from '@/modules/admision/pacientes/services/pacienteService'

// Datos principales
const internaciones = ref([])
const profesionales = ref([])
const medicaciones = ref([])
const pacientes = ref([])

// Selecciones
const internacionSeleccionada = ref('')
const profesionalSeleccionado = ref('')

// Datos del formulario
const nombre = ref('')
const dosis = ref('')
const frecuencia = ref('')
const viaAdministracion = ref('')
const fechaInicio = ref('')
const fechaFin = ref('')
const observaciones = ref('')

// Estados de la pantalla
const cargando = ref(false)
const mensaje = ref('')
const error = ref('')

// Estados posibles
const estados = ['ACTIVA', 'SUSPENDIDA', 'FINALIZADA']

// Filtros
const busqueda = ref('')
const filtroEstado = ref('TODOS')

// Medicación seleccionada para ver detalles
const medicacionDetalle = ref(null)

// Cargar datos al entrar
onMounted(async () => {
  await cargarDatos()
})

// Cargar internaciones, profesionales y pacientes
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
    error.value = 'No se pudieron cargar las internaciones, profesionales o pacientes.'
  } finally {
    cargando.value = false
  }
}

// Consultar medicaciones de una internación
async function cargarMedicaciones() {
  mensaje.value = ''
  error.value = ''
  busqueda.value = ''
  filtroEstado.value = 'TODOS'
  medicacionDetalle.value = null

  if (!internacionSeleccionada.value) {
    medicaciones.value = []
    return
  }

  try {
    cargando.value = true

    medicaciones.value = await listarMedicacionesPorInternacion(
      internacionSeleccionada.value
    )

  } catch (err) {
    console.error(err)
    error.value = 'No se pudieron cargar las medicaciones.'
  } finally {
    cargando.value = false
  }
}

// Limpiar formulario
function limpiarFormulario() {
  nombre.value = ''
  dosis.value = ''
  frecuencia.value = ''
  viaAdministracion.value = ''
  fechaInicio.value = ''
  fechaFin.value = ''
  observaciones.value = ''
}

// Registrar medicación
async function guardarMedicacion() {
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

  if (!nombre.value.trim()) {
    error.value = 'Ingresá el nombre del medicamento.'
    return
  }

  if (!dosis.value.trim()) {
    error.value = 'Ingresá la dosis.'
    return
  }

  if (!frecuencia.value.trim()) {
    error.value = 'Ingresá la frecuencia.'
    return
  }

  if (!viaAdministracion.value.trim()) {
    error.value = 'Ingresá la vía de administración.'
    return
  }

  if (!fechaInicio.value) {
    error.value = 'Seleccioná la fecha de inicio.'
    return
  }

  if (fechaFin.value && fechaFin.value < fechaInicio.value) {
    error.value = 'La fecha de finalización no puede ser anterior a la fecha de inicio.'
    return
  }

  const nuevaMedicacion = {
    internacionId: Number(internacionSeleccionada.value),
    profesionalId: Number(profesionalSeleccionado.value),
    nombre: nombre.value.trim(),
    dosis: dosis.value.trim(),
    frecuencia: frecuencia.value.trim(),
    viaAdministracion: viaAdministracion.value.trim(),
    fechaInicio: fechaInicio.value,
    estado: 'ACTIVA',
    observaciones: observaciones.value.trim()
  }

  // Solo enviar fechaFin cuando tenga un valor
  if (fechaFin.value) {
    nuevaMedicacion.fechaFin = fechaFin.value
  }

  try {
    cargando.value = true

    await registrarMedicacion(nuevaMedicacion)

    mensaje.value = 'Medicación registrada correctamente.'

    limpiarFormulario()

    await cargarMedicaciones()

  } catch (err) {
    console.error(err)

    error.value =
      err.response?.data?.mensaje ||
      'No se pudo registrar la medicación.'

  } finally {
    cargando.value = false
  }
}

// Actualizar estado de una medicación
async function cambiarEstado(medicacion, nuevoEstado) {
  try {
    error.value = ''
    mensaje.value = ''

    await actualizarMedicacion(medicacion.id, {
      estado: nuevoEstado
    })

    mensaje.value = 'Estado actualizado correctamente.'

    if (medicacionDetalle.value?.id === medicacion.id) {
      medicacionDetalle.value = {
        ...medicacionDetalle.value,
        estado: nuevoEstado
      }
    }

    await cargarMedicaciones()

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

// Obtener paciente desde una medicación
function nombrePacienteDeMedicacion(medicacion) {
  const internacion = internaciones.value.find(
    i => Number(i.id) === Number(medicacion.internacionId)
  )

  if (!internacion) return 'Paciente no disponible'

  return nombrePaciente(internacion.pacienteId)
}

// Mostrar fechas
function fechaLegible(fecha) {
  if (!fecha) return '-'

  const fechaConvertida = new Date(fecha)

  if (Number.isNaN(fechaConvertida.getTime())) return '-'

  return fechaConvertida.toLocaleDateString('es-AR')
}

// Abrir detalles
function verDetalles(medicacion) {
  medicacionDetalle.value = medicacion
}

// Cerrar detalles
function cerrarDetalles() {
  medicacionDetalle.value = null
}

// Contadores
const totalActivas = computed(() =>
  medicaciones.value.filter(m => m.estado === 'ACTIVA').length
)

const totalSuspendidas = computed(() =>
  medicaciones.value.filter(m => m.estado === 'SUSPENDIDA').length
)

const totalFinalizadas = computed(() =>
  medicaciones.value.filter(m => m.estado === 'FINALIZADA').length
)

// Filtrar y ordenar medicaciones
const medicacionesFiltradas = computed(() => {
  return medicaciones.value
    .filter(medicacion => {
      const texto = [
        medicacion.nombre,
        medicacion.dosis,
        medicacion.frecuencia,
        medicacion.viaAdministracion
      ].join(' ').toLowerCase()

      const coincideBusqueda = texto.includes(
        busqueda.value.toLowerCase().trim()
      )

      const coincideEstado =
        filtroEstado.value === 'TODOS' ||
        medicacion.estado === filtroEstado.value

      return coincideBusqueda && coincideEstado
    })
    .sort((a, b) =>
      new Date(b.fechaInicio) - new Date(a.fechaInicio)
    )
})
</script>

<template>
  <main class="min-h-screen bg-gray-100 p-6">
    <div class="mx-auto max-w-6xl">

      <!-- Encabezado -->
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800">
          Medicaciones
        </h1>

        <p class="mt-2 text-gray-600">
          Registro y seguimiento de medicamentos administrados durante las internaciones.
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

      <!-- Seleccionar internación -->
      <section class="mb-6 rounded-xl bg-white p-6 shadow">
        <h2 class="mb-4 text-xl font-semibold text-gray-800">
          Seleccionar internación
        </h2>

        <select
          v-model="internacionSeleccionada"
          @change="cargarMedicaciones"
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
          Registrar nueva medicación
        </h2>

        <form
          @submit.prevent="guardarMedicacion"
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

          <!-- Nombre y dosis -->
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label class="mb-2 block font-medium text-gray-700">
                Nombre del medicamento
              </label>

              <input
                v-model="nombre"
                type="text"
                placeholder="Ej: Paracetamol"
                class="w-full rounded-lg border border-gray-300 p-3"
              />
            </div>

            <div>
              <label class="mb-2 block font-medium text-gray-700">
                Dosis
              </label>

              <input
                v-model="dosis"
                type="text"
                placeholder="Ej: 500 mg"
                class="w-full rounded-lg border border-gray-300 p-3"
              />
            </div>
          </div>

          <!-- Frecuencia y vía -->
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label class="mb-2 block font-medium text-gray-700">
                Frecuencia
              </label>

              <input
                v-model="frecuencia"
                type="text"
                placeholder="Ej: Cada 8 horas"
                class="w-full rounded-lg border border-gray-300 p-3"
              />
            </div>

            <div>
              <label class="mb-2 block font-medium text-gray-700">
                Vía de administración
              </label>

              <input
                v-model="viaAdministracion"
                type="text"
                placeholder="Ej: Oral, intravenosa..."
                class="w-full rounded-lg border border-gray-300 p-3"
              />
            </div>
          </div>

          <!-- Fechas -->
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label class="mb-2 block font-medium text-gray-700">
                Fecha de inicio
              </label>

              <input
                v-model="fechaInicio"
                type="date"
                class="w-full rounded-lg border border-gray-300 p-3"
              />
            </div>

            <div>
              <label class="mb-2 block font-medium text-gray-700">
                Fecha de finalización (opcional)
              </label>

              <input
                v-model="fechaFin"
                type="date"
                :min="fechaInicio || undefined"
                class="w-full rounded-lg border border-gray-300 p-3"
              />
            </div>
          </div>

          <!-- Observaciones -->
          <div>
            <label class="mb-2 block font-medium text-gray-700">
              Observaciones
            </label>

            <textarea
              v-model="observaciones"
              rows="3"
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
            {{ cargando ? 'Procesando...' : 'Registrar medicación' }}
          </button>
        </form>
      </section>

      <!-- Historial -->
      <section class="rounded-xl bg-white p-6 shadow">
        <h2 class="mb-5 text-xl font-semibold text-gray-800">
          Medicaciones registradas
        </h2>

        <!-- Contadores -->
        <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div class="rounded-xl bg-blue-50 p-4">
            <p class="text-sm text-blue-700">Activas</p>
            <p class="text-2xl font-bold text-blue-800">
              {{ totalActivas }}
            </p>
          </div>

          <div class="rounded-xl bg-yellow-50 p-4">
            <p class="text-sm text-yellow-700">Suspendidas</p>
            <p class="text-2xl font-bold text-yellow-800">
              {{ totalSuspendidas }}
            </p>
          </div>

          <div class="rounded-xl bg-green-50 p-4">
            <p class="text-sm text-green-700">Finalizadas</p>
            <p class="text-2xl font-bold text-green-800">
              {{ totalFinalizadas }}
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
            placeholder="Buscar medicamento, dosis o frecuencia..."
            class="flex-1 rounded-lg border border-gray-300 p-3"
          />

          <select
            v-model="filtroEstado"
            class="rounded-lg border border-gray-300 p-3"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="ACTIVA">Activas</option>
            <option value="SUSPENDIDA">Suspendidas</option>
            <option value="FINALIZADA">Finalizadas</option>
          </select>
        </div>

        <!-- Sin internación -->
        <p
          v-if="!internacionSeleccionada"
          class="text-gray-500"
        >
          Seleccioná una internación para consultar sus medicaciones.
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
          v-else-if="medicaciones.length === 0"
          class="text-gray-500"
        >
          No hay medicaciones registradas para esta internación.
        </p>

        <!-- Sin resultados -->
        <p
          v-else-if="medicacionesFiltradas.length === 0"
          class="text-gray-500"
        >
          No se encontraron medicaciones con esos filtros.
        </p>

        <!-- Tabla -->
        <div v-else class="overflow-x-auto">
          <table class="w-full border-collapse text-left">
            <thead>
              <tr class="border-b bg-gray-50 text-gray-600">
                <th class="p-3">Medicamento</th>
                <th class="p-3">Dosis</th>
                <th class="p-3">Frecuencia</th>
                <th class="p-3">Vía</th>
                <th class="p-3">Fecha inicio</th>
                <th class="p-3">Estado</th>
                <th class="p-3">Actualizar</th>
                <th class="p-3">Detalles</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="medicacion in medicacionesFiltradas"
                :key="medicacion.id"
                class="border-b hover:bg-gray-50"
              >
                <td class="p-3 font-medium">
                  {{ medicacion.nombre }}
                </td>

                <td class="p-3">
                  {{ medicacion.dosis }}
                </td>

                <td class="p-3">
                  {{ medicacion.frecuencia }}
                </td>

                <td class="p-3">
                  {{ medicacion.viaAdministracion }}
                </td>

                <td class="p-3 text-sm">
                  {{ fechaLegible(medicacion.fechaInicio) }}
                </td>

                <!-- Estado -->
                <td class="p-3">
                  <span
                    class="rounded-full px-3 py-1 text-xs font-semibold"
                    :class="{
                      'bg-blue-100 text-blue-700': medicacion.estado === 'ACTIVA',
                      'bg-yellow-100 text-yellow-700': medicacion.estado === 'SUSPENDIDA',
                      'bg-green-100 text-green-700': medicacion.estado === 'FINALIZADA'
                    }"
                  >
                    {{ medicacion.estado }}
                  </span>
                </td>

                <!-- Actualizar estado -->
                <td class="p-3">
                  <select
                    :value="medicacion.estado"
                    @change="cambiarEstado(medicacion, $event.target.value)"
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

                <!-- Detalles -->
                <td class="p-3">
                  <button
                    type="button"
                    @click="verDetalles(medicacion)"
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
      v-if="medicacionDetalle"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="cerrarDetalles"
    >
      <div class="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

        <!-- Encabezado -->
        <div class="mb-5 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-800">
            Detalles de la medicación
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
            <p class="text-sm text-gray-500">Número de medicación</p>
            <p class="font-semibold">
              #{{ medicacionDetalle.id }}
            </p>
          </div>

          <div>
            <p class="text-sm text-gray-500">Paciente</p>
            <p class="font-semibold">
              {{ nombrePacienteDeMedicacion(medicacionDetalle) }}
            </p>
          </div>

          <div>
            <p class="text-sm text-gray-500">Profesional responsable</p>
            <p class="font-semibold">
              {{ nombreProfesional(medicacionDetalle.profesionalId) }}
            </p>
          </div>

          <div>
            <p class="text-sm text-gray-500">Medicamento</p>
            <p class="font-semibold">
              {{ medicacionDetalle.nombre }}
            </p>
          </div>

          <div>
            <p class="text-sm text-gray-500">Dosis</p>
            <p class="font-semibold">
              {{ medicacionDetalle.dosis }}
            </p>
          </div>

          <div>
            <p class="text-sm text-gray-500">Frecuencia</p>
            <p class="font-semibold">
              {{ medicacionDetalle.frecuencia }}
            </p>
          </div>

          <div>
            <p class="text-sm text-gray-500">Vía de administración</p>
            <p class="font-semibold">
              {{ medicacionDetalle.viaAdministracion }}
            </p>
          </div>

          <div>
            <p class="text-sm text-gray-500">Fecha de inicio</p>
            <p class="font-semibold">
              {{ fechaLegible(medicacionDetalle.fechaInicio) }}
            </p>
          </div>

          <div>
            <p class="text-sm text-gray-500">Fecha de finalización</p>
            <p class="font-semibold">
              {{ fechaLegible(medicacionDetalle.fechaFin) }}
            </p>
          </div>

          <div>
            <p class="text-sm text-gray-500">Observaciones</p>
            <p class="font-semibold whitespace-pre-wrap">
              {{ medicacionDetalle.observaciones || 'Sin observaciones' }}
            </p>
          </div>

          <div>
            <p class="text-sm text-gray-500">Estado</p>

            <span
              class="inline-block rounded-full px-3 py-1 text-xs font-semibold"
              :class="{
                'bg-blue-100 text-blue-700': medicacionDetalle.estado === 'ACTIVA',
                'bg-yellow-100 text-yellow-700': medicacionDetalle.estado === 'SUSPENDIDA',
                'bg-green-100 text-green-700': medicacionDetalle.estado === 'FINALIZADA'
              }"
            >
              {{ medicacionDetalle.estado }}
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