
<template>
  <div class="min-h-screen bg-gray-50 px-6 py-8">
    <div class="mx-auto max-w-7xl">

      <!-- Volver al menú -->
      <router-link
        to="/atencion-enfermeria"
        class="mb-6 inline-flex items-center text-sm font-medium text-teal-700 hover:text-teal-900"
      >
        ← Volver a Atención de Enfermería
      </router-link>

      <!-- Encabezado -->
      <div class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            Protocolos de Enfermería
          </h1>
          <p class="mt-2 text-gray-500">
            Administración y consulta de los protocolos de atención.
          </p>
        </div>

        <button
          @click="abrirFormularioNuevo"
          class="rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800"
        >
          + Nuevo protocolo
        </button>
      </div>

      <!-- Mensajes -->
      <div
        v-if="mensaje"
        class="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700"
      >
        {{ mensaje }}
      </div>

      <div
        v-if="error"
        class="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
      >
        {{ error }}
      </div>

      <!-- Estadísticas -->
      <div class="mb-7 grid gap-4 sm:grid-cols-2">
        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p class="text-sm text-gray-500">Total de protocolos</p>
          <p class="mt-2 text-3xl font-bold text-gray-900">
            {{ protocolos.length }}
          </p>
        </div>

        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p class="text-sm text-gray-500">Total de pasos registrados</p>
          <p class="mt-2 text-3xl font-bold text-teal-700">
            {{ totalPasos }}
          </p>
        </div>
      </div>

      <!-- Buscador -->
      <div class="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <label class="mb-2 block text-sm font-medium text-gray-700">
          Buscar protocolo
        </label>

        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar por nombre o descripción..."
          class="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
        />
      </div>

      <!-- Listado -->
      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div class="border-b border-gray-200 px-5 py-4">
          <h2 class="font-semibold text-gray-900">
            Protocolos registrados
          </h2>
        </div>

        <div v-if="cargando" class="p-8 text-center text-gray-500">
          Cargando protocolos...
        </div>

        <div
          v-else-if="protocolosFiltrados.length === 0"
          class="p-8 text-center text-gray-500"
        >
          No se encontraron protocolos.
        </div>

        <div v-else class="divide-y divide-gray-200">
          <div
            v-for="protocolo in protocolosFiltrados"
            :key="protocolo.id"
            class="p-5 transition hover:bg-gray-50"
          >
            <div class="flex flex-col justify-between gap-4 md:flex-row">
              <div class="min-w-0 flex-1">
                <div class="mb-2 flex flex-wrap items-center gap-3">
                  <h3 class="text-lg font-bold text-gray-900">
                    {{ protocolo.nombre }}
                  </h3>

                  <span class="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800">
                    {{ protocolo.pasos?.length || 0 }} pasos
                  </span>
                </div>

                <p class="mb-3 text-sm text-gray-600">
                  {{ protocolo.descripcion }}
                </p>

                <p class="text-sm text-gray-500">
                  Protocolo N.º {{ protocolo.id }}
                </p>
              </div>

              <div class="flex flex-wrap items-start gap-2">
                <button
                  @click="verDetalles(protocolo)"
                  class="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Ver
                </button>

                <button
                  @click="editarProtocolo(protocolo)"
                  class="rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                >
                  Editar
                </button>

                <button
                  @click="eliminar(protocolo)"
                  class="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- MODAL DE REGISTRO Y EDICIÓN -->
    <div
      v-if="mostrarFormulario"
      class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
    >
      <div class="my-8 w-full max-w-2xl rounded-xl bg-white shadow-xl">
        <div class="flex items-center justify-between border-b border-gray-200 p-5">
          <h2 class="text-xl font-bold text-gray-900">
            {{ modoEdicion ? 'Editar protocolo' : 'Registrar protocolo' }}
          </h2>

          <button
            @click="cerrarFormulario"
            class="text-2xl text-gray-400 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <form @submit.prevent="guardarProtocolo" class="space-y-5 p-5">

          <!-- Nombre -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Nombre del protocolo *
            </label>

            <input
              v-model="formulario.nombre"
              type="text"
              required
              maxlength="150"
              placeholder="Ej: Higiene y confort del paciente"
              class="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-teal-600"
            />
          </div>

          <!-- Descripción -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Descripción *
            </label>

            <textarea
              v-model="formulario.descripcion"
              required
              rows="3"
              placeholder="Describí el objetivo del protocolo..."
              class="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-teal-600"
            ></textarea>
          </div>

          <!-- Pasos -->
          <div>
            <div class="mb-3 flex items-center justify-between">
              <label class="text-sm font-medium text-gray-700">
                Pasos del procedimiento *
              </label>

              <button
                type="button"
                @click="agregarPaso"
                class="rounded-lg bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-100"
              >
                + Agregar paso
              </button>
            </div>

            <div
              v-for="(paso, index) in formulario.pasos"
              :key="index"
              class="mb-3 flex items-start gap-3"
            >
              <span class="mt-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-800">
                {{ index + 1 }}
              </span>

              <textarea
                v-model="formulario.pasos[index]"
                required
                rows="2"
                :placeholder="`Describí el paso ${index + 1}...`"
                class="flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-teal-600"
              ></textarea>

              <button
                v-if="formulario.pasos.length > 1"
                type="button"
                @click="quitarPaso(index)"
                class="mt-2 rounded-lg px-2 py-1 text-red-600 hover:bg-red-50"
                title="Quitar paso"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Botones -->
          <div class="flex justify-end gap-3 border-t border-gray-200 pt-5">
            <button
              type="button"
              @click="cerrarFormulario"
              class="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              :disabled="guardando"
              class="rounded-lg bg-teal-700 px-5 py-2.5 font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ guardando ? 'Guardando...' : modoEdicion ? 'Guardar cambios' : 'Registrar protocolo' }}
            </button>
          </div>

        </form>
      </div>
    </div>

    <!-- MODAL DE DETALLES -->
    <div
      v-if="protocoloSeleccionado"
      class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
    >
      <div class="my-8 w-full max-w-2xl rounded-xl bg-white shadow-xl">
        <div class="flex items-center justify-between border-b border-gray-200 p-5">
          <h2 class="text-xl font-bold text-gray-900">
            Detalles del protocolo
          </h2>

          <button
            @click="protocoloSeleccionado = null"
            class="text-2xl text-gray-400 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div class="space-y-5 p-5">
          <div>
            <p class="text-sm text-gray-500">Nombre</p>
            <h3 class="mt-1 text-xl font-bold text-gray-900">
              {{ protocoloSeleccionado.nombre }}
            </h3>
          </div>

          <div>
            <p class="text-sm text-gray-500">Descripción</p>
            <p class="mt-1 text-gray-700">
              {{ protocoloSeleccionado.descripcion }}
            </p>
          </div>

          <div>
            <p class="mb-3 text-sm font-semibold text-gray-700">
              Pasos del procedimiento
            </p>

            <ol class="space-y-3">
              <li
                v-for="(paso, index) in protocoloSeleccionado.pasos"
                :key="index"
                class="flex gap-3 rounded-lg bg-gray-50 p-3"
              >
                <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-800">
                  {{ index + 1 }}
                </span>

                <p class="text-gray-700">{{ paso }}</p>
              </li>
            </ol>
          </div>
        </div>

        <div class="flex justify-end border-t border-gray-200 p-5">
          <button
            @click="protocoloSeleccionado = null"
            class="rounded-lg bg-gray-100 px-5 py-2 font-medium text-gray-700 hover:bg-gray-200"
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

import {
  listarProtocolos,
  crearProtocolo,
  actualizarProtocolo,
  eliminarProtocolo
} from '../services/protocoloService'

// Estados
const protocolos = ref([])
const cargando = ref(false)
const guardando = ref(false)
const mostrarFormulario = ref(false)
const modoEdicion = ref(false)
const protocoloSeleccionado = ref(null)

const busqueda = ref('')
const mensaje = ref('')
const error = ref('')

// Formulario
const formulario = ref({
  id: null,
  nombre: '',
  descripcion: '',
  pasos: ['']
})

// Estadísticas
const totalPasos = computed(() => {
  return protocolos.value.reduce(
    (total, protocolo) => total + (protocolo.pasos?.length || 0),
    0
  )
})

// Filtrar protocolos
const protocolosFiltrados = computed(() => {
  const texto = busqueda.value.toLowerCase().trim()

  if (!texto) return protocolos.value

  return protocolos.value.filter(protocolo =>
    protocolo.nombre?.toLowerCase().includes(texto) ||
    protocolo.descripcion?.toLowerCase().includes(texto)
  )
})

// Cargar protocolos desde el backend
const cargarProtocolos = async () => {
  cargando.value = true
  error.value = ''

  try {
    const respuesta = await listarProtocolos()
    protocolos.value = Array.isArray(respuesta) ? respuesta : []
  } catch (err) {
    console.error('Error al cargar protocolos:', err)
    error.value = err.response?.data?.error ||
      'No se pudieron cargar los protocolos. Verificá que el backend esté funcionando.'
  } finally {
    cargando.value = false
  }
}

// Limpiar formulario
const limpiarFormulario = () => {
  formulario.value = {
    id: null,
    nombre: '',
    descripcion: '',
    pasos: ['']
  }
}

// Abrir formulario nuevo
const abrirFormularioNuevo = () => {
  limpiarFormulario()
  modoEdicion.value = false
  mensaje.value = ''
  error.value = ''
  mostrarFormulario.value = true
}

// Editar protocolo
const editarProtocolo = (protocolo) => {
  formulario.value = {
    id: protocolo.id,
    nombre: protocolo.nombre,
    descripcion: protocolo.descripcion,
    pasos: protocolo.pasos?.length ? [...protocolo.pasos] : ['']
  }

  modoEdicion.value = true
  mensaje.value = ''
  error.value = ''
  mostrarFormulario.value = true
}

// Cerrar formulario
const cerrarFormulario = () => {
  mostrarFormulario.value = false
  limpiarFormulario()
}

// Agregar paso
const agregarPaso = () => {
  formulario.value.pasos.push('')
}

// Quitar paso
const quitarPaso = (index) => {
  formulario.value.pasos.splice(index, 1)
}

// Guardar protocolo
const guardarProtocolo = async () => {
  mensaje.value = ''
  error.value = ''

  const nombre = formulario.value.nombre.trim()
  const descripcion = formulario.value.descripcion.trim()
  const pasos = formulario.value.pasos
    .map(paso => paso.trim())
    .filter(paso => paso.length > 0)

  if (!nombre || !descripcion) {
    error.value = 'Completá el nombre y la descripción.'
    return
  }

  if (pasos.length === 0) {
    error.value = 'El protocolo debe tener al menos un paso.'
    return
  }

  const datos = {
    nombre,
    descripcion,
    pasos
  }

  guardando.value = true

  try {
    if (modoEdicion.value) {
      await actualizarProtocolo(formulario.value.id, datos)
      mensaje.value = 'Protocolo actualizado correctamente.'
    } else {
      await crearProtocolo(datos)
      mensaje.value = 'Protocolo registrado correctamente.'
    }

    cerrarFormulario()
    await cargarProtocolos()
  } catch (err) {
    console.error('Error al guardar protocolo:', err)
    error.value = err.response?.data?.error ||
      err.response?.data?.message ||
      'No se pudo guardar el protocolo.'
  } finally {
    guardando.value = false
  }
}

// Ver detalles
const verDetalles = (protocolo) => {
  protocoloSeleccionado.value = protocolo
}

// Eliminar protocolo
const eliminar = async (protocolo) => {
  const confirmar = window.confirm(
    `¿Estás seguro de que querés eliminar el protocolo "${protocolo.nombre}"?`
  )

  if (!confirmar) return

  mensaje.value = ''
  error.value = ''

  try {
    await eliminarProtocolo(protocolo.id)
    mensaje.value = 'Protocolo eliminado correctamente.'
    await cargarProtocolos()
  } catch (err) {
    console.error('Error al eliminar protocolo:', err)
    error.value = err.response?.data?.error ||
      'No se pudo eliminar el protocolo.'
  }
}

// Carga inicial
onMounted(() => {
  cargarProtocolos()
})
</script>