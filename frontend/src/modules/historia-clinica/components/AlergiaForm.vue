
<script setup>
import { reactive, ref, watch } from 'vue'

const emit = defineEmits(['guardar', 'cancelar'])

const props = defineProps({
  alergia: {
    type: Object,
    default: null
  },
  error: {
    type: String,
    default: ''
  },
  guardando: {
    type: Boolean,
    default: false
  }
})

const formulario = reactive({
  alergeno: '',
  reaccion: '',
  severidad: ''
})

const mensaje = ref('')

watch(
  () => props.alergia,
  (nuevaAlergia) => {
    formulario.alergeno = nuevaAlergia?.alergeno ?? ''
    formulario.reaccion = nuevaAlergia?.reaccion ?? ''
    formulario.severidad = nuevaAlergia?.severidad ?? ''
    mensaje.value = ''
  },
  { immediate: true }
)

function validarFormulario() {
  mensaje.value = ''

  const alergeno = formulario.alergeno.trim()
  const reaccion = formulario.reaccion.trim()

  if (!alergeno || !reaccion || !formulario.severidad) {
    mensaje.value = 'Todos los campos son obligatorios.'
    return
  }

  if (alergeno.length > 150) {
    mensaje.value = 'El alérgeno no puede superar los 150 caracteres.'
    return
  }

  if (reaccion.length > 255) {
    mensaje.value = 'La reacción no puede superar los 255 caracteres.'
    return
  }

  if (!['leve', 'moderada', 'alta'].includes(formulario.severidad)) {
    mensaje.value = 'La severidad debe ser leve, moderada o alta.'
    return
  }

  emit('guardar', {
    alergeno,
    reaccion,
    severidad: formulario.severidad
  })
}
</script>

<template>
  <form class="formulario" @submit.prevent="validarFormulario">
    <h2>
      {{ alergia ? 'Editar alergia' : 'Registrar nueva alergia' }}
    </h2>

    <div class="campo">
      <label for="alergeno">Alérgeno</label>
      <input
        id="alergeno"
        v-model="formulario.alergeno"
        type="text"
        maxlength="150"
        placeholder="Ej.: Penicilina"
        required
      />
    </div>

    <div class="campo">
      <label for="reaccion">Reacción</label>
      <textarea
        id="reaccion"
        v-model="formulario.reaccion"
        maxlength="255"
        placeholder="Ej.: Erupción cutánea"
        rows="3"
        required
      ></textarea>
    </div>

    <div class="campo">
      <label for="severidad">Severidad</label>
      <select id="severidad" v-model="formulario.severidad" required>
        <option value="">Seleccionar severidad</option>
        <option value="leve">Leve</option>
        <option value="moderada">Moderada</option>
        <option value="alta">Alta</option>
      </select>
    </div>

    <p v-if="mensaje" class="mensaje">{{ mensaje }}</p>
    <p v-if="error" class="mensaje">{{ error }}</p>

    <button type="submit" :disabled="guardando">
      {{ guardando ? 'Guardando...' : 'Guardar' }}
    </button>
  </form>
</template>

<style scoped>
.formulario {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-panel);
  padding: 25px;
  margin-top: 25px;
}

h2 {
  font-size: var(--font-heading-2);
  font-weight: 600;
  margin-bottom: 20px;
}

.campo {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  gap: 8px;
}

label {
  font-weight: 600;
}

input,
textarea,
select {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-control);
  font: inherit;
}

.mensaje {
  color: var(--color-neutral-600);
  margin-bottom: 15px;
}

button {
  padding: 12px 20px;
  border: none;
  border-radius: var(--radius-control);
  background: var(--color-primary, #2563eb);
  color: white;
  font-weight: 600;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

