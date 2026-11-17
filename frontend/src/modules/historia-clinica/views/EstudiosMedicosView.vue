
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

import {
  obtenerEstudiosPorPaciente,
  crearEstudio,
  actualizarEstudio,
  eliminarEstudioPorId
} from '../services/historiaClinicaService'

import EstudioMedicoForm from '../components/EstudioMedicoForm.vue'
import EstudiosMedicosLista from '../components/EstudiosMedicosLista.vue'

const route = useRoute()
const pacienteId = Number(route.params.id)

const estudios = ref([])
const cargando = ref(true)
const error = ref('')
const errorFormulario = ref('')
const guardando = ref(false)
const mostrarFormulario = ref(false)
const estudioEditar = ref(null)
const estudioSeleccionado = ref(null)

function mensajeDeError(err, porDefecto) {
  return (
    err.response?.data?.error ||
    err.response?.data?.message ||
    porDefecto
  )
}

function formatearFecha(fecha) {
  if (!fecha) return '-'

  const partes = fecha.split('-')

  return partes.length === 3
    ? `${partes[2]}/${partes[1]}/${partes[0]}`
    : fecha
}

async function cargarEstudios() {
  const respuesta = await obtenerEstudiosPorPaciente(pacienteId)
  estudios.value = respuesta.data
}

async function cargarDatos() {
  try {
    await cargarEstudios()
  } catch (err) {
    console.error(err)
    error.value = mensajeDeError(
      err,
      'No se pudieron cargar los estudios.'
    )
  } finally {
    cargando.value = false
  }
}

function cerrarFormulario() {
  mostrarFormulario.value = false
  estudioEditar.value = null
  errorFormulario.value = ''
}

function alternarFormulario() {
  if (mostrarFormulario.value) {
    cerrarFormulario()
  } else {
    estudioEditar.value = null
    errorFormulario.value = ''
    mostrarFormulario.value = true
  }
}

function editarEstudio(estudio) {
  estudioEditar.value = { ...estudio }
  errorFormulario.value = ''
  mostrarFormulario.value = true
}

function verDetalleEstudio(estudio) {
  estudioSeleccionado.value = estudio
}

function cerrarDetalle() {
  estudioSeleccionado.value = null
}

async function guardarEstudio(datos) {
  guardando.value = true
  errorFormulario.value = ''

  try {
    if (estudioEditar.value) {
      const id = estudioEditar.value.id
      await actualizarEstudio(id, datos)

      if (estudioSeleccionado.value?.id === id) {
        estudioSeleccionado.value = null
      }
    } else {
      await crearEstudio({ ...datos, pacienteId })
    }

    await cargarEstudios()
    cerrarFormulario()
  } catch (err) {
    console.error(err)
    errorFormulario.value = mensajeDeError(
      err,
      'No se pudo guardar el estudio.'
    )
  } finally {
    guardando.value = false
  }
}

async function eliminarEstudio(estudio) {
  const confirmar = window.confirm(
    `¿Estás seguro de eliminar el estudio "${estudio.tipoEstudio}"?`
  )

  if (!confirmar) return

  try {
    await eliminarEstudioPorId(estudio.id)

    if (estudioSeleccionado.value?.id === estudio.id) {
      estudioSeleccionado.value = null
    }

    if (estudioEditar.value?.id === estudio.id) {
      cerrarFormulario()
    }

    await cargarEstudios()
  } catch (err) {
    console.error(err)
    error.value = mensajeDeError(
      err,
      'No se pudo eliminar el estudio.'
    )
  }
}

onMounted(cargarDatos)
</script>

<template>
  <div class="estudios-container">
    <RouterLink
      :to="`/historia-clinica/${pacienteId}`"
      class="volver"
    >
      ← Volver a Historia Clínica
    </RouterLink>

    <h1>Estudios Médicos</h1>

    <p class="descripcion">
      Consulta y registro de los estudios médicos del paciente.
    </p>

    <section class="contenido">
      <div class="encabezado">
        <h2>Registro de estudios médicos</h2>

        <button type="button" @click="alternarFormulario">
          {{ mostrarFormulario ? 'Cancelar' : '+ Nuevo estudio' }}
        </button>
      </div>

      <EstudioMedicoForm
        v-if="mostrarFormulario"
        :estudio="estudioEditar"
        :guardando="guardando"
        :error="errorFormulario"
        @guardar="guardarEstudio"
      />

      <p v-if="cargando" class="mensaje">
        Cargando estudios...
      </p>

      <p v-else-if="error" class="error">
        {{ error }}
      </p>

      <EstudiosMedicosLista
        v-else
        :estudios="estudios"
        @ver-detalle="verDetalleEstudio"
        @editar="editarEstudio"
        @eliminar="eliminarEstudio"
      />

      <section
        v-if="estudioSeleccionado"
        class="detalle-estudio"
      >
        <div class="detalle-encabezado">
          <h2>Detalle del estudio médico</h2>

          <button type="button" @click="cerrarDetalle">
            Cerrar
          </button>
        </div>

        <p>
          <strong>Fecha:</strong>
          {{ formatearFecha(estudioSeleccionado.fecha) }}
        </p>

        <p>
          <strong>Tipo de estudio:</strong>
          {{ estudioSeleccionado.tipoEstudio }}
        </p>

        <p>
          <strong>Descripción:</strong>
          {{ estudioSeleccionado.descripcion }}
        </p>

        <p>
          <strong>Resultado:</strong>
          {{ estudioSeleccionado.resultado || 'Sin resultado' }}
        </p>
      </section>
    </section>
  </div>
</template>

<style scoped>
.estudios-container {
  padding: 30px;
  max-width: 1100px;
  margin: 0 auto;
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
  margin-bottom: 12px;
  color: var(--color-neutral-900);
}

.descripcion {
  color: var(--color-neutral-600);
  margin-bottom: 25px;
}

.contenido {
  background: white;
  padding: 25px;
  border-radius: var(--radius-panel);
  border: 1px solid var(--color-border);
}

h2 {
  font-size: var(--font-heading-2);
  margin-bottom: 15px;
  color: var(--color-neutral-900);
}

.mensaje {
  color: var(--color-neutral-600);
  margin-bottom: 15px;
}

.encabezado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.encabezado h2 {
  margin-bottom: 0;
}

.detalle-estudio {
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

.detalle-encabezado h2 {
  margin-bottom: 0;
}

.detalle-estudio p {
  margin-bottom: 12px;
  color: var(--color-neutral-700);
}
.detalle-estudio p {
  margin-bottom: 12px;
  color: var(--color-neutral-700);
}
</style>
