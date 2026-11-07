

<script setup>
import { reactive, ref, watch } from 'vue'

const props = defineProps({
  evolucion: {
    type: Object,
    default: null
  }
})

const formulario = reactive({
  fecha: '',
  motivoConsulta: '',
  observaciones: '',
  indicaciones: ''
})

const mensaje = ref('')
const formularioValido = ref(false)

watch(
  () => props.evolucion,
  (nuevaEvolucion) => {
    formulario.fecha = nuevaEvolucion?.fecha ?? ''
    formulario.motivoConsulta = nuevaEvolucion?.motivoConsulta ?? ''
    formulario.observaciones = nuevaEvolucion?.observaciones ?? ''
    formulario.indicaciones = nuevaEvolucion?.indicaciones ?? ''

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
    !formulario.motivoConsulta.trim() ||
    !formulario.observaciones.trim()
  ) {
    mensaje.value = 'Completá todos los campos obligatorios.'
    return
  }

  if (formulario.motivoConsulta.trim().length > 200) {
    mensaje.value = 'El motivo de consulta no puede superar los 200 caracteres.'
    return
  }

  if (formulario.observaciones.trim().length > 2000) {
    mensaje.value = 'Las observaciones no pueden superar los 2000 caracteres.'
    return
  }

  formularioValido.value = true

  mensaje.value = props.evolucion
    ? 'Formulario válido. La edición todavía no está habilitada.'
    : 'Formulario válido. El registro todavía no está habilitado.'
}
</script>


<template>
  <form class="formulario" @submit.prevent="validarFormulario">
    
<h2>
  {{ evolucion ? 'Editar evolución médica' : 'Registrar evolución médica' }}
</h2>


    <div class="campo">
      <label for="fecha">Fecha de evolución *</label>
      <input
        id="fecha"
        v-model="formulario.fecha"
        type="date"
      />
    </div>

    <div class="campo">
      <label for="motivo">Motivo de consulta *</label>
      <input
        id="motivo"
        v-model="formulario.motivoConsulta"
        type="text"
        placeholder="Ingresá el motivo de consulta"
      />
    </div>

    <div class="campo">
      <label for="observaciones">Observaciones médicas *</label>
      <textarea
        id="observaciones"
        v-model="formulario.observaciones"
        rows="4"
        placeholder="Describí la evolución del paciente"
      ></textarea>
    </div>

    <div class="campo">
      <label for="indicaciones">Indicaciones médicas</label>
      <textarea
        id="indicaciones"
        v-model="formulario.indicaciones"
        rows="3"
        placeholder="Indicaciones o recomendaciones"
      ></textarea>
    </div>

    <button type="submit" class="boton-validar">
      Validar formulario
    </button>

    <p
      v-if="mensaje"
      class="mensaje"
      :class="{ exito: formularioValido }"
      role="status"
    >
      {{ mensaje }}
    </p>
  </form>
</template>

<style scoped>
.formulario {
  margin-top: 25px;
  padding: 25px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

h2 {
  margin-bottom: 20px;
  font-size: 20px;
  color: #1e293b;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 18px;
}

label {
  font-weight: 600;
  color: #334155;
}

input,
textarea {
  padding: 11px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font: inherit;
  width: 100%;
  box-sizing: border-box;
}

input:focus,
textarea:focus {
  outline: 2px solid #2563eb;
  outline-offset: 1px;
}

.boton-validar {
  padding: 11px 20px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.boton-validar:hover {
  background: #1d4ed8;
}

.mensaje {
  margin-top: 15px;
  color: #b91c1c;
  font-weight: 500;
}

.mensaje.exito {
  color: #15803d;
}
</style>
