<script setup>
import { ref, computed, onMounted } from 'vue'
import { obtenerPacientes } from '../services/historiaClinicaService'
import { useRouter } from 'vue-router'

const router = useRouter()

function verHistoriaClinica(id) {
  router.push({
    name: 'historia-clinica-detalle',
    params: { id }
  })
}
const pacientes = ref([])
const busqueda = ref('')
const cargando = ref(false)
const error = ref('')

const pacientesFiltrados = computed(() => {
  const texto = busqueda.value.toLowerCase().trim()

  return pacientes.value.filter((paciente) => {
    const nombre = String(paciente.nombre ?? '').toLowerCase()
    const apellido = String(paciente.apellido ?? '').toLowerCase()
    const dni = String(paciente.dni ?? '')

    return `${nombre} ${apellido}`.includes(texto)
      || dni.includes(texto)
  })
})

async function cargarPacientes() {
  cargando.value = true
  error.value = ''

  try {
    const respuesta = await obtenerPacientes()
    pacientes.value = respuesta.data
  } catch (err) {
    console.error(err)
    error.value = 'No se pudieron cargar los pacientes.'
  } finally {
    cargando.value = false
  }
}

onMounted(cargarPacientes)
</script>

<template>
  <main class="historia-clinica">
    <h1>Historia Clínica</h1>
    <p>Consulta de pacientes registrados en el hospital.</p>

    <div class="buscador">
      <label for="busqueda">Buscar paciente</label>
      <input
        id="busqueda"
        v-model="busqueda"
        placeholder="Ingresá nombre, apellido o DNI"
      />
    </div>

    <p v-if="cargando">Cargando pacientes...</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <section v-else>
      <h2>Pacientes registrados</h2>

      <table v-if="pacientesFiltrados.length">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>DNI</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="paciente in pacientesFiltrados" :key="paciente.id">
            <td>{{ paciente.nombre }}</td>
            <td>{{ paciente.apellido }}</td>
            <td>{{ paciente.dni }}</td>
            <td>
             <button
                type="button"
                 @click="verHistoriaClinica(paciente.id)"
                >
                 Ver historia clínica
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else>
        {{ pacientes.length === 0
          ? 'Todavía no hay pacientes registrados.'
          : 'No se encontraron pacientes con esa búsqueda.' }}
      </p>
    </section>
  </main>
</template>

<style scoped>
.historia-clinica {
  max-width: 1100px;
  margin: auto;
  padding: 30px;
}

h1 {
  font-size: 28px;
  font-weight: bold;
}

.buscador {
  margin: 30px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

input {
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

h2 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

th {
  background: #f1f5f9;
}

button {
  background: #2563eb;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
}

button:hover {
  background: #1d4ed8;
}

.error {
  color: red;
}
</style>