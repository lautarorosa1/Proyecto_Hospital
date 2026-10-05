<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
      <h1 class="mb-6 text-2xl font-semibold text-gray-900">Detalle de la paciente</h1>

      <div v-if="paciente" class="flex flex-col divide-y divide-gray-100">
        <div class="flex items-center justify-between py-3">
          <span class="text-sm font-medium text-gray-500">ID</span>
          <span class="text-sm text-gray-900">{{ paciente.id }}</span>
        </div>

        <div class="flex items-center justify-between py-3">
          <span class="text-sm font-medium text-gray-500">Nombre</span>
          <span class="text-sm text-gray-900">{{ paciente.nombre }}</span>
        </div>

        <div class="flex items-center justify-between py-3">
          <span class="text-sm font-medium text-gray-500">Apellido</span>
          <span class="text-sm text-gray-900">{{ paciente.apellido }}</span>
        </div>

        <div class="flex items-center justify-between py-3">
          <span class="text-sm font-medium text-gray-500">DNI</span>
          <span class="text-sm text-gray-900">{{ paciente.dni }}</span>
        </div>

        <div class="flex items-center justify-between py-3">
          <span class="text-sm font-medium text-gray-500">Email</span>
          <span class="text-sm text-gray-900">{{ paciente.email }}</span>
        </div>

        <div class="flex items-center justify-between py-3">
          <span class="text-sm font-medium text-gray-500">Fecha de nacimiento</span>
          <span class="text-sm text-gray-900">{{ formatearFecha(paciente.fechaNacimiento) }}</span>
        </div>

        <div class="flex items-center justify-between py-3">
          <span class="text-sm font-medium text-gray-500">Teléfono</span>
          <span class="text-sm text-gray-900">{{ paciente.telefono || '—' }}</span>
        </div>

        <div class="flex items-center justify-between py-3">
          <span class="text-sm font-medium text-gray-500">Dirección</span>
          <span class="text-sm text-gray-900">{{ paciente.direccion || '—' }}</span>
        </div>
      </div>

      <div v-else class="flex justify-center py-10">
        <p v-if="errorCarga" class="text-sm text-red-500">{{ errorCarga }}</p>
        <p v-else class="text-sm text-gray-400">Cargando paciente...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getPacienteById } from '../services/pacienteService'

const route = useRoute()

const paciente = ref(null)
const errorCarga = ref('')

// "YYYY-MM-DD" -> "DD/MM/YYYY" (sin pasar por Date, para evitar desfases de zona horaria)
const formatearFecha = (iso) => {
  if (!iso) return '—'
  const [anio, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${anio}`
}

const cargarPaciente = async () => {
  try {
    const response = await getPacienteById(route.params.id)
    paciente.value = response.data
  } catch (error) {
    console.error('Error cargando paciente:', error)
    errorCarga.value =
      error.response?.data?.error || 'No se pudo conectar con el servidor'
  }
}

onMounted(() => {
  cargarPaciente()
})
</script>