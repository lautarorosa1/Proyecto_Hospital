<script setup>
import { ref, onMounted, computed } from 'vue'

import { getPacientes } from '@/modules/admision/pacientes/services/pacienteService'
import {
  confirmarIngreso,
  TIPOS_INGRESO,
  etiquetaTipoIngreso
} from '@/modules/admision/ingresos-internacion/services/ingresoInternacionService'
import { getMapaCamas, asignarCama } from '@/modules/recursos-camas/camas/services/camaService'
import { mensajeError, usuarioIdActual } from '@/shared/utils/formato'

import {
  listarInternaciones,
  obtenerInternacion,
  darDeAlta
} from '../services/internacionService'
import { listarProtocolosPorInternacion } from '../services/protocoloService'

// DATOS
const pacientes = ref([])
const internaciones = ref([])

// ESTADOS DE LA PANTALLA
const mostrarFormulario = ref(false)
const guardando = ref(false)
const cargando = ref(false)
const procesandoDetalle = ref(false)

// MENSAJES
const mensaje = ref('')
const error = ref('')
const errorDetalle = ref('')

// FORMULARIO (Admisión confirma el ingreso; Enfermería crea la internación y el protocolo)
const formularioVacio = () => ({
  pacienteId: '',
  tipoIngreso: 'GENERAL',
  motivoIngreso: '',
  diagnosticoInicial: ''
})
const formulario = ref(formularioVacio())

// FILTROS
const busqueda = ref('')
const filtroEstado = ref('TODOS')

// INTERNACIÓN SELECCIONADA PARA VER DETALLES
const internacionDetalle = ref(null)
const protocolos = ref([])
const camasLibres = ref([])
const camaElegida = ref('')

const limpiarFormulario = () => {
  formulario.value = formularioVacio()
}

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

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// El ingreso se procesa por eventos (asíncrono): se consulta unas veces hasta que
// aparece la internación activa del paciente.
const esperarInternacion = async (pacienteId) => {
  for (let intento = 0; intento < 6; intento++) {
    await esperar(600)
    internaciones.value = await listarInternaciones()
    if (
      internaciones.value.some(
        (i) => Number(i.pacienteId) === pacienteId && i.estado === 'ACTIVA'
      )
    ) {
      return true
    }
  }
  return false
}

const obtenerPaciente = (pacienteId) => {
  return pacientes.value.find(
    p => Number(p.id) === Number(pacienteId)
  )
}

const obtenerNombrePaciente = (pacienteId) => {
  const paciente = obtenerPaciente(pacienteId)

  return paciente
    ? `${paciente.nombre || ''} ${paciente.apellido || ''}`.trim()
    : `Paciente #${pacienteId}`
}

const obtenerDniPaciente = (pacienteId) => {
  const paciente = obtenerPaciente(pacienteId)

  return paciente ? `DNI: ${paciente.dni}` : 'DNI no disponible'
}

const fechaLegible = (fecha) => {
  if (!fecha) return '-'

  const fechaConvertida = new Date(fecha)

  if (Number.isNaN(fechaConvertida.getTime())) {
    return fecha
  }

  return fechaConvertida.toLocaleDateString('es-AR')
}

// Pacientes que ya tienen una internación activa no pueden ingresar de nuevo
const pacientesDisponibles = computed(() => {
  const internados = new Set(
    internaciones.value
      .filter((i) => i.estado === 'ACTIVA')
      .map((i) => Number(i.pacienteId))
  )
  return pacientes.value.filter((p) => !internados.has(Number(p.id)))
})

// DETALLE: protocolo generado al ingresar y camas libres para asignar
const cargarDetalleExtra = async (internacion) => {
  protocolos.value = []
  camasLibres.value = []
  camaElegida.value = ''

  try {
    protocolos.value = await listarProtocolosPorInternacion(internacion.id)
  } catch (err) {
    console.error('Error al cargar el protocolo:', err)
  }

  if (internacion.estado === 'ACTIVA' && !internacion.camaId) {
    try {
      camasLibres.value = (await getMapaCamas({ estado: 'Libre' })).data
    } catch (err) {
      console.error('Error al cargar camas libres:', err)
    }
  }
}

const verDetalles = async (internacion) => {
  errorDetalle.value = ''
  internacionDetalle.value = internacion
  await cargarDetalleExtra(internacion)
}

const cerrarDetalles = () => {
  internacionDetalle.value = null
  errorDetalle.value = ''
}

// Refresca la ficha abierta con lo último del backend
const refrescarDetalle = async () => {
  const actual = await obtenerInternacion(internacionDetalle.value.id)
  internacionDetalle.value = actual
  await cargarDetalleExtra(actual)
}

// CONFIRMAR INGRESO (Admisión → Enfermería)
const guardarInternacion = async () => {
  mensaje.value = ''
  error.value = ''

  if (!formulario.value.pacienteId) {
    error.value = 'Debés seleccionar un paciente.'
    return
  }

  if (!formulario.value.motivoIngreso.trim()) {
    error.value = 'Debés ingresar el motivo de ingreso.'
    return
  }

  guardando.value = true

  try {
    const pacienteId = Number(formulario.value.pacienteId)
    const datos = {
      pacienteId,
      tipoIngreso: formulario.value.tipoIngreso,
      motivoIngreso: formulario.value.motivoIngreso.trim(),
      usuarioId: usuarioIdActual()
    }
    if (formulario.value.diagnosticoInicial.trim()) {
      datos.diagnosticoInicial = formulario.value.diagnosticoInicial.trim()
    }

    await confirmarIngreso(datos)

    limpiarFormulario()
    mostrarFormulario.value = false

    const creada = await esperarInternacion(pacienteId)
    mensaje.value = creada
      ? 'Ingreso confirmado: se creó la internación y se generó su protocolo de cuidados.'
      : 'Ingreso confirmado. La internación se está generando, actualizá la lista en unos segundos.'

  } catch (err) {
    // 404 "Not found" (sin "Paciente"): el servidor no tiene la ruta del ingreso
    const rutaInexistente =
      err.response?.status === 404 && err.response?.data?.error === 'Not found'
    error.value = rutaInexistente
      ? 'El servidor no reconoce POST /ingresos-internacion: el backend está desactualizado o no se reinició.'
      : mensajeError(err, 'No se pudo confirmar el ingreso.')

    console.error('Error al confirmar el ingreso:', err)

  } finally {
    guardando.value = false
  }
}

// ASIGNAR CAMA (Recursos y Camas). La internación guarda la cama al recibir el evento.
const asignarCamaElegida = async () => {
  errorDetalle.value = ''

  const cama = camasLibres.value.find((c) => Number(c.id) === Number(camaElegida.value))
  if (!cama) {
    errorDetalle.value = 'Seleccioná una cama libre.'
    return
  }

  procesandoDetalle.value = true
  try {
    await asignarCama(cama.id, {
      paciente_id: Number(internacionDetalle.value.pacienteId),
      usuario_id: usuarioIdActual(),
      version: cama.version
    })
    mensaje.value = `Cama ${cama.numero} asignada.`
    await esperar(700)
    await refrescarDetalle()
    await cargarDatos()
  } catch (err) {
    errorDetalle.value = mensajeError(err, 'No se pudo asignar la cama.')
    // otro usuario pudo haber tomado la cama: se refresca el listado
    if (err.response?.status === 409) await cargarDetalleExtra(internacionDetalle.value)
  } finally {
    procesandoDetalle.value = false
  }
}

// ALTA MÉDICA: finaliza la internación y la cama pasa a "En limpieza"
const finalizarInternacion = async () => {
  const internacion = internacionDetalle.value
  const confirmado = window.confirm(
    `¿Dar de alta a ${obtenerNombrePaciente(internacion.pacienteId)}? ` +
      (internacion.camaId
        ? 'La cama quedará en limpieza hasta que maestranza confirme la higiene.'
        : 'La internación se marcará como finalizada.')
  )
  if (!confirmado) return

  errorDetalle.value = ''
  procesandoDetalle.value = true
  try {
    await darDeAlta(internacion.id, usuarioIdActual())
    mensaje.value = internacion.camaId
      ? 'Alta registrada. La cama pasó a limpieza.'
      : 'Alta registrada.'
    cerrarDetalles()
    await esperar(500)
    await cargarDatos()
  } catch (err) {
    errorDetalle.value = mensajeError(err, 'No se pudo registrar el alta.')
  } finally {
    procesandoDetalle.value = false
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
          {{ mostrarFormulario ? 'Cancelar' : '+ Confirmar ingreso' }}
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

      <!-- FORMULARIO DE INGRESO -->
      <section
        v-if="mostrarFormulario"
        class="mb-6 rounded-xl bg-white p-6 shadow-sm"
      >
        <h2 class="mb-1 text-lg font-semibold">
          Confirmar ingreso a internación
        </h2>
        <p class="mb-4 text-sm text-gray-500">
          Admisión confirma el traslado: se crea la internación y se genera
          automáticamente el protocolo de cuidados según el tipo de ingreso.
        </p>

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
                v-for="paciente in pacientesDisponibles"
                :key="paciente.id"
                :value="paciente.id"
              >
                {{ paciente.nombre }} {{ paciente.apellido }}
                — DNI: {{ paciente.dni }}
              </option>
            </select>

            <p
              v-if="pacientesDisponibles.length === 0"
              class="mt-1 text-xs text-amber-600"
            >
              No hay pacientes disponibles para ingresar.
            </p>
          </div>

          <!-- TIPO DE INGRESO -->
          <div>
            <label class="mb-1 block text-sm font-medium">
              Tipo de ingreso
            </label>

            <select
              v-model="formulario.tipoIngreso"
              class="w-full rounded-lg border border-gray-300 p-2"
            >
              <option
                v-for="tipo in TIPOS_INGRESO"
                :key="tipo.valor"
                :value="tipo.valor"
              >
                {{ tipo.etiqueta }}
              </option>
            </select>

            <p class="mt-1 text-xs text-gray-500">
              Define las tareas iniciales de enfermería (por ejemplo, ayuno y vía
              intravenosa en un ingreso pre-quirúrgico).
            </p>
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

          <!-- DIAGNÓSTICO -->
          <div>
            <label class="mb-1 block text-sm font-medium">
              Diagnóstico inicial (opcional)
            </label>

            <input
              v-model="formulario.diagnosticoInicial"
              type="text"
              class="w-full rounded-lg border border-gray-300 p-2"
              placeholder="Ej: Neumonía"
            />
          </div>

          <button
            type="submit"
            :disabled="guardando || pacientesDisponibles.length === 0"
            class="rounded-lg bg-teal-600 px-5 py-2 text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ guardando ? 'Confirmando...' : 'Confirmar ingreso' }}
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
              <th class="p-4">Tipo</th>
              <th class="p-4">Motivo</th>
              <th class="p-4">Cama</th>
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
                {{ etiquetaTipoIngreso(internacion.tipoIngreso) }}
              </td>

              <td class="p-4">
                {{ internacion.motivoIngreso }}
              </td>

              <!-- CAMA -->
              <td class="p-4">
                <span
                  v-if="internacion.camaId"
                  class="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                >
                  Cama #{{ internacion.camaId }}
                </span>
                <span
                  v-else-if="internacion.estado === 'ACTIVA'"
                  class="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
                >
                  Sin cama
                </span>
                <span v-else class="text-gray-400">—</span>
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
                colspan="8"
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

      <div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">

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
              Tipo de ingreso
            </p>

            <p class="font-semibold">
              {{ etiquetaTipoIngreso(internacionDetalle.tipoIngreso) }}
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
              Observaciones / diagnóstico inicial
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

          <!-- CAMA -->
          <div class="rounded-lg border border-gray-200 p-3">
            <p class="text-sm text-gray-500">
              Cama
            </p>

            <p v-if="internacionDetalle.camaId" class="font-semibold">
              Cama #{{ internacionDetalle.camaId }}
              <router-link
                :to="`/camas/${internacionDetalle.camaId}`"
                class="ml-2 text-sm font-normal text-indigo-600 hover:underline"
              >
                Ver cama
              </router-link>
            </p>

            <div
              v-else-if="internacionDetalle.estado === 'ACTIVA'"
              class="mt-1 space-y-2"
            >
              <p class="text-sm text-amber-700">
                El paciente todavía no tiene cama asignada.
              </p>

              <div class="flex gap-2">
                <select
                  v-model="camaElegida"
                  class="flex-1 rounded-lg border border-gray-300 p-2 text-sm"
                >
                  <option value="">Seleccionar cama libre…</option>
                  <option
                    v-for="cama in camasLibres"
                    :key="cama.id"
                    :value="cama.id"
                  >
                    Cama {{ cama.numero }}{{ cama.sector ? ` — ${cama.sector}` : '' }}
                  </option>
                </select>

                <button
                  type="button"
                  :disabled="procesandoDetalle || !camaElegida"
                  @click="asignarCamaElegida"
                  class="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  Asignar
                </button>
              </div>

              <p v-if="camasLibres.length === 0" class="text-xs text-gray-500">
                No hay camas libres en este momento.
              </p>
            </div>

            <p v-else class="font-semibold text-gray-400">—</p>
          </div>

          <!-- PROTOCOLO DE CUIDADOS GENERADO AL INGRESAR -->
          <div class="rounded-lg border border-gray-200 p-3">
            <p class="text-sm text-gray-500">
              Protocolo de cuidados
            </p>

            <p v-if="protocolos.length === 0" class="text-sm text-gray-400">
              Sin protocolo generado.
            </p>

            <div v-for="protocolo in protocolos" :key="protocolo.id" class="mt-1">
              <p class="font-semibold">{{ protocolo.nombre }}</p>
              <ul class="mt-1 list-disc space-y-0.5 pl-5 text-sm text-gray-700">
                <li v-for="(paso, indice) in protocolo.pasos" :key="indice">
                  {{ paso }}
                </li>
              </ul>
            </div>
          </div>

        </div>

        <p
          v-if="errorDetalle"
          class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600"
        >
          {{ errorDetalle }}
        </p>

        <!-- ACCIONES -->
        <button
          v-if="internacionDetalle.estado === 'ACTIVA'"
          type="button"
          :disabled="procesandoDetalle"
          @click="finalizarInternacion"
          class="mt-6 w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
        >
          Dar de alta
        </button>

        <button
          type="button"
          @click="cerrarDetalles"
          class="mt-3 w-full rounded-lg bg-teal-600 px-4 py-3 font-semibold text-white hover:bg-teal-700"
        >
          Cerrar
        </button>

      </div>
    </div>

  </main>
</template>
