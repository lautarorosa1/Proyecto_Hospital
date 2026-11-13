<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
      <h1 class="mb-6 text-2xl font-semibold text-gray-900">Crear insumo</h1>

      <form class="flex flex-col gap-5" @submit.prevent="guardar">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-700">Nombre</label>
          <input
            v-model="form.nombre"
            type="text"
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-700">Stock inicial</label>
          <input
            v-model.number="form.stock_actual"
            type="number"
            min="0"
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-700">Unidad de medida</label>
          <select
            v-model="unidadSeleccionada"
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option disabled value="">Seleccionar unidad</option>
            <option v-for="u in unidadesComunes" :key="u" :value="u">{{ u }}</option>
            <option value="__otro__">Otro</option>
          </select>
          <input
            v-if="unidadSeleccionada === '__otro__'"
            v-model="unidadOtra"
            type="text"
            placeholder="Escribí la unidad"
            class="mt-2 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
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
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createInsumo } from '../services/insumoService'

const router = useRouter()
const error = ref('')
const unidadesComunes = ['unidad', 'caja', 'ml', 'mg', 'ampolla']
const unidadSeleccionada = ref('')
const unidadOtra = ref('')
const form = reactive({ nombre: '', stock_actual: 0, precio: null })

const guardar = async () => {
  error.value = ''
  const unidad =
    unidadSeleccionada.value === '__otro__'
      ? unidadOtra.value.trim()
      : unidadSeleccionada.value

  if (!unidad) {
    error.value = 'La unidad de medida es obligatoria'
    return
  }
  if (typeof form.precio !== 'number' || form.precio <= 0) {
    error.value = 'El precio debe ser mayor a 0'
    return
  }

  try {
    await createInsumo({
      nombre: form.nombre,
      stock_actual: form.stock_actual,
      unidad_medida: unidad,
      precio: form.precio,
    })
    router.push('/insumos')
  } catch (e) {
    error.value = e.response?.data?.error || 'No se pudo crear el insumo'
  }
}
</script>
