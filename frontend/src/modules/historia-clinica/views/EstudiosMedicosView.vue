
<script setup>
import { ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import EstudioMedicoForm from '../components/EstudioMedicoForm.vue'
import EstudiosMedicosLista from '../components/EstudiosMedicosLista.vue'

const route = useRoute()
const pacienteId = route.params.id

const mostrarFormulario = ref(false)

const estudioEditar = ref(null)

function editarEstudio(estudio) {
  estudioEditar.value = { ...estudio }
  mostrarFormulario.value = true
}

const estudioSeleccionado = ref(null)

function verDetalleEstudio(estudio) {
  estudioSeleccionado.value = estudio
}

function cerrarDetalle() {
  estudioSeleccionado.value = null
}

const estudiosPrueba = ref([
  {
    id: 1,
    fecha: '2026-11-03',
    tipoEstudio: 'Radiografía de tórax',
    descripcion: 'Estudio de control general.',
    resultado: 'Sin alteraciones significativas.'
  },
  {
    id: 2,
    fecha: '2026-11-02',
    tipoEstudio: 'Análisis de sangre',
    descripcion: 'Análisis de laboratorio de rutina.',
    resultado: 'Valores dentro de los parámetros esperados.'
  },
  {
    id: 3,
    fecha: '2026-11-01',
    tipoEstudio: 'Ecografía abdominal',
    descripcion: 'Estudio ecográfico de control.',
    resultado: ''
  }
])

function alternarFormulario() {
  if (mostrarFormulario.value) {
    mostrarFormulario.value = false
    estudioEditar.value = null
  } else {
    estudioEditar.value = null
    mostrarFormulario.value = true
  }
}

function eliminarEstudio(estudio) {
  const confirmar = window.confirm(
    `¿Estás seguro de eliminar el estudio "${estudio.tipoEstudio}"?`
  )

  if (!confirmar) return

  estudiosPrueba.value = estudiosPrueba.value.filter(
    (item) => item.id !== estudio.id
  )

  if (estudioSeleccionado.value?.id === estudio.id) {
    estudioSeleccionado.value = null
  }

  if (estudioEditar.value?.id === estudio.id) {
    estudioEditar.value = null
    mostrarFormulario.value = false
  }
}

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
      Sección destinada a consultar y gestionar
      los estudios médicos de un paciente.
    </p>

    <section class="contenido">

      <div class="encabezado">
        <h2>Registro de estudios médicos</h2>

        <button
          type="button"
          @click="alternarFormulario"
        >
          {{ mostrarFormulario ? 'Cancelar' : '+ Nuevo estudio' }}
        </button>
      </div>

      <p class="mensaje">
        El registro de estudios médicos todavía
        no está habilitado.
      </p>

      
<EstudioMedicoForm
  v-if="mostrarFormulario"
  :estudio="estudioEditar"
/>
      
<p class="mensaje">
  Datos ficticios utilizados para probar el listado.
</p>

<EstudiosMedicosLista
  :estudios="estudiosPrueba"
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

    <button
      type="button"
      @click="cerrarDetalle"
    >
      Cerrar
    </button>
  </div>

  <p>
    <strong>Fecha:</strong>
    {{ estudioSeleccionado.fecha }}
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

  <p class="aviso-detalle">
    Datos ficticios utilizados únicamente para pruebas.
  </p>
</section>

      <p class="aviso">
        Módulo en desarrollo. No se muestran
        datos clínicos reales.
      </p>

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
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
}

.volver:hover {
  text-decoration: underline;
}

h1 {
  font-size: 30px;
  margin-bottom: 12px;
  color: #1e293b;
}

.descripcion {
  color: #64748b;
  margin-bottom: 25px;
}

.contenido {
  background: white;
  padding: 25px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

h2 {
  font-size: 22px;
  margin-bottom: 15px;
  color: #1e293b;
}

.mensaje {
  color: #64748b;
  margin-bottom: 15px;
}

.aviso {
  padding: 12px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 8px;
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

.encabezado button {
  padding: 12px 18px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.encabezado button:hover {
  background: #1d4ed8;
}

.detalle-estudio {
  margin-top: 25px;
  padding: 25px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
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

.detalle-encabezado button {
  padding: 10px 16px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.detalle-estudio p {
  margin-bottom: 12px;
  color: #334155;
}

.aviso-detalle {
  margin-top: 20px;
  padding: 12px;
  background: #fef3c7;
  color: #92400e !important;
  border-radius: 8px;
}

</style>
