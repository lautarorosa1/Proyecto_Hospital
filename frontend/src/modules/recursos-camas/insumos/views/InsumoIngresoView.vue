<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
      <h1 class="mb-2 text-2xl font-semibold text-gray-900">Ingresar stock</h1>
      <p v-if="insumo" class="mb-6 text-sm text-gray-500">
        {{ insumo.nombre }} — stock actual: {{ insumo.stock_actual }} {{ insumo.unidad_medida }}
      </p>

      <form class="flex flex-col gap-5" @submit.prevent="guardar">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-700">Cantidad</label>
          <input v-model.number="form.cantidad" type="number" min="1" class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-700">Referencia ID</label>
          <input v-model.number="form.referencia_id" type="number" min="1" class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
        </div>

        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

        <div class="flex gap-3">
          <router-link to="/insumos" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancelar
          </router-link>
          <button type="submit" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Ingresar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getInsumoById, ingresarStock } from '../services/insumoService'

const route = useRoute()
const router = useRouter()
const insumo = ref(null)
const error = ref('')
const form = reactive({ cantidad: 1, referencia_id: 1 })

onMounted(async () => {
  try {
    const res = await getInsumoById(route.params.id)
    insumo.value = res.data
  } catch (e) {
    error.value = e.response?.data?.error || 'No se pudo cargar el insumo'
  }
})

const guardar = async () => {
  error.value = ''
  try {
    await ingresarStock(route.params.id, { ...form })
    router.push('/insumos')
  } catch (e) {
    error.value = e.response?.data?.error || 'No se pudo ingresar stock'
  }
}
</script>