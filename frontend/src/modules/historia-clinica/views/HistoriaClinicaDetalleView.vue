<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { obtenerPacientePorId } from '../services/historiaClinicaService'

const route = useRoute()

const paciente = ref(null)
const cargando = ref(true)
const error = ref('')

async function cargarPaciente() {
  try {
    const respuesta = await obtenerPacientePorId(route.params.id)
    paciente.value = respuesta.data
  } catch (err) {
    console.error(err)
    error.value = 'No se pudo cargar el paciente.'
  } finally {
    cargando.value = false
  }
}

onMounted(cargarPaciente)
</script>

<template>
  <main class="detalle">
    <RouterLink to="/historia-clinica">
      ← Volver a pacientes
    </RouterLink>

    <h1>Historia Clínica del Paciente</h1>

    <p v-if="cargando">Cargando paciente...</p>
    <p v-else-if="error">{{ error }}</p>

    <template v-else-if="paciente">
      <section class="paciente">
        <h2>{{ paciente.nombre }} {{ paciente.apellido }}</h2>
        <p><strong>DNI:</strong> {{ paciente.dni }}</p>
        <p>
          <strong>Email:</strong>
          {{ paciente.email || 'No registrado' }}
        </p>
      </section>

      <section class="modulos">
        <div class="tarjeta">Alergias</div>
        <div class="tarjeta">Evoluciones médicas</div>
        <div class="tarjeta">Estudios médicos</div>
        <div class="tarjeta">Antecedentes familiares</div>
      </section>
    </template>
  </main>
</template>

<style scoped>
.detalle {
  max-width: 1100px;
  margin: auto;
  padding: 30px;
}

h1 {
  font-size: 28px;
  font-weight: bold;
  margin: 25px 0;
}

.paciente {
  background: #f1f5f9;
  padding: 20px;
  border-radius: 10px;
}

.paciente h2 {
  font-size: 22px;
  font-weight: bold;
}

.modulos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.tarjeta {
  padding: 25px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-weight: 600;
}
</style>