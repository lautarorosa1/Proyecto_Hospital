<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import {
  obtenerAntecedentesPorPaciente,
  crearAntecedente,
  actualizarAntecedente,
  eliminarAntecedentePorId
} from '../services/historiaClinicaService'
import AntecedenteFamiliarForm from '../components/AntecedenteFamiliarForm.vue'

const route = useRoute()
const pacienteId = Number(route.params.id)

const antecedentes = ref([])
const cargando = ref(true)
const error = ref('')
const errorFormulario = ref('')
const guardando = ref(false)
const formKey = ref(0)

const antecedenteSeleccionado = ref(null)
const antecedenteEditar = ref(null)

function mensajeDeError(err, porDefecto) {
  return err.response?.data?.error || err.response?.data?.message || porDefecto
}

async function cargarAntecedentes() {
  const respuesta = await obtenerAntecedentesPorPaciente(pacienteId)
  antecedentes.value = respuesta.data
}

async function cargarDatos() {
  try {
    await cargarAntecedentes()
  } catch (err) {
    console.error(err)
    error.value = mensajeDeError(err, 'No se pudieron cargar los antecedentes.')
  } finally {
    cargando.value = false
  }
}

function editarAntecedente(antecedente) {
  antecedenteEditar.value = { ...antecedente }
  errorFormulario.value = ''
}

function cancelarEdicion() {
  antecedenteEditar.value = null
  errorFormulario.value = ''
}

function verDetalle(antecedente) {
  antecedenteSeleccionado.value = antecedente
}

function cerrarDetalle() {
  antecedenteSeleccionado.value = null
}

async function guardarAntecedente(datos) {
  guardando.value = true
  errorFormulario.value = ''

  try {
    if (antecedenteEditar.value) {
      const id = antecedenteEditar.value.id
      await actualizarAntecedente(id, datos)

      if (antecedenteSeleccionado.value?.id === id) {
        antecedenteSeleccionado.value = null
      }
      antecedenteEditar.value = null
    } else {
      await crearAntecedente({ ...datos, pacienteId })
      formKey.value++ // reinicia el formulario solo si se guardó bien
    }

    await cargarAntecedentes()
  } catch (err) {
    console.error(err)
    errorFormulario.value = mensajeDeError(
      err,
      'No se pudo guardar el antecedente.'
    )
  } finally {
    guardando.value = false
  }
}

async function eliminarAntecedente(id) {
  const confirmar = window.confirm(
    '¿Estás seguro de eliminar este antecedente familiar?'
  )

  if (!confirmar) return

  try {
    await eliminarAntecedentePorId(id)

    if (antecedenteSeleccionado.value?.id === id) {
      antecedenteSeleccionado.value = null
    }
    if (antecedenteEditar.value?.id === id) {
      antecedenteEditar.value = null
    }

    await cargarAntecedentes()
  } catch (err) {
    console.error(err)
    error.value = mensajeDeError(err, 'No se pudo eliminar el antecedente.')
  }
}

onMounted(cargarDatos)
</script>

<template>
  <main class="antecedentes-container">
    <RouterLink
      :to="`/historia-clinica/${pacienteId}`"
      class="volver"
    >
      ← Volver a Historia Clínica
    </RouterLink>

    <h1>Antecedentes Familiares</h1>

    <p class="descripcion">
      Registro y consulta de antecedentes familiares del paciente.
    </p>

    
<AntecedenteFamiliarForm
  :key="formKey"
  :antecedente-editar="antecedenteEditar"
  :guardando="guardando"
  :error="errorFormulario"
  @guardar="guardarAntecedente"
  @cancelar="cancelarEdicion"
/>
<section class="contenido">
  <h2>Antecedentes registrados</h2>

  <p v-if="cargando">Cargando antecedentes...</p>

  <p v-else-if="error" class="error">{{ error }}</p>

  <p v-else-if="antecedentes.length === 0">
    No hay antecedentes familiares registrados.
  </p>

  <template v-else>
    <div
      v-for="antecedente in antecedentes"
      :key="antecedente.id"
      class="tarjeta"
    >
      <div>
        <h3>{{ antecedente.parentesco }}</h3>

        <p>
          <strong>Enfermedad:</strong>
          {{ antecedente.enfermedad }}
        </p>

        <p>
          <strong>Observaciones:</strong>
          {{ antecedente.observaciones || 'Sin observaciones' }}
        </p>
      </div>

      <div class="acciones">
        <button
          type="button"
          class="detalle-btn"
          @click="verDetalle(antecedente)"
        >
          Ver detalle
        </button>

        <button
          type="button"
          class="eliminar"
          @click="eliminarAntecedente(antecedente.id)"
        >
          Eliminar
        </button>

        <button
          type="button"
          class="editar-btn"
          @click="editarAntecedente(antecedente)"
        >
          Editar
        </button>
      </div>
    </div>
  </template>
</section>
    
<section
  v-if="antecedenteSeleccionado"
  class="detalle-antecedente"
>
  <h2>Detalle del antecedente familiar</h2>

  <p>
    <strong>Parentesco:</strong>
    {{ antecedenteSeleccionado.parentesco }}
  </p>

  <p>
    <strong>Enfermedad:</strong>
    {{ antecedenteSeleccionado.enfermedad }}
  </p>

  <p>
    <strong>Observaciones:</strong>
    {{ antecedenteSeleccionado.observaciones || 'Sin observaciones' }}
  </p>

  <button class="cerrar-btn" @click="cerrarDetalle">
    Cerrar detalle
  </button
>
</section>
  </main>
</template>

<style scoped>
.antecedentes-container {
  max-width: 1100px;
  margin: 40px auto;
  padding: 20px;
}

.volver {
  display: inline-block;
  margin-bottom: 25px;
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
}

h1 {
  font-size: 32px;
  color: #1e293b;
}

.descripcion {
  color: #64748b;
  margin-bottom: 30px;
}

.contenido {
  margin-top: 30px;
  padding: 24px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

h2 {
  color: #334155;
  margin-bottom: 20px;
}

.tarjeta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 20px;
  margin-bottom: 15px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.tarjeta h3 {
  margin: 0 0 10px;
}

.tarjeta p {
  margin: 6px 0;
}

.eliminar {
  padding: 10px 16px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.eliminar:hover {
  background: #b91c1c;
}

.aviso {
  margin-top: 25px;
  padding: 15px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 8px;
}

.acciones {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.detalle-btn {
  padding: 10px 16px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.detalle-btn:hover {
  background: #1d4ed8;
}

.detalle-antecedente {
  margin-top: 25px;
  padding: 24px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
}

.detalle-antecedente p {
  margin: 12px 0;
}

.cerrar-btn {
  margin-top: 15px;
  padding: 10px 16px;
  background: #475569;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.cerrar-btn:hover {
  background: #334155;
}

.editar-btn {
  padding: 10px 16px;
  background: #d97706;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.editar-btn:hover {
  background: #b45309;
}
.error {
  color: #dc2626;
  margin-bottom: 20px;
}
</style>
