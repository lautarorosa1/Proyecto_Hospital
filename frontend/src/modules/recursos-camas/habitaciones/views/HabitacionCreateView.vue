<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
      <h1 class="mb-6 text-2xl font-semibold text-gray-900">Crear habitación</h1>

      <form class="flex flex-col gap-5" @submit.prevent="guardar">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-700">Número</label>
          <input v-model="form.numero" type="text" class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-700">Piso</label>
          <input v-model="form.piso" type="text" class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-700">Sector</label>
          <input v-model="form.sector" type="text" class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
        </div>

        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

        <div class="flex gap-3">
          <router-link to="/habitaciones" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
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
import { createHabitacion } from '../services/habitacionService'

const router = useRouter()
const error = ref('')
const form = reactive({ numero: '', piso: '', sector: '' })

const guardar = async () => {
  error.value = ''
  try {
    await createHabitacion({ ...form })
    router.push('/habitaciones')
  } catch (e) {
    error.value = e.response?.data?.error || 'No se pudo crear la habitación'
  }
}
</script>