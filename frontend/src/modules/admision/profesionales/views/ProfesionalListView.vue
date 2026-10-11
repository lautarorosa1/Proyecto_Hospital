<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-5xl rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <router-link to="/admision" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"> ← </router-link>
        <h1 class="text-2xl font-semibold text-gray-900">Lista de Profesionales</h1>

        <router-link to="/profesionales/create">
          <button class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700">
            Crear profesional
          </button>
        </router-link>
      </div>

      <div class="mb-6 grid gap-3 sm:grid-cols-3">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-gray-500">Estado</label>
          <select v-model="filtros.estado" :class="inputClass" @change="cargarProfesionales">
            <option value="">Todos</option>
            <option v-for="estado in ESTADOS_PROFESIONAL" :key="estado.value" :value="estado.value">
              {{ estado.label }}
            </option>
          </select>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-gray-500">Tipo de profesional</label>
          <select v-model="filtros.tipoProfesional" :class="inputClass" @change="cargarProfesionales">
            <option value="">Todos</option>
            <option v-for="tipo in TIPOS_PROFESIONAL" :key="tipo.value" :value="tipo.value">
              {{ tipo.label }}
            </option>
          </select>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-gray-500">ID de especialidad</label>
          <input
            v-model.number="filtros.especialidadId"
            type="number"
            min="1"
            step="1"
            placeholder="Todas"
            :class="inputClass"
            @change="cargarProfesionales"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left text-sm">
          <thead>
            <tr class="border-b border-gray-200 text-gray-500">
              <th class="px-4 py-3 font-medium">ID</th>
              <th class="px-4 py-3 font-medium">Nombre</th>
              <th class="px-4 py-3 font-medium">Apellido</th>
              <th class="px-4 py-3 font-medium">Matrícula</th>
              <th class="px-4 py-3 font-medium">Tipo</th>
              <th class="px-4 py-3 font-medium">Especialidad</th>
              <th class="px-4 py-3 font-medium">Estado</th>
              <th class="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="profesional in profesionales"
              :key="profesional.id"
              class="border-b border-gray-100 text-gray-700 transition hover:bg-gray-50"
            >
              <td class="px-4 py-3">{{ profesional.id }}</td>
              <td class="px-4 py-3">{{ profesional.nombre }}</td>
              <td class="px-4 py-3">{{ profesional.apellido }}</td>
              <td class="px-4 py-3">{{ profesional.matricula }}</td>
              <td class="px-4 py-3">{{ etiquetaTipo(profesional.tipoProfesional) }}</td>
              <td class="px-4 py-3">{{ profesional.especialidadId }}</td>
              <td class="px-4 py-3">
                <span
                  class="rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset"
                  :class="claseEstado(profesional.estado)"
                >
                  {{ etiquetaEstado(profesional.estado) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-2">
                  <router-link :to="`/profesionales/${profesional.id}`">
                    <button class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100">
                      Ver
                    </button>
                  </router-link>

                  <router-link :to="`/profesionales/edit/${profesional.id}`">
                    <button class="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100">
                      Editar
                    </button>
                  </router-link>

                  <button
                    v-if="profesional.estado !== 'inactivo'"
                    class="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
                    @click="abrirModal(profesional.id)"
                  >
                    Dar de baja
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="errorLista" class="mt-6 text-center text-sm text-red-500">
        {{ errorLista }}
      </p>

      <p v-else-if="profesionales.length === 0" class="mt-6 text-center text-sm text-gray-400">
        {{ hayFiltros ? 'No hay profesionales que coincidan con los filtros' : 'No hay profesionales cargados' }}
      </p>

      <p v-if="errorAccion" class="mt-4 text-center text-sm text-red-500">
        {{ errorAccion }}
      </p>
    </div>
  </div>

  <ConfirmModal
    v-model="mostrarModal"
    titulo="Dar de baja profesional"
    mensaje="El profesional pasará a estado inactivo y dejará de recibir turnos. ¿Querés continuar?"
    textoConfirmar="Dar de baja"
    @confirm="confirmarBaja"
  />
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import ConfirmModal from '@/shared/components/ConfirmModal.vue'
import { getProfesionales, darDeBajaProfesional } from '../services/profesionalService'
import {
  TIPOS_PROFESIONAL,
  ESTADOS_PROFESIONAL,
  etiquetaTipo,
  etiquetaEstado,
  claseEstado
} from '../utils/profesionalForm'

const inputClass =
  'rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

const mostrarModal = ref(false)
const profesionalSeleccionado = ref(null)

const profesionales = ref([])
const errorLista = ref('')
const errorAccion = ref('')

const filtros = reactive({ estado: '', tipoProfesional: '', especialidadId: '' })

const hayFiltros = computed(
  () => filtros.estado !== '' || filtros.tipoProfesional !== '' || filtros.especialidadId !== ''
)

const cargarProfesionales = async () => {
  errorLista.value = ''

  // los filtros vacíos no se envían
  const params = {}
  if (filtros.estado) params.estado = filtros.estado
  if (filtros.tipoProfesional) params.tipoProfesional = filtros.tipoProfesional
  if (filtros.especialidadId !== '') params.especialidadId = filtros.especialidadId

  try {
    const response = await getProfesionales(params)
    profesionales.value = response.data
  } catch (error) {
    console.error(error)
    profesionales.value = []
    errorLista.value = error.response
      ? error.response.data?.error || 'Ocurrió un error inesperado'
      : 'No se pudo conectar con el servidor'
  }
}

const abrirModal = (id) => {
  profesionalSeleccionado.value = id
  mostrarModal.value = true
}

const confirmarBaja = async () => {
  errorAccion.value = ''
  try {
    await darDeBajaProfesional(profesionalSeleccionado.value)
    await cargarProfesionales()
  } catch (error) {
    console.error('Error dando de baja al profesional:', error)
    errorAccion.value =
      error.response?.data?.error || 'No se pudo dar de baja al profesional'
  }
}

onMounted(() => {
  cargarProfesionales()
})
</script>
