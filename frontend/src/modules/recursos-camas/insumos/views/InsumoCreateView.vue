<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
      <h1 class="mb-6 text-2xl font-semibold text-gray-900">Crear insumo</h1>

      <form class="flex flex-col gap-5" @submit.prevent="guardar">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-700">Nombre</label>
          <input v-model="form.nombre" type="text" class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-700">Stock inicial</label>
          <input v-model.number="form.stock_actual" type="number" min="0" class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-700">Unidad de medida</label>
          <input v-model="form.unidad_medida" type="text" class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
        </div>

        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

        <div class="flex gap-3">
          <router-link to="/insumos" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancelar
          </router-link>
          <button type="submit" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Guardar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createInsumo } from '../services/insumoService'

const router = useRouter()
const error = ref('')
const form = reactive({ nombre: '', stock_actual: 0, unidad_medida: '' })

const guardar = async () => {
  error.value = ''
  try {
    await createInsumo({ ...form })
    router.push('/insumos')
  } catch (e) {
    error.value = e.response?.data?.error || 'No se pudo crear el insumo'
  }
}
</script>