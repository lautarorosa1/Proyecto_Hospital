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
        <h1 class="text-2xl font-semibold text-gray-900">Insumos</h1>
        <router-link to="/insumos/create">
          <button class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700">
            Crear insumo
          </button>
        </router-link>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left text-sm">
          <thead>
            <tr class="border-b border-gray-200 text-gray-500">
              <th class="px-4 py-3 font-medium">ID</th>
              <th class="px-4 py-3 font-medium">Nombre</th>
              <th class="px-4 py-3 font-medium">Stock</th>
              <th class="px-4 py-3 font-medium">Unidad</th>
              <th class="px-4 py-3 font-medium">Precio</th>
              <th class="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="i in insumos"
              :key="i.id"
              class="border-b border-gray-100 text-gray-700 transition hover:bg-gray-50"
            >
              <td class="px-4 py-3">{{ i.id }}</td>
              <td class="px-4 py-3">{{ i.nombre }}</td>
              <td class="px-4 py-3">{{ i.stock_actual }}</td>
              <td class="px-4 py-3">{{ i.unidad_medida }}</td>
              <td class="px-4 py-3">${{ Number(i.precio).toFixed(2) }}</td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-2">
                  <router-link :to="`/insumos/${i.id}/editar-stock`">
                    <button class="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100">
                      Editar stock
                    </button>
                  </router-link>
                  <button
                    @click="abrirModal(i.id)"
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
      <p v-else-if="insumos.length === 0" class="mt-6 text-center text-sm text-gray-400">
        No hay insumos cargados
      </p>
    </div>
  </div>

  <ConfirmModal
    v-model="mostrarModal"
    titulo="Eliminar insumo"
    mensaje="¿Seguro que querés eliminar este insumo?"
    textoConfirmar="Eliminar"
    @confirm="confirmarEliminar"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ConfirmModal from '@/shared/components/ConfirmModal.vue'
import { getInsumos, deleteInsumo } from '../services/insumoService'

const insumos = ref([])
const errorConexion = ref(false)
const mostrarModal = ref(false)
const seleccionado = ref(null)

const cargar = async () => {
  try {
    const res = await getInsumos()
    insumos.value = res.data
    errorConexion.value = false
  } catch (e) {
    console.error(e)
    errorConexion.value = true
  }
}

const abrirModal = (id) => {
  seleccionado.value = id
  mostrarModal.value = true
}

const confirmarEliminar = async () => {
  try {
    await deleteInsumo(seleccionado.value)
    await cargar()
  } catch (e) {
    console.error(e)
  }
}

onMounted(cargar)
</script>