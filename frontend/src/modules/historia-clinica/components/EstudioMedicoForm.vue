
<script setup>
import { reactive, ref, watch } from 'vue'

const props = defineProps({
  estudio: {
    type: Object,
    default: null
  }
})

const formulario = reactive({
  fecha: '',
  tipoEstudio: '',
  descripcion: '',
  resultado: ''
})

const mensaje = ref('')
const formularioValido = ref(false)

watch(
  () => props.estudio,
  (nuevoEstudio) => {
    formulario.fecha = nuevoEstudio?.fecha ?? ''
    formulario.tipoEstudio = nuevoEstudio?.tipoEstudio ?? ''
    formulario.descripcion = nuevoEstudio?.descripcion ?? ''
    formulario.resultado = nuevoEstudio?.resultado ?? ''

    mensaje.value = ''
    formularioValido.value = false
  },
  { immediate: true }
)

function validarFormulario() {
  mensaje.value = ''
  formularioValido.value = false

  if (
    !formulario.fecha ||
    !formulario.tipoEstudio.trim() ||
    !formulario.descripcion.trim()
  ) {
    mensaje.value = 'Completá todos los campos obligatorios.'
    return
  }

  if (formulario.tipoEstudio.trim().length > 150) {
    mensaje.value =
      'El tipo de estudio no puede superar los 150 caracteres.'
    return
  }

  if (formulario.descripcion.trim().length > 2000) {
    mensaje.value =
      'La descripción no puede superar los 2000 caracteres.'
    return
  }

  formularioValido.value = true

  mensaje.value = props.estudio
    ? 'Formulario válido. La edición todavía no está habilitada.'
    : 'Formulario válido. El registro todavía no está habilitado.'
}
</script>

<template>
  <form class="formulario" @submit.prevent="validarFormulario">
    
<h2>
  {{ estudio ? 'Editar estudio médico' : 'Registrar estudio médico' }}
</h2>


    <div class="campo">
      <label for="fecha">Fecha del estudio *</label>
      <input
        id="fecha"
        v-model="formulario.fecha"
        type="date"
      />
    </div>

    <div class="campo">
      <label for="tipoEstudio">Tipo de estudio *</label>
      <input
        id="tipoEstudio"
        v-model="formulario.tipoEstudio"
        type="text"
        placeholder="Ej: Radiografía, análisis de sangre..."
      />
    </div>

    <div class="campo">
      <label for="descripcion">Descripción *</label>
      <textarea
        id="descripcion"
        v-model="formulario.descripcion"
        rows="4"
        placeholder="Descripción del estudio..."
      ></textarea>
    </div>

    <div class="campo">
      <label for="resultado">Resultado</label>
      <textarea
        id="resultado"
        v-model="formulario.resultado"
        rows="4"
        placeholder="Resultado del estudio..."
      ></textarea>
    </div>

    <p
      v-if="mensaje"
      :class="formularioValido ? 'exito' : 'error'"
    >
      {{ mensaje }}
    </p>

    <button type="submit">
      Validar formulario
    </button>
  </form>
</template>

<style scoped>
.formulario {
  margin-top: 20px;
  padding: 25px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
}

h2 {
  margin-bottom: 20px;
  color: #1e293b;
}

.campo {
  display: flex;
  flex-direction: column;
  margin-bottom: 18px;
}

label {
  margin-bottom: 8px;
  font-weight: 600;
  color: #334155;
}

input,
textarea {
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
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

.error {
  color: #b91c1c;
  margin-bottom: 15px;
}

.exito {
  color: #15803d;
  margin-bottom: 15px;
}
</style>
