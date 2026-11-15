
<script setup>
import { reactive, ref, watch } from 'vue'

const props = defineProps({
  estudio: { type: Object, default: null },
  guardando: { type: Boolean, default: false },
  error: { type: String, default: '' }
})

const emit = defineEmits(['guardar'])

const formulario = reactive({
  fecha: '',
  tipoEstudio: '',
  descripcion: '',
  resultado: ''
})

const mensaje = ref('')

// Fecha de hoy en hora local, formato AAAA-MM-DD
function fechaDeHoy() {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

watch(
  () => props.estudio,
  (nuevoEstudio) => {
    formulario.fecha = nuevoEstudio?.fecha ?? ''
    formulario.tipoEstudio = nuevoEstudio?.tipoEstudio ?? ''
    formulario.descripcion = nuevoEstudio?.descripcion ?? ''
    formulario.resultado = nuevoEstudio?.resultado ?? ''
    mensaje.value = ''
  },
  { immediate: true }
)

function enviar() {
  mensaje.value = ''

  const tipoEstudio = formulario.tipoEstudio.trim()
  const descripcion = formulario.descripcion.trim()
  const resultado = formulario.resultado.trim()

  if (!formulario.fecha || !tipoEstudio || !descripcion) {
    mensaje.value = 'Completá todos los campos obligatorios.'
    return
  }

  if (formulario.fecha > fechaDeHoy()) {
    mensaje.value = 'La fecha del estudio no puede ser posterior a hoy.'
    return
  }

  if (tipoEstudio.length > 150) {
    mensaje.value = 'El tipo de estudio no puede superar los 150 caracteres.'
    return
  }

  if (descripcion.length > 2000) {
    mensaje.value = 'La descripción no puede superar los 2000 caracteres.'
    return
  }

  if (resultado.length > 2000) {
    mensaje.value = 'El resultado no puede superar los 2000 caracteres.'
    return
  }

  emit('guardar', {
    fecha: formulario.fecha,
    tipoEstudio,
    descripcion,
    resultado
  })
}
</script>

<template>
  <form class="formulario" @submit.prevent="enviar">
    <h2>
      {{ estudio ? 'Editar estudio médico' : 'Registrar estudio médico' }}
    </h2>

    <div class="campo">
      <label for="fecha">Fecha del estudio *</label>
      <input
        id="fecha"
        v-model="formulario.fecha"
        type="date"
        :max="fechaDeHoy()"
      />
    </div>

    <div class="campo">
      <label for="tipoEstudio">Tipo de estudio *</label>
      <input
        id="tipoEstudio"
        v-model="formulario.tipoEstudio"
        type="text"
        maxlength="150"
        placeholder="Ej: Radiografía, análisis de sangre..."
      />
    </div>

    <div class="campo">
      <label for="descripcion">Descripción *</label>
      <textarea
        id="descripcion"
        v-model="formulario.descripcion"
        rows="4"
        maxlength="2000"
        placeholder="Descripción del estudio..."
      ></textarea>
    </div>

    <div class="campo">
      <label for="resultado">Resultado</label>
      <textarea
        id="resultado"
        v-model="formulario.resultado"
        rows="4"
        maxlength="2000"
        placeholder="Resultado del estudio..."
      ></textarea>
    </div>

    <p v-if="mensaje" class="error" role="status">{{ mensaje }}</p>
    <p v-if="error" class="error" role="alert">{{ error }}</p>

    <button type="submit" :disabled="guardando">
      {{
        guardando
          ? 'Guardando...'
          : estudio
            ? 'Guardar cambios'
            : 'Guardar estudio'
      }}
    </button>
  </form>
</template>

<style scoped>
.formulario {
  margin-top: 20px;
  padding: 25px;
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-panel);
}

h2 {
  margin-bottom: 20px;
  color: var(--color-neutral-900);
}

.campo {
  display: flex;
  flex-direction: column;
  margin-bottom: 18px;
}

label {
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--color-neutral-700);
}

input,
textarea {
  padding: 10px;
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-control);
  font: inherit;
}


button {
  padding: 12px 20px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

button:hover {
  background: #1d4ed8;
}

button:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.error {
  color: var(--color-danger-hover);
  margin-bottom: 15px;
}

.exito {
  color: var(--color-success);
  margin-bottom: 15px;
}
</style>
