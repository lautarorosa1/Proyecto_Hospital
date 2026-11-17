
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
const guardando = ref(false)

const error = ref('')
const errorFormulario = ref('')
const mensaje = ref('')

const mostrarFormulario = ref(false)
const alergiaSeleccionada = ref(null)

// Carga las alergias registradas del paciente.
async function cargarAlergias() {
  try {
    alergias.value = await listarAlergiasPorPaciente(pacienteId)
  } catch (err) {
    console.error(err)
    error.value = mensajeError(err, 'No se pudieron cargar las alergias.')
  }
}

// Carga la información general del paciente y sus alergias.
async function cargarPaciente() {
  try {
    const respuesta = await obtenerPacientePorId(pacienteId)
    paciente.value = respuesta.data

    await cargarAlergias()
  } catch (err) {
    console.error(err)
    error.value = mensajeError(err, 'No se pudo cargar la información.')
  } finally {
    cargando.value = false
  }
}

// Abre el formulario para editar una alergia existente.
function editarAlergia(alergia) {
  mensaje.value = ''
  error.value = ''
  errorFormulario.value = ''

  alergiaSeleccionada.value = { ...alergia }
  mostrarFormulario.value = true
}

// Cierra el formulario y limpia su estado.
function cerrarFormulario() {
  mostrarFormulario.value = false
  alergiaSeleccionada.value = null
  errorFormulario.value = ''
}

// Alterna entre mostrar y ocultar el formulario.
function alternarFormulario() {
  mensaje.value = ''
  error.value = ''

  if (mostrarFormulario.value) {
    cerrarFormulario()
  } else {
    alergiaSeleccionada.value = null
    errorFormulario.value = ''
    mostrarFormulario.value = true
  }
}

// Guarda una alergia nueva o actualiza una existente.
async function guardarAlergia(datos) {
  guardando.value = true
  mensaje.value = ''
  error.value = ''
  errorFormulario.value = ''

  try {
    if (alergiaSeleccionada.value) {
      await actualizarAlergia(alergiaSeleccionada.value.id, datos)
      mensaje.value = 'Alergia actualizada correctamente.'
    } else {
      await registrarAlergia({
        ...datos,
        pacienteId: Number(pacienteId)
      })

      mensaje.value =
        'Alergia registrada correctamente. Enfermería podrá consultarla antes de administrar medicación.'
    }

    cerrarFormulario()
    await cargarAlergias()
  } catch (err) {
    console.error(err)
    errorFormulario.value = mensajeError(
      err,
      'No se pudo guardar la alergia.'
    )
  } finally {
    guardando.value = false
  }
}

// Las alergias no se eliminan de la historia clínica.
function eliminarAlergia() {
  mensaje.value = ''
  error.value =
    'Las alergias no se eliminan de la historia clínica. Si hubo un error, editá el registro.'
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
  font-size: var(--font-heading-1);
  font-weight: 600;
  margin: 25px 0;
}

.contenido {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-panel);
  padding: 25px;
}

.encabezado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

h2 {
  font-size: var(--font-heading-2);
  font-weight: 600;
}

.mensaje {
  margin-top: 30px;
  color: var(--color-neutral-600);
  text-align: center;
}

.datos-paciente {
  background: var(--color-neutral-100);
  padding: 20px;
  border-radius: var(--radius-panel);
  margin-bottom: 25px;
}

.datos-paciente h2 {
  font-size: var(--font-heading-2);
  font-weight: 600;
  margin-bottom: 12px;
}

.datos-paciente p {
  margin-bottom: 8px;
}

.error {
  color: var(--color-danger);
  margin-bottom: 20px;
}

.aviso-prueba {
  background: var(--color-warning-bg);
  color: var(--color-warning);
  border: 1px solid var(--color-warning-border);
  padding: 12px 16px;
  border-radius: var(--radius-control);
  margin-bottom: 20px;
  font-size: 14px;
}

button:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}
</style>
