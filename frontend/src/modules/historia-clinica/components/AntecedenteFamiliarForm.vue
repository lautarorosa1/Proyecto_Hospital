
<script setup>

import { reactive, watch } from 'vue'

const props = defineProps({
  antecedenteEditar: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['guardar', 'cancelar'])

const formulario = reactive({
  parentesco: '',
  enfermedad: '',
  observaciones: ''
})

function limpiarFormulario() {
  formulario.parentesco = ''
  formulario.enfermedad = ''
  formulario.observaciones = ''
}

watch(
  () => props.antecedenteEditar,
  (antecedente) => {
    if (antecedente) {
      formulario.parentesco = antecedente.parentesco
      formulario.enfermedad = antecedente.enfermedad
      formulario.observaciones = antecedente.observaciones || ''
    } else {
      limpiarFormulario()
    }
  },
  { immediate: true }
)

function guardar() {
  if (!formulario.parentesco || !formulario.enfermedad.trim()) {
    alert('Completá los campos obligatorios')
    return
  }

  emit('guardar', {
    parentesco: formulario.parentesco,
    enfermedad: formulario.enfermedad.trim(),
    observaciones: formulario.observaciones.trim()
  })

  if (!props.antecedenteEditar) {
    limpiarFormulario()
  }
}

function cancelar() {
  limpiarFormulario()
  emit('cancelar')
}
</script>

<template>
  <form class="formulario" @submit.prevent="guardar">
    
<h2>
  {{ antecedenteEditar
    ? 'Editar antecedente familiar'
    : 'Registrar antecedente familiar'
  }}
</h2>

    <label for="parentesco">Parentesco *</label>
    <select id="parentesco" v-model="formulario.parentesco" required>
      <option value="">Seleccionar parentesco</option>
      <option value="Madre">Madre</option>
      <option value="Padre">Padre</option>
      <option value="Hermano/a">Hermano/a</option>
      <option value="Abuelo/a">Abuelo/a</option>
      <option value="Otro">Otro</option>
    </select>

    <label for="enfermedad">Enfermedad o condición *</label>
    <input
      id="enfermedad"
      v-model="formulario.enfermedad"
      type="text"
      placeholder="Ej: Diabetes"
      required
    />

    <label for="observaciones">Observaciones</label>
    <textarea
      id="observaciones"
      v-model="formulario.observaciones"
      placeholder="Información adicional"
      rows="4"
    ></textarea>

    
<div class="acciones-formulario">
  <button type="submit">
    {{ antecedenteEditar ? 'Guardar cambios' : 'Guardar antecedente' }}
  </button>

  <button
    v-if="antecedenteEditar"
    type="button"
    class="cancelar"
    @click="cancelar"
  >
    Cancelar edición
  </button>
</div>

  </form>
</template>

<style scoped>
.formulario {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-panel);
}

h2 {
  margin: 0 0 10px;
  font-size: var(--font-heading-2);
  color: var(--color-neutral-900);
}

label {
  font-weight: 600;
  color: var(--color-neutral-700);
}

input,
select,
textarea {
  padding: 12px;
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-control);
  font: inherit;
}

.acciones-formulario {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

</style>
