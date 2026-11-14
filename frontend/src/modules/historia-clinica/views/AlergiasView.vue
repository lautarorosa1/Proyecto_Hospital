<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import {
  obtenerPacientePorId,
  obtenerAlergiasPorPaciente,
  crearAlergia,
  actualizarAlergia,
  eliminarAlergiaPorId
} from '../services/historiaClinicaService'
import AlergiaForm from '../components/AlergiaForm.vue'
import AlergiasLista from '../components/AlergiasLista.vue'

const route = useRoute()
const pacienteId = Number(route.params.id)

const paciente = ref(null)
const alergias = ref([])
const cargando = ref(true)
const error = ref('')
const errorFormulario = ref('')
const guardando = ref(false)
const mostrarFormulario = ref(false)
const alergiaSeleccionada = ref(null)

function mensajeDeError(err, porDefecto) {
  return (
    err.response?.data?.error ||
    err.response?.data?.message ||
    porDefecto
  )
}

async function cargarAlergias() {
  const respuesta = await obtenerAlergiasPorPaciente(pacienteId)
  alergias.value = respuesta.data
}

async function cargarDatos() {
  try {
    const respuesta = await obtenerPacientePorId(pacienteId)
    paciente.value = respuesta.data
    await cargarAlergias()
  } catch (err) {
    console.error(err)
    error.value = mensajeDeError(err, 'No se pudo cargar la información.')
  } finally {
    cargando.value = false
  }
}

function cerrarFormulario() {
  mostrarFormulario.value = false
  alergiaSeleccionada.value = null
  errorFormulario.value = ''
}

function alternarFormulario() {
  if (mostrarFormulario.value) {
    cerrarFormulario()
  } else {
    alergiaSeleccionada.value = null
    errorFormulario.value = ''
    mostrarFormulario.value = true
  }
}

function editarAlergia(alergia) {
  alergiaSeleccionada.value = { ...alergia }
  errorFormulario.value = ''
  mostrarFormulario.value = true
}

async function guardarAlergia(datos) {
  guardando.value = true
  errorFormulario.value = ''

  try {
    if (alergiaSeleccionada.value) {
      await actualizarAlergia(alergiaSeleccionada.value.id, datos)
    } else {
      await crearAlergia({ ...datos, pacienteId })
    }

    await cargarAlergias()
    cerrarFormulario()
  } catch (err) {
    console.error(err)
    errorFormulario.value = mensajeDeError(err, 'No se pudo guardar la alergia.')
  } finally {
    guardando.value = false
  }
}

async function eliminarAlergia(alergia) {
  const confirmar = window.confirm(
    `¿Estás seguro de eliminar la alergia a ${alergia.alergeno}?`
  )

  if (!confirmar) return

  try {
    await eliminarAlergiaPorId(alergia.id)
    await cargarAlergias()

    if (alergiaSeleccionada.value?.id === alergia.id) {
      cerrarFormulario()
    }
  } catch (err) {
    console.error(err)
    error.value = mensajeDeError(err, 'No se pudo eliminar la alergia.')
  }
}

onMounted(cargarDatos)
</script>

<template>
  <main class="alergias">
    <RouterLink :to="`/historia-clinica/${pacienteId}`">
      ← Volver a Historia Clínica
    </RouterLink>

    <h1>Alergias del Paciente</h1>
    

  
<p v-if="cargando">Cargando paciente...</p>

<p v-else-if="error" class="error">
  {{ error }}
</p>

<section v-else-if="paciente" class="datos-paciente">
  <h2>Información del paciente</h2>

  <p>
    <strong>Nombre:</strong>
    {{ paciente.nombre }} {{ paciente.apellido }}
  </p>

  <p>
    <strong>DNI:</strong> {{ paciente.dni }}
  </p>
</section>


    <section class="contenido">
      <div class="encabezado">
        <h2>Registro de alergias</h2>

       <button
  type="button"
  :disabled="!paciente || cargando || !!error"
  @click="alternarFormulario"
>
 
{{ mostrarFormulario
  ? 'Cancelar'
  : '+ Nueva alergia'
}}

</button>
      </div>
      
<AlergiaForm
  v-if="mostrarFormulario"
  :alergia="alergiaSeleccionada"
  :guardando="guardando"
  :error="errorFormulario"
  @guardar="guardarAlergia"
  @cancelar="cerrarFormulario"
/>
<AlergiasLista
  v-if="paciente"
  :alergias="alergias"
  @editar="editarAlergia"
  @eliminar="eliminarAlergia"
/>
    </section>
  </main>
</template>

<style scoped>
.alergias {
  max-width: 1100px;
  margin: auto;
  padding: 30px;
}

h1 {
  font-size: 28px;
  font-weight: bold;
  margin: 25px 0;
}

.contenido {
  background: white;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 25px;
}

.encabezado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

h2 {
  font-size: 22px;
  font-weight: bold;
}

button {
  background: #2563eb;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

button:hover {
  background: #1d4ed8;
}

.mensaje {
  margin-top: 30px;
  color: #64748b;
  text-align: center;
}

.datos-paciente {
  background: #f1f5f9;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 25px;
}

.datos-paciente h2 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 12px;
}

.datos-paciente p {
  margin-bottom: 8px;
}

.error {
  color: #dc2626;
  margin-bottom: 20px;
}

button:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}
</style>
