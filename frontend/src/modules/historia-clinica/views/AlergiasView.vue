<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { obtenerPacientePorId } from '../services/historiaClinicaService'
import {
  listarAlergiasPorPaciente,
  registrarAlergia,
  actualizarAlergia
} from '../services/alergiaService'
import { mensajeError } from '@/shared/utils/formato'
import AlergiaForm from '../components/AlergiaForm.vue'
import AlergiasLista from '../components/AlergiasLista.vue'

const route = useRoute()
const pacienteId = route.params.id

const paciente = ref(null)
const alergias = ref([])
const cargando = ref(true)
const error = ref('')
const mensaje = ref('')

const mostrarFormulario = ref(false)
const alergiaSeleccionada = ref(null)

function editarAlergia(alergia) {
  alergiaSeleccionada.value = { ...alergia }
  mostrarFormulario.value = true
}

// El backend conserva las alergias como parte de la historia clínica: no hay baja.
function eliminarAlergia() {
  mensaje.value = ''
  error.value =
    'Las alergias no se eliminan de la historia clínica. Si hubo un error, editá el registro.'
}

async function cargarAlergias() {
  try {
    alergias.value = await listarAlergiasPorPaciente(pacienteId)
  } catch (err) {
    console.error(err)
    error.value = mensajeError(err, 'No se pudieron cargar las alergias.')
  }
}

// Enfermería consulta estas alergias antes de aceptar una medicación
async function guardarAlergia(datos) {
  mensaje.value = ''
  error.value = ''

  try {
    if (alergiaSeleccionada.value) {
      await actualizarAlergia(alergiaSeleccionada.value.id, datos)
      mensaje.value = 'Alergia actualizada correctamente.'
    } else {
      await registrarAlergia({ ...datos, pacienteId: Number(pacienteId) })
      mensaje.value =
        'Alergia registrada. Enfermería no podrá indicar medicación que la contenga.'
    }

    mostrarFormulario.value = false
    alergiaSeleccionada.value = null
    await cargarAlergias()
  } catch (err) {
    console.error(err)
    error.value = mensajeError(err, 'No se pudo guardar la alergia.')
  }
}

async function cargarPaciente() {
  try {
    const respuesta = await obtenerPacientePorId(pacienteId)
    paciente.value = respuesta.data
    await cargarAlergias()
  } catch (err) {
    console.error(err)
    error.value = 'No se pudo cargar la información del paciente.'
  } finally {
    cargando.value = false
  }
}

function alternarFormulario() {
  mensaje.value = ''
  error.value = ''
  alergiaSeleccionada.value = null
  mostrarFormulario.value = !mostrarFormulario.value
}

onMounted(cargarPaciente)
</script>

<template>
  <main class="alergias">
    <RouterLink :to="`/historia-clinica/${pacienteId}`">
      ← Volver a Historia Clínica
    </RouterLink>

    <h1>Alergias del Paciente</h1>

    <p v-if="cargando">Cargando paciente...</p>

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

    <p v-if="error" class="error">
      {{ error }}
    </p>

    <p v-if="mensaje" class="mensaje">
      {{ mensaje }}
    </p>

    <section class="contenido">
      <div class="encabezado">
        <h2>Registro de alergias</h2>
        <button
          type="button"
          :disabled="!paciente || cargando"
          @click="alternarFormulario"
        >
          {{ mostrarFormulario ? 'Cancelar' : '+ Nueva alergia' }}
        </button>
      </div>

      <AlergiaForm
        v-if="mostrarFormulario"
        :alergia="alergiaSeleccionada"
        @guardar="guardarAlergia"
      />

      <AlergiasLista
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

.aviso-prueba {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fcd34d;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

</style>
