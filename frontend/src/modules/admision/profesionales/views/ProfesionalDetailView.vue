<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
      <h1 class="mb-6 text-2xl font-semibold text-gray-900">Detalle del profesional</h1>

      <div v-if="profesional" class="flex flex-col divide-y divide-gray-100">
        <div class="flex items-center justify-between py-3">
          <span class="text-sm font-medium text-gray-500">ID</span>
          <span class="text-sm text-gray-900">{{ profesional.id }}</span>
        </div>

        <div class="flex items-center justify-between py-3">
          <span class="text-sm font-medium text-gray-500">Nombre</span>
          <span class="text-sm text-gray-900">{{ profesional.nombre }}</span>
        </div>

        <div class="flex items-center justify-between py-3">
          <span class="text-sm font-medium text-gray-500">Apellido</span>
          <span class="text-sm text-gray-900">{{ profesional.apellido }}</span>
        </div>

        <div class="flex items-center justify-between py-3">
          <span class="text-sm font-medium text-gray-500">DNI</span>
          <span class="text-sm text-gray-900">{{ profesional.dni }}</span>
        </div>

        <div class="flex items-center justify-between py-3">
          <span class="text-sm font-medium text-gray-500">Email</span>
          <span class="text-sm text-gray-900">{{ profesional.email }}</span>
        </div>

        <div class="flex items-center justify-between py-3">
          <span class="text-sm font-medium text-gray-500">Teléfono</span>
          <span class="text-sm text-gray-900">{{ profesional.telefono || '—' }}</span>
        </div>

        <div class="flex items-center justify-between py-3">
          <span class="text-sm font-medium text-gray-500">Matrícula</span>
          <span class="text-sm text-gray-900">{{ profesional.matricula }}</span>
        </div>

        <div class="flex items-center justify-between py-3">
          <span class="text-sm font-medium text-gray-500">Tipo de profesional</span>
          <span class="text-sm text-gray-900">{{ etiquetaTipo(profesional.tipoProfesional) }}</span>
        </div>

        <div class="flex items-center justify-between py-3">
          <span class="text-sm font-medium text-gray-500">ID de especialidad</span>
          <span class="text-sm text-gray-900">{{ profesional.especialidadId }}</span>
        </div>

        <div class="flex items-center justify-between py-3">
          <span class="text-sm font-medium text-gray-500">ID de usuario</span>
          <span class="text-sm text-gray-900">{{ profesional.usuarioId }}</span>
        </div>

        <div class="flex items-center justify-between py-3">
          <span class="text-sm font-medium text-gray-500">Estado</span>
          <span
            class="rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset"
            :class="claseEstado(profesional.estado)"
          >
            {{ etiquetaEstado(profesional.estado) }}
          </span>
        </div>
      </div>

      <div v-else class="flex justify-center py-10">
        <p v-if="errorCarga" class="text-sm text-red-500">{{ errorCarga }}</p>
        <p v-else class="text-sm text-gray-400">Cargando profesional...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getProfesionalById } from '../services/profesionalService'
import { etiquetaTipo, etiquetaEstado, claseEstado } from '../utils/profesionalForm'

const route = useRoute()

const profesional = ref(null)
const errorCarga = ref('')

const cargarProfesional = async () => {
  try {
    const response = await getProfesionalById(route.params.id)
    profesional.value = response.data
  } catch (error) {
    console.error('Error cargando profesional:', error)
    errorCarga.value =
      error.response?.data?.error || 'No se pudo conectar con el servidor'
  }
}

onMounted(() => {
  cargarProfesional()
})
</script>
