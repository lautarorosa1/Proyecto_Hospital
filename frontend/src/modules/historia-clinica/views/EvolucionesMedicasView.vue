
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import {
  obtenerEvolucionesPorPaciente,
  crearEvolucion,
  actualizarEvolucion,
  eliminarEvolucionPorId
} from '../services/historiaClinicaService'
import EvolucionMedicaForm from '../components/EvolucionMedicaForm.vue'
import EvolucionesMedicasLista from '../components/EvolucionesMedicasLista.vue'

const route = useRoute()
const pacienteId = Number(route.params.id)

const evoluciones = ref([])
const cargando = ref(true)
const error = ref('')
const errorFormulario = ref('')
const guardando = ref(false)
const mostrarFormulario = ref(false)
const evolucionEditar = ref(null)
const evolucionSeleccionada = ref(null)

function mensajeDeError(err, porDefecto) {
  return err.response?.data?.error || err.response?.data?.message || porDefecto
}

function formatearFecha(fecha) {
  if (!fecha) return '-'
  const partes = fecha.split('-')
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : fecha
}

async function cargarEvoluciones() {
  const respuesta = await obtenerEvolucionesPorPaciente(pacienteId)
  evoluciones.value = respuesta.data
}

async function cargarDatos() {
  try {
    await cargarEvoluciones()
  } catch (err) {
    console.error(err)
    error.value = mensajeDeError(err, 'No se pudieron cargar las evoluciones.')
  } finally {
    cargando.value = false
  }
}

function cerrarFormulario() {
  mostrarFormulario.value = false
  evolucionEditar.value = null
  errorFormulario.value = ''
}

function alternarFormulario() {
  if (mostrarFormulario.value) {
    cerrarFormulario()
  } else {
    evolucionEditar.value = null
    errorFormulario.value = ''
    mostrarFormulario.value = true
  }
}

function editarEvolucion(evolucion) {
  evolucionEditar.value = { ...evolucion }
  errorFormulario.value = ''
  mostrarFormulario.value = true
}

function verDetalleEvolucion(evolucion) {
  evolucionSeleccionada.value = evolucion
}

function cerrarDetalle() {
  evolucionSeleccionada.value = null
}

async function guardarEvolucion(datos) {
  guardando.value = true
  errorFormulario.value = ''

  try {
    if (evolucionEditar.value) {
      const id = evolucionEditar.value.id
      await actualizarEvolucion(id, datos)

      if (evolucionSeleccionada.value?.id === id) {
        evolucionSeleccionada.value = null
      }
    } else {
      await crearEvolucion({ ...datos, pacienteId })
    }

    await cargarEvoluciones()
    cerrarFormulario()
  } catch (err) {
    console.error(err)
    errorFormulario.value = mensajeDeError(
      err,
      'No se pudo guardar la evolución.'
    )
  } finally {
    guardando.value = false
  }
}

async function eliminarEvolucion(evolucion) {
  const confirmar = window.confirm(
    `¿Estás seguro de eliminar la evolución "${evolucion.motivoConsulta}"?`
  )

  if (!confirmar) return

  try {
    await eliminarEvolucionPorId(evolucion.id)

    if (evolucionSeleccionada.value?.id === evolucion.id) {
      evolucionSeleccionada.value = null
    }
    if (evolucionEditar.value?.id === evolucion.id) {
      cerrarFormulario()
    }

    await cargarEvoluciones()
  } catch (err) {
    console.error(err)
    error.value = mensajeDeError(err, 'No se pudo eliminar la evolución.')
  }
}

onMounted(cargarDatos)
</script>

<template>
  <main class="evoluciones-container">
    <RouterLink
      :to="`/historia-clinica/${pacienteId}`"
      class="volver"
    >
      ← Volver a Historia Clínica
    </RouterLink>

    <h1>Evoluciones Médicas</h1>

    <p class="descripcion">
      Consulta y registro de las evoluciones médicas del paciente.
    </p>

    <section class="contenido">
      <div class="encabezado">
        <h2>Registro de evoluciones</h2>

        <button type="button" @click="alternarFormulario">
          {{ mostrarFormulario ? 'Cancelar' : '+ Nueva evolución' }}
        </button>
      </div>

      <EvolucionMedicaForm
        v-if="mostrarFormulario"
        :evolucion="evolucionEditar"
        :guardando="guardando"
        :error="errorFormulario"
        @guardar="guardarEvolucion"
      />

      <p v-if="cargando" class="mensaje">Cargando evoluciones...</p>

      <p v-else-if="error" class="error">{{ error }}</p>

      <EvolucionesMedicasLista
        v-else
        :evoluciones="evoluciones"
        @ver-detalle="verDetalleEvolucion"
        @editar="editarEvolucion"
        @eliminar="eliminarEvolucion"
      />

      <section
        v-if="evolucionSeleccionada"
        class="detalle-evolucion"
      >
        <div class="detalle-encabezado">
          <h2>Detalle de evolución médica</h2>

          <button type="button" @click="cerrarDetalle">Cerrar</button>
        </div>

        <p>
          <strong>Fecha:</strong>
          {{ formatearFecha(evolucionSeleccionada.fecha) }}
        </p>

        <p>
          <strong>Motivo de consulta:</strong>
          {{ evolucionSeleccionada.motivoConsulta }}
        </p>

        <p>
          <strong>Observaciones:</strong>
          {{ evolucionSeleccionada.observaciones }}
        </p>

        <p>
          <strong>Indicaciones:</strong>
          {{ evolucionSeleccionada.indicaciones || 'Sin indicaciones' }}
        </p>
      </section>
    </section>
  </main>
</template>

<style scoped>
.evoluciones-container {
  max-width: 1100px;
  margin: 40px auto;
  padding: 20px;
}

.volver {
  display: inline-block;
  margin-bottom: 20px;
  color: var(--color-brand-700);
  text-decoration: none;
  font-weight: 600;
}

.volver:hover {
  text-decoration: underline;
}

h1 {
  font-size: var(--font-heading-1);
  margin-bottom: 15px;
  color: var(--color-neutral-900);
}

.descripcion {
  color: var(--color-neutral-600);
  margin-bottom: 30px;
}

.contenido {
  background: white;
  padding: 25px;
  border-radius: var(--radius-panel);
  border: 1px solid var(--color-border);
}

.encabezado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

h2 {
  font-size: var(--font-heading-2);
  color: var(--color-neutral-900);
}

.mensaje {
  margin-top: 25px;
  color: var(--color-neutral-600);
}

.error {
  margin-top: 25px;
  color: #dc2626;
}

.detalle-evolucion {
  margin-top: 25px;
  padding: 25px;
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-panel);
}

.detalle-encabezado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.detalle-evolucion p {
  margin-bottom: 12px;
  color: var(--color-neutral-700);
}
</style>
