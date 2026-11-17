
<script setup>
import { reactive, ref, watch } from 'vue'

const props = defineProps({
  evolucion: { type: Object, default: null },
  guardando: { type: Boolean, default: false },
  error: { type: String, default: '' }
})

const emit = defineEmits(['guardar'])

const formulario = reactive({
  fecha: '',
  motivoConsulta: '',
  observaciones: '',
  indicaciones: ''
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
  () => props.evolucion,
  (nuevaEvolucion) => {
    formulario.fecha = nuevaEvolucion?.fecha ?? ''
    formulario.motivoConsulta = nuevaEvolucion?.motivoConsulta ?? ''
    formulario.observaciones = nuevaEvolucion?.observaciones ?? ''
    formulario.indicaciones = nuevaEvolucion?.indicaciones ?? ''
    mensaje.value = ''
  },
  { immediate: true }
)

function enviar() {
  mensaje.value = ''

  const motivoConsulta = formulario.motivoConsulta.trim()
  const observaciones = formulario.observaciones.trim()
  const indicaciones = formulario.indicaciones.trim()

  if (!formulario.fecha || !motivoConsulta || !observaciones) {
    mensaje.value = 'Completá todos los campos obligatorios.'
    return
  }

  if (formulario.fecha > fechaDeHoy()) {
    mensaje.value = 'La fecha de la evolución no puede ser posterior a hoy.'
    return
  }

  if (motivoConsulta.length > 200) {
    mensaje.value = 'El motivo de consulta no puede superar los 200 caracteres.'
    return
  }

  if (observaciones.length > 2000) {
    mensaje.value = 'Las observaciones no pueden superar los 2000 caracteres.'
    return
  }

  if (indicaciones.length > 2000) {
    mensaje.value = 'Las indicaciones no pueden superar los 2000 caracteres.'
    return
  }

  emit('guardar', {
    fecha: formulario.fecha,
    motivoConsulta,
    observaciones,
    indicaciones
  })
}
</script>

<template>
  <form class="formulario" @submit.prevent="enviar">
    <h2>
      {{ evolucion ? 'Editar evolución médica' : 'Registrar evolución médica' }}
    </h2>

    <div class="campo">
      <label for="fecha">Fecha de evolución *</label>
      <input
        id="fecha"
        v-model="formulario.fecha"
        type="date"
        :max="fechaDeHoy()"
      />
    </div>

    <div class="campo">
      <label for="motivo">Motivo de consulta *</label>
      <input
        id="motivo"
        v-model="formulario.motivoConsulta"
        type="text"
        maxlength="200"
        placeholder="Ingresá el motivo de consulta"
      />
    </div>

    <div class="campo">
      <label for="observaciones">Observaciones médicas *</label>
      <textarea
        id="observaciones"
        v-model="formulario.observaciones"
        rows="4"
        maxlength="2000"
        placeholder="Describí la evolución del paciente"
      ></textarea>
    </div>

    <div class="campo">
      <label for="indicaciones">Indicaciones médicas</label>
      <textarea
        id="indicaciones"
        v-model="formulario.indicaciones"
        rows="3"
        maxlength="2000"
        placeholder="Indicaciones o recomendaciones"
      ></textarea>
    </div>

    <button type="submit" class="boton-guardar" :disabled="guardando">
      {{
        guardando
          ? 'Guardando...'
          : evolucion
            ? 'Guardar cambios'
            : 'Guardar evolución'
      }}
    </button>

    <p v-if="mensaje" class="mensaje" role="status">{{ mensaje }}</p>
    <p v-if="error" class="mensaje" role="alert">{{ error }}</p>
  </form>
</template>

<style scoped>
.formulario {
  margin-top: 25px;
  padding: 25px;
  background: var(--color-neutral-50);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-panel);
}

h2 {
  margin-bottom: 20px;
  font-size: var(--font-heading-2);
  color: var(--color-neutral-900);
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 18px;
}

label {
  font-weight: 600;
  color: var(--color-neutral-700);
}

input,
textarea {
  padding: 11px;
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-control);
  font: inherit;
  width: 100%;
  box-sizing: border-box;
}

input:focus,
textarea:focus {
  outline: 2px solid var(--color-brand-700);
  outline-offset: 1px;
}

.boton-guardar {
  padding: 11px 20px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.boton-guardar:hover {
  background: #1d4ed8;
}

.boton-guardar:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}
.mensaje {
  margin-top: 15px;
  color: var(--color-danger-hover);
  font-weight: 500;
}

.mensaje.exito {
  color: var(--color-success);
}
</style>
