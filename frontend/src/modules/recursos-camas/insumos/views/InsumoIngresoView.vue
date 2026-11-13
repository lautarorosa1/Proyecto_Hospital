<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
      <h1 class="mb-2 text-2xl font-semibold text-gray-900">Editar stock</h1>
      <p v-if="insumo" class="mb-6 text-sm text-gray-500">
        {{ insumo.nombre }} — stock: {{ insumo.stock_actual }} {{ insumo.unidad_medida }} — precio: ${{ formatPrecio(insumo.precio) }}
      </p>

      <form class="flex flex-col gap-5" @submit.prevent="guardar">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-700">Stock</label>
          <input
            v-model.number="form.stock_actual"
            type="number"
            min="0"
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
          <p class="text-xs text-gray-400">
            Podés subir o bajar el stock al valor que quieras (por ejemplo de 100 a 50 o a 102).
          </p>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-700">Precio</label>
          <div class="relative">
            <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-gray-500">$</span>
            <input
              v-model.number="form.precio"
              type="number"
              min="0.01"
              step="0.01"
              class="w-full rounded-lg border border-gray-300 py-2 pl-7 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <p class="text-xs text-gray-400">
            Podés subir o bajar el precio, pero no puede ser 0.
          </p>
        </div>

        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

        <div class="flex gap-3">
          <router-link
            to="/insumos"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </router-link>
          <button
            type="submit"
            class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getInsumoById, updateInsumo } from '../services/insumoService'

const route = useRoute()
const router = useRouter()
const insumo = ref(null)
const error = ref('')
const form = reactive({ stock_actual: 0, precio: 0 })

const formatPrecio = (valor) => {
  const n = Number(valor)
  if (Number.isNaN(n)) return '-'
  return n.toFixed(2)
}

onMounted(async () => {
  try {
    const res = await getInsumoById(route.params.id)
    insumo.value = res.data
    form.stock_actual = res.data.stock_actual
    form.precio = Number(res.data.precio)
  } catch (e) {
    error.value = e.response?.data?.error || 'No se pudo cargar el insumo'
  }
})

const guardar = async () => {
  error.value = ''
  if (typeof form.precio !== 'number' || form.precio <= 0) {
    error.value = 'El precio debe ser mayor a 0'
    return
  }
  try {
    await updateInsumo(route.params.id, {
      stock_actual: form.stock_actual,
      precio: form.precio,
    })
    router.push('/insumos')
  } catch (e) {
    error.value = e.response?.data?.error || 'No se pudo editar el insumo'
  }
}
</script>
