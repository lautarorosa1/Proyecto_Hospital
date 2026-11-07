

<script setup>
import { ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import EvolucionMedicaForm from '../components/EvolucionMedicaForm.vue'

import EvolucionesMedicasLista from '../components/EvolucionesMedicasLista.vue'


const route = useRoute()
const pacienteId = route.params.id

const mostrarFormulario = ref(false)

const evolucionEditar = ref(null)

function editarEvolucion(evolucion) {
  evolucionEditar.value = { ...evolucion }
  mostrarFormulario.value = true
}

function eliminarEvolucion(evolucion) {
  const confirmar = window.confirm(
    `¿Estás seguro de eliminar la evolución "${evolucion.motivoConsulta}"?`
  )

  if (!confirmar) return

  evolucionesPrueba.value = evolucionesPrueba.value.filter(
    item => item.id !== evolucion.id
  )

  if (evolucionSeleccionada.value?.id === evolucion.id) {
    evolucionSeleccionada.value = null
  }

  if (evolucionEditar.value?.id === evolucion.id) {
    evolucionEditar.value = null
    mostrarFormulario.value = false
  }
}

const evolucionSeleccionada = ref(null)

function verDetalleEvolucion(evolucion) {
  evolucionSeleccionada.value = evolucion
}

function cerrarDetalle() {
  evolucionSeleccionada.value = null
}


const evolucionesPrueba = ref([
  {
    id: 1,
    fecha: '2026-11-03',
    motivoConsulta: 'Control general',
    observaciones: 'Paciente estable, sin molestias actuales.',
    indicaciones: 'Continuar con controles periódicos.'
  },
  {
    id: 2,
    fecha: '2026-11-02',
    motivoConsulta: 'Dolor de cabeza',
    observaciones: 'Paciente refiere cefalea leve.',
    indicaciones: 'Seguimiento de síntomas.'
  },
  {
    id: 3,
    fecha: '2026-11-01',
    motivoConsulta: 'Consulta de seguimiento',
    observaciones: 'Evolución favorable respecto al control anterior.',
    indicaciones: ''
  }
])



function alternarFormulario() {
  if (mostrarFormulario.value) {
    mostrarFormulario.value = false
    evolucionEditar.value = null
  } else {
    evolucionEditar.value = null
    mostrarFormulario.value = true
  }
}

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
      En esta sección se podrán consultar y registrar
      las evoluciones médicas del paciente.
    </p>

    <section class="contenido">
      <div class="encabezado">
        <h2>Registro de evoluciones</h2>

        
     <button
       type="button"
      @click="alternarFormulario"
     >
      {{ mostrarFormulario ? 'Cancelar' : '+ Nueva evolución' }}
    </button>

      </div>

      <p class="mensaje">
        El registro de evoluciones médicas todavía
        no está habilitado.
      </p>
      
    
<EvolucionMedicaForm
  v-if="mostrarFormulario"
  :evolucion="evolucionEditar"
/>

     
    <p class="mensaje">
        Datos ficticios utilizados para probar el listado.
    </p>

    

<EvolucionesMedicasLista
  :evoluciones="evolucionesPrueba"
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

    <button
      type="button"
      @click="cerrarDetalle"
    >
      Cerrar
    </button>
  </div>

  <p>
    <strong>Fecha:</strong>
    {{ evolucionSeleccionada.fecha }}
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

  <p class="aviso-prueba">
    Datos ficticios utilizados únicamente para pruebas.
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
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
}

.volver:hover {
  text-decoration: underline;
}

h1 {
  font-size: 30px;
  margin-bottom: 15px;
  color: #1e293b;
}

.descripcion {
  color: #64748b;
  margin-bottom: 30px;
}

.contenido {
  background: white;
  padding: 25px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.encabezado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

h2 {
  font-size: 20px;
  color: #1e293b;
}

button {
  padding: 10px 18px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mensaje {
  margin-top: 25px;
  color: #64748b;
}

.detalle-evolucion {
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

.detalle-evolucion p {
  margin-bottom: 12px;
  color: #334155;
}

.aviso-prueba {
  margin-top: 20px;
  padding: 12px;
  background: #fef3c7;
  color: #92400e !important;
  border-radius: 8px;
}

</style>
