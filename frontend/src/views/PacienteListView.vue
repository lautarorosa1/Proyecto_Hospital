<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-5xl rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-2xl font-semibold text-gray-900">Lista de Pacientes</h1>

        <router-link to="/pacientes/create">
          <button class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700">
            Crear paciente
          </button>
        </router-link>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left text-sm">
          <thead>
            <tr class="border-b border-gray-200 text-gray-500">
              <th class="px-4 py-3 font-medium">ID</th>
              <th class="px-4 py-3 font-medium">Nombre</th>
              <th class="px-4 py-3 font-medium">Apellido</th>
              <th class="px-4 py-3 font-medium">DNI</th>
              <th class="px-4 py-3 font-medium">Email</th>
              <th class="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="paciente in pacientes"
              :key="paciente.id"
              class="border-b border-gray-100 text-gray-700 transition hover:bg-gray-50"
            >
              <td class="px-4 py-3">{{ paciente.id }}</td>
              <td class="px-4 py-3">{{ paciente.nombre }}</td>
              <td class="px-4 py-3">{{ paciente.apellido }}</td>
              <td class="px-4 py-3">{{ paciente.dni }}</td>
              <td class="px-4 py-3">{{ paciente.email }}</td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-2">
                  <router-link :to="`/pacientes/${paciente.id}`">
                    <button class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100">
                      Ver
                    </button>
                  </router-link>

                  <router-link :to="`/pacientes/edit/${paciente.id}`">
                    <button class="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100">
                      Editar
                    </button>
                  </router-link>

                  <button
                    @click="abrirModal(paciente.id)"
                    class="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="errorConexion" class="mt-6 text-center text-sm text-red-500">
        No se pudo conectar con el servidor
      </p>

      <p v-else-if="pacientes.length === 0" class="mt-6 text-center text-sm text-gray-400">
        No hay pacientes cargados
      </p>
    </div>
  </div>

  <ConfirmModal
    v-model="mostrarModal"
    titulo="Eliminar paciente"
    mensaje="¿Seguro que querés eliminar esta paciente?"
    textoConfirmar="Eliminar"
    @confirm="confirmarEliminar"
  />
</template>

<script setup>
import ConfirmModal from '@/components/ConfirmModal.vue'
import { ref, onMounted } from 'vue'
import { getPacientes, deletePaciente } from '../services/pacienteService'

const mostrarModal = ref(false)
const pacienteSeleccionada = ref(null)

const pacientes = ref([])
const errorConexion = ref(false)

const cargarPacientes = async () => {
  try {
    const response = await getPacientes()
    pacientes.value = response.data
  } catch (error) {
    console.error(error)
    errorConexion.value = true
  }
}

const abrirModal = (id) => {
  pacienteSeleccionada.value = id
  mostrarModal.value = true
}

const confirmarEliminar = async () => {
  try {
    await deletePaciente(pacienteSeleccionada.value)
    await cargarPacientes()
  } catch (error) {
    console.error('Error eliminando paciente:', error)
  }
}

onMounted(() => {
  cargarPacientes()
})
</script>