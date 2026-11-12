

<script setup>
import { reactive, ref, watch } from 'vue'

const emit = defineEmits(['guardar'])

const props = defineProps({
  alergia: {
    type: Object,
    default: null
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

  
emit('guardar', { alergeno, reaccion, severidad: formulario.severidad })

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
      ></textarea>
    </div>

    <div class="campo">
      <label for="severidad">Severidad</label>
      <select id="severidad" v-model="formulario.severidad">
        <option value="">Seleccionar severidad</option>
        <option value="leve">Leve</option>
        <option value="moderada">Moderada</option>
        <option value="alta">Alta</option>
      </select>
    </div>

    <p v-if="mensaje" class="mensaje">{{ mensaje }}</p>

    <button type="submit">Validar formulario</button>
  </form>
</template>

<style scoped>
.formulario {
  background: white;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 25px;
  margin-top: 25px;
}

h2 {
  font-size: 22px;
  font-weight: bold;
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
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font: inherit;
}

.mensaje {
  color: #475569;
  margin-bottom: 15px;
}

button {
  background: #2563eb;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-weight: 600;
}

button:hover {
  background: #1d4ed8;
}
</style>
