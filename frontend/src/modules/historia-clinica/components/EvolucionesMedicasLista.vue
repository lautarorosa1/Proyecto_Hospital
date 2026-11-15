

<script setup>
defineProps({
  evoluciones: {
    type: Array,
    default: () => []
  }
})


const emit = defineEmits([
  'ver-detalle',
  'editar',
  'eliminar'
])

function eliminarEvolucion(evolucion) {
  emit('eliminar', evolucion)
}


function editarEvolucion(evolucion) {
  emit('editar', evolucion)
}

function verDetalle(evolucion) {
  emit('ver-detalle', evolucion)
}

function formatearFecha(fecha) {
  if (!fecha) return '-'

  const partes = fecha.split('-')

  if (partes.length !== 3) return fecha

  return `${partes[2]}/${partes[1]}/${partes[0]}`
}
</script>


<template>
  <section class="listado">
    <h2>Evoluciones registradas</h2>

    <p v-if="evoluciones.length === 0" class="mensaje">
      No hay evoluciones médicas para mostrar.
    </p>

    <div v-else class="tabla-contenedor">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Motivo de consulta</th>
            <th>Observaciones</th>
            <th>Indicaciones</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="evolucion in evoluciones"
            :key="evolucion.id"
          >
            <td>{{ formatearFecha(evolucion.fecha) }}</td>
            <td>{{ evolucion.motivoConsulta }}</td>
            <td>{{ evolucion.observaciones }}</td>
            <td>{{ evolucion.indicaciones || 'Sin indicaciones' }}</td>       
            <td>
              <div class="acciones">  
            <button
              type="button"
              class="ver"
              @click="verDetalle(evolucion)"
            >
             Ver detalle
            </button>
              
<button
  type="button"
  class="editar"
  @click="editarEvolucion(evolucion)"
>
  Editar
</button>


              
<button
  type="button"
  class="eliminar"
  @click="eliminarEvolucion(evolucion)"
>
  Eliminar
</button>

              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.listado {
  margin-top: 30px;
}

h2 {
  font-size: var(--font-heading-2);
  color: var(--color-neutral-900);
  margin-bottom: 20px;
}

.tabla-contenedor {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

th,
td {
  padding: .75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
  vertical-align: top;
}

th {
  background: var(--color-neutral-100);
  color: var(--color-neutral-700);
  font-weight: 600;
}

td {
  color: var(--color-neutral-600);
}

tbody tr:hover {
  background: var(--color-neutral-50);
}

.mensaje {
  color: var(--color-neutral-600);
  padding: 15px 0;
}

.acciones {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.acciones button {
  white-space: nowrap;
}

</style>
