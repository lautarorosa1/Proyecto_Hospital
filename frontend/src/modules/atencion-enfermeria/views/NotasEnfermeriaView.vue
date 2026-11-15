
<template>
  <div class="min-h-screen bg-gray-50 px-6 py-8">
    <div class="mx-auto max-w-7xl">

      <!-- VOLVER -->
      <router-link
        to="/atencion-enfermeria"
        class="mb-6 inline-flex items-center text-sm font-medium text-teal-700 hover:text-teal-900"
      >
        ← Volver a Atención de Enfermería
      </router-link>

      <!-- ENCABEZADO -->
      <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            Notas de Enfermería
          </h1>
          <p class="mt-2 text-gray-500">
            Registro y seguimiento de observaciones sobre los pacientes.
          </p>
        </div>

        <button
          @click="abrirFormulario"
          class="rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800"
        >
          + Nueva nota
        </button>
      </div>

      <!-- MENSAJES -->
      <div
        v-if="mensaje"
        class="mb-5 rounded-lg bg-green-50 p-4 text-sm text-green-700"
      >
        {{ mensaje }}
      </div>

      <div
        v-if="error"
        class="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700"
      >
        {{ error }}
      </div>

      <!-- CONTADORES -->
      <div class="mb-6 grid gap-4 sm:grid-cols-2">
        <div class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <p class="text-sm text-gray-500">Total de notas</p>
          <p class="mt-2 text-3xl font-bold text-gray-900">
            {{ notas.length }}
          </p>
        </div>

        <div class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <p class="text-sm text-gray-500">Pacientes con notas</p>
          <p class="mt-2 text-3xl font-bold text-gray-900">
            {{ pacientesConNotas }}
          </p>
        </div>
      </div>

      <!-- FILTROS -->
      <div class="mb-6 grid gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 md:grid-cols-2">
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700">
            Buscar
          </label>
          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar por paciente o contenido..."
            class="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-teal-600"
          />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700">
            Filtrar por paciente
          </label>
          <select
            v-model="filtroPaciente"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-teal-600"
          >
            <option value="">Todos los pacientes</option>
            <option
              v-for="paciente in pacientes"
              :key="paciente.id"
              :value="String(paciente.id)"
            >
              {{ paciente.nombre }} {{ paciente.apellido }}
            </option>
          </select>
        </div>
      </div>

      <!-- TABLA -->
      <div class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <div class="border-b border-gray-200 px-6 py-4">
          <h2 class="font-semibold text-gray-900">
            Notas registradas
          </h2>
        </div>

        <div v-if="cargando" class="p-8 text-center text-gray-500">
          Cargando notas...
        </div>

        <div
          v-else-if="notasFiltradas.length === 0"
          class="p-8 text-center text-gray-500"
        >
          No se encontraron notas de enfermería.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 text-gray-600">
              <tr>
                <th class="px-6 py-4 font-semibold">Fecha</th>
                <th class="px-6 py-4 font-semibold">Paciente</th>
                <th class="px-6 py-4 font-semibold">Profesional</th>
                <th class="px-6 py-4 font-semibold">Contenido</th>
                <th class="px-6 py-4 text-right font-semibold">Acciones</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="nota in notasFiltradas"
                :key="nota.id"
                class="hover:bg-gray-50"
              >
                <td class="whitespace-nowrap px-6 py-4 text-gray-600">
                  {{ fechaLegible(nota.fecha) }}
                </td>

                <td class="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                  {{ nombrePaciente(nota.pacienteId) }}
                </td>

                <td class="whitespace-nowrap px-6 py-4 text-gray-600">
                  {{ nombreProfesional(nota.profesionalId) }}
                </td>

                <td class="max-w-xs px-6 py-4 text-gray-600">
                  <p class="line-clamp-2">
                    {{ nota.contenido }}
                  </p>
                </td>

                <td class="whitespace-nowrap px-6 py-4">
                  <div class="flex justify-end gap-3">
                    <button
                      @click="verDetalles(nota)"
                      class="font-medium text-teal-700 hover:text-teal-900"
                    >
                      Ver
                    </button>

                    <button
                      @click="editarNota(nota)"
                      class="font-medium text-blue-700 hover:text-blue-900"
                    >
                      Editar
                    </button>

                    <button
                      @click="confirmarEliminar(nota)"
                      class="font-medium text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- MODAL REGISTRO / EDICIÓN -->
    <div
      v-if="mostrarFormulario"
      class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
    >
      <div class="my-8 w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900">
            {{ modoEdicion ? 'Editar nota' : 'Registrar nota' }}
          </h2>

          <button
            @click="cerrarFormulario"
            class="text-2xl text-gray-400 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <form @submit.prevent="guardarNota" class="space-y-4">

          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Paciente *
            </label>

            <select
              v-model="formulario.pacienteId"
              required
              :disabled="modoEdicion"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 disabled:bg-gray-100"
            >
              <option value="">Seleccionar paciente</option>
              <option
                v-for="paciente in pacientes"
                :key="paciente.id"
                :value="String(paciente.id)"
              >
                {{ paciente.nombre }} {{ paciente.apellido }}
              </option>
            </select>
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Profesional *
            </label>

            <select
              v-model="formulario.profesionalId"
              required
              class="w-full rounded-lg border border-gray-300 px-4 py-2"
            >
              <option value="">Seleccionar profesional</option>
              <option
                v-for="profesional in profesionales"
                :key="profesional.id"
                :value="String(profesional.id)"
              >
                {{ profesional.nombre }} {{ profesional.apellido }}
              </option>
            </select>
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Fecha y hora
            </label>

            <input
              v-model="formulario.fecha"
              type="datetime-local"
              class="w-full rounded-lg border border-gray-300 px-4 py-2"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Contenido de la nota *
            </label>

            <textarea
              v-model="formulario.contenido"
              required
              rows="5"
              maxlength="5000"
              placeholder="Escribí las observaciones de enfermería..."
              class="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-teal-600"
            ></textarea>

            <p class="mt-1 text-right text-xs text-gray-400">
              {{ formulario.contenido.length }}/5000 caracteres
            </p>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="cerrarFormulario"
              class="rounded-lg border border-gray-300 px-5 py-2 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              :disabled="guardando"
              class="rounded-lg bg-teal-700 px-5 py-2 font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
            >
              {{ guardando ? 'Guardando...' : modoEdicion ? 'Guardar cambios' : 'Registrar nota' }}
            </button>
          </div>

        </form>
      </div>
    </div>

    <!-- MODAL DETALLES -->
    <div
      v-if="notaDetalle"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div class="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
        <div class="mb-5 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900">
            Detalles de la nota
          </h2>

          <button
            @click="notaDetalle = null"
            class="text-2xl text-gray-400 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <p class="text-xs font-semibold uppercase text-gray-500">Paciente</p>
            <p class="mt-1 font-medium text-gray-900">
              {{ nombrePaciente(notaDetalle.pacienteId) }}
            </p>
          </div>

          <div>
            <p class="text-xs font-semibold uppercase text-gray-500">Profesional</p>
            <p class="mt-1 text-gray-900">
              {{ nombreProfesional(notaDetalle.profesionalId) }}
            </p>
          </div>

          <div>
            <p class="text-xs font-semibold uppercase text-gray-500">Fecha</p>
            <p class="mt-1 text-gray-900">
              {{ fechaLegible(notaDetalle.fecha) }}
            </p>
          </div>

          <div>
            <p class="text-xs font-semibold uppercase text-gray-500">Contenido</p>
            <p class="mt-1 whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-gray-700">
              {{ notaDetalle.contenido }}
            </p>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <button
            @click="notaDetalle = null"
            class="rounded-lg bg-teal-700 px-5 py-2 font-semibold text-white hover:bg-teal-800"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import { getPacientes } from '@/modules/admision/pacientes/services/pacienteService'
import { getProfesionales } from '@/modules/admision/profesionales/services/profesionalService'

import {
  listarNotas,
  crearNota,
  actualizarNota,
  eliminarNota
} from '../services/notaEnfermeriaService'

// DATOS
const notas = ref([])
const pacientes = ref([])
const profesionales = ref([])

// ESTADOS
const cargando = ref(false)
const guardando = ref(false)
const mostrarFormulario = ref(false)
const modoEdicion = ref(false)

const mensaje = ref('')
const error = ref('')

const busqueda = ref('')
const filtroPaciente = ref('')

const notaDetalle = ref(null)

// FORMULARIO
const formulario = ref({
  pacienteId: '',
  profesionalId: '',
  fecha: '',
  contenido: ''
})

// CARGA INICIAL
onMounted(() => {
  cargarDatos()
})

const cargarDatos = async () => {
  cargando.value = true
  error.value = ''

  try {
    const [respuestaNotas, respuestaPacientes, respuestaProfesionales] =
      await Promise.all([
        listarNotas(),
        getPacientes(),
        getProfesionales()
      ])

    notas.value = Array.isArray(respuestaNotas)
      ? respuestaNotas
      : respuestaNotas?.data ?? []

    pacientes.value = Array.isArray(respuestaPacientes)
      ? respuestaPacientes
      : respuestaPacientes?.data ?? []

    profesionales.value = Array.isArray(respuestaProfesionales)
      ? respuestaProfesionales
      : respuestaProfesionales?.data ?? []
  } catch (err) {
    console.error('Error al cargar notas:', err)
    error.value = obtenerMensajeError(err, 'No se pudieron cargar los datos.')
  } finally {
    cargando.value = false
  }
}

// BUSCAR PACIENTE
const obtenerPaciente = (id) => {
  return pacientes.value.find(
    paciente => Number(paciente.id) === Number(id)
  )
}

const nombrePaciente = (id) => {
  const paciente = obtenerPaciente(id)

  if (!paciente) return `Paciente #${id}`

  return `${paciente.nombre} ${paciente.apellido}`
}

// BUSCAR PROFESIONAL
const obtenerProfesional = (id) => {
  return profesionales.value.find(
    profesional => Number(profesional.id) === Number(id)
  )
}

const nombreProfesional = (id) => {
  const profesional = obtenerProfesional(id)

  if (!profesional) return `Profesional #${id}`

  return `${profesional.nombre} ${profesional.apellido}`
}

// FORMATO DE FECHA
const fechaLegible = (fecha) => {
  if (!fecha) return '-'

  const fechaObjeto = new Date(fecha)

  if (Number.isNaN(fechaObjeto.getTime())) return fecha

  return fechaObjeto.toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short'
  })
}

const fechaParaFormulario = (fecha) => {
  const date = fecha ? new Date(fecha) : new Date()

  if (Number.isNaN(date.getTime())) return ''

  const ajustar = (numero) => String(numero).padStart(2, '0')

  return `${date.getFullYear()}-${ajustar(date.getMonth() + 1)}-${ajustar(date.getDate())}T${ajustar(date.getHours())}:${ajustar(date.getMinutes())}`
}

// FILTROS
const notasFiltradas = computed(() => {
  return notas.value.filter(nota => {
    const paciente = nombrePaciente(nota.pacienteId).toLowerCase()
    const contenido = (nota.contenido || '').toLowerCase()
    const texto = busqueda.value.toLowerCase()

    const coincideBusqueda =
      paciente.includes(texto) ||
      contenido.includes(texto) ||
      String(nota.id).includes(texto)

    const coincidePaciente =
      !filtroPaciente.value ||
      Number(nota.pacienteId) === Number(filtroPaciente.value)

    return coincideBusqueda && coincidePaciente
  })
})

const pacientesConNotas = computed(() => {
  return new Set(notas.value.map(nota => Number(nota.pacienteId))).size
})

// ABRIR FORMULARIO
const abrirFormulario = () => {
  modoEdicion.value = false

  formulario.value = {
    pacienteId: '',
    profesionalId: '',
    fecha: fechaParaFormulario(new Date()),
    contenido: ''
  }

  mensaje.value = ''
  error.value = ''
  mostrarFormulario.value = true
}

// CERRAR FORMULARIO
const cerrarFormulario = () => {
  mostrarFormulario.value = false
}

// REGISTRAR / ACTUALIZAR
const guardarNota = async () => {
  if (
    !formulario.value.pacienteId ||
    !formulario.value.profesionalId ||
    !formulario.value.contenido.trim()
  ) {
    error.value = 'Completá todos los campos obligatorios.'
    return
  }

  guardando.value = true
  error.value = ''
  mensaje.value = ''

  try {
    const datos = {
      pacienteId: Number(formulario.value.pacienteId),
      profesionalId: Number(formulario.value.profesionalId),
      contenido: formulario.value.contenido.trim(),
      fecha: formulario.value.fecha
        ? new Date(formulario.value.fecha).toISOString()
        : new Date().toISOString()
    }

    if (modoEdicion.value) {
      await actualizarNota(notaEditandoId.value, datos)
      mensaje.value = 'Nota actualizada correctamente.'
    } else {
      await crearNota(datos)
      mensaje.value = 'Nota registrada correctamente.'
    }

    mostrarFormulario.value = false
    await cargarDatos()
  } catch (err) {
    console.error('Error al guardar nota:', err)
    error.value = obtenerMensajeError(err, 'No se pudo guardar la nota.')
  } finally {
    guardando.value = false
  }
}

// EDICIÓN
const notaEditandoId = ref(null)

const editarNota = (nota) => {
  notaEditandoId.value = nota.id
  modoEdicion.value = true

  formulario.value = {
    pacienteId: String(nota.pacienteId),
    profesionalId: String(nota.profesionalId),
    fecha: fechaParaFormulario(nota.fecha),
    contenido: nota.contenido || ''
  }

  mensaje.value = ''
  error.value = ''
  mostrarFormulario.value = true
}

// DETALLES
const verDetalles = (nota) => {
  notaDetalle.value = nota
}

// ELIMINACIÓN
const confirmarEliminar = async (nota) => {
  const confirmado = window.confirm(
    `¿Estás seguro de eliminar la nota #${nota.id}?`
  )

  if (!confirmado) return

  mensaje.value = ''
  error.value = ''

  try {
    await eliminarNota(nota.id)
    mensaje.value = 'Nota eliminada correctamente.'
    await cargarDatos()
  } catch (err) {
    console.error('Error al eliminar nota:', err)
    error.value = obtenerMensajeError(err, 'No se pudo eliminar la nota.')
  }
}

// ERRORES
const obtenerMensajeError = (err, mensajePredeterminado) => {
  return (
    err.response?.data?.mensaje ||
    err.response?.data?.error ||
    err.message ||
    mensajePredeterminado
  )
}
</script>