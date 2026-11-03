
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { obtenerPacientePorId } from '../services/historiaClinicaService'
import AlergiaForm from '../components/AlergiaForm.vue'

import AlergiasLista from '../components/AlergiasLista.vue'


const route = useRoute()
const pacienteId = route.params.id

const paciente = ref(null)
const cargando = ref(true)
const error = ref('')
const mostrarFormulario = ref(false)

const alergiaSeleccionada = ref(null)

function editarAlergia(alergia) {
  alergiaSeleccionada.value = { ...alergia }
  mostrarFormulario.value = true
}

function eliminarAlergia(alergia) {
  const confirmar = window.confirm(
    `¿Estás seguro de eliminar la alergia a ${alergia.alergeno}?`
  )

  if (!confirmar) return

  alergiasPrueba.value = alergiasPrueba.value.filter(
    item => item.id !== alergia.id
  )

  if (alergiaSeleccionada.value?.id === alergia.id) {
    alergiaSeleccionada.value = null
    mostrarFormulario.value = false
  }
}



const alergiasPrueba = ref([
  {
    id: 1,
    alergeno: 'Penicilina',
    reaccion: 'Erupción cutánea',
    severidad: 'alta'
  },
  {
    id: 2,
    alergeno: 'Polen',
    reaccion: 'Estornudos',
    severidad: 'leve'
  },
  {
    id: 3,
    alergeno: 'Mariscos',
    reaccion: 'Hinchazón',
    severidad: 'moderada'
  }
])


async function cargarPaciente() {
  try {
    const respuesta = await obtenerPacientePorId(pacienteId)
    paciente.value = respuesta.data
  } catch (err) {
    console.error(err)
    error.value = 'No se pudo cargar la información del paciente.'
  } finally {
    cargando.value = false
  }
}


function alternarFormulario() {
  if (mostrarFormulario.value) {
    mostrarFormulario.value = false
    alergiaSeleccionada.value = null
  } else {
    alergiaSeleccionada.value = null
    mostrarFormulario.value = true
  }
}


onMounted(cargarPaciente)
</script>


<template>
  <main class="alergias">
    <RouterLink :to="`/historia-clinica/${pacienteId}`">
      ← Volver a Historia Clínica
    </RouterLink>

    <h1>Alergias del Paciente</h1>
    
<p class="aviso-prueba">
  Modo de prueba: los datos de alergias son ficticios
  y los cambios no se guardan.
</p>

    
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

      <p class="mensaje">
        La consulta de alergias todavía no está habilitada.
      </p>

      
<AlergiaForm
  v-if="mostrarFormulario"
  :alergia="alergiaSeleccionada"
/>
 
      
<p class="mensaje">
  Datos ficticios para probar el diseño del listado.
</p>


<AlergiasLista
  :alergias="alergiasPrueba"
  :modo-prueba="true"
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
