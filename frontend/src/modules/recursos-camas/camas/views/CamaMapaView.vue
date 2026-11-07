<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-5xl rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <router-link
          to="/recursos-camas"
          class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
        >
          ←
        </router-link>
        <h1 class="text-2xl font-semibold text-gray-900">Mapa de camas</h1>
        <router-link to="/camas/create">
          <button class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700">
            Crear cama
          </button>
        </router-link>
      </div>

      <div class="mb-6 grid gap-3 sm:grid-cols-3">
        <select v-model="filtros.estado" class="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">Todos los estados</option>
          <option>Libre</option>
          <option>Ocupada</option>
          <option>En limpieza</option>
          <option>Bloqueada</option>
        </select>
        <input
          v-model="filtros.sector"
          type="text"
          placeholder="Sector (ej: Clinica)"
          class="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          @click="cargar"
          class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Filtrar
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left text-sm">
          <thead>
            <tr class="border-b border-gray-200 text-gray-500">
              <th class="px-4 py-3 font-medium">ID</th>
              <th class="px-4 py-3 font-medium">Número</th>
              <th class="px-4 py-3 font-medium">Habitación</th>
              <th class="px-4 py-3 font-medium">Sector</th>
              <th class="px-4 py-3 font-medium">Estado</th>
              <th class="px-4 py-3 font-medium">Version</th>
              <th class="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="c in camas"
              :key="c.id"
              class="border-b border-gray-100 text-gray-700 transition hover:bg-gray-50"
            >
              <td class="px-4 py-3">{{ c.id }}</td>
              <td class="px-4 py-3">{{ c.numero }}</td>
              <td class="px-4 py-3">{{ c.habitacion_id }}</td>
              <td class="px-4 py-3">{{ c.sector }}</td>
              <td class="px-4 py-3">{{ c.estado }}</td>
              <td class="px-4 py-3">{{ c.version }}</td>
              <td class="px-4 py-3">
                <router-link :to="`/camas/${c.id}`">
                  <button class="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100">
                    Gestionar
                  </button>
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="error" class="mt-6 text-center text-sm text-red-500">{{ error }}</p>
      <p v-else-if="camas.length === 0" class="mt-6 text-center text-sm text-gray-400">
        No hay camas para mostrar
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { getMapaCamas } from '../services/camaService'

const camas = ref([])
const error = ref('')
const filtros = reactive({ estado: '', sector: '' })

const cargar = async () => {
  error.value = ''
  try {
    const params = {}
    if (filtros.estado) params.estado = filtros.estado
    if (filtros.sector.trim()) params.sector = filtros.sector.trim()
    const res = await getMapaCamas(params)
    camas.value = res.data
  } catch (e) {
    error.value = e.response?.data?.error || 'No se pudo cargar el mapa'
  }
}

onMounted(cargar)
</script>