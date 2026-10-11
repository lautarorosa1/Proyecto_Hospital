<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    @click.self="cancelar"
  >
    <div class="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
      <h2 class="text-lg font-semibold text-gray-900">{{ titulo }}</h2>

      <p class="mt-2 text-sm text-gray-500">
        {{ mensaje }}
      </p>

      <div class="mt-6 flex justify-end gap-3">
        <button
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          @click="cancelar"
        >
          Cancelar
        </button>

        <button
          class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700"
          @click="confirmar"
        >
          {{ textoConfirmar }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  titulo: {
    type: String,
    default: 'Confirmar acción'
  },
  mensaje: {
    type: String,
    default: '¿Estás seguro?'
  },
  textoConfirmar: {
    type: String,
    default: 'Eliminar'
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const cancelar = () => {
  emit('update:modelValue', false)
}

const confirmar = () => {
  emit('confirm')
  emit('update:modelValue', false)
}
</script>