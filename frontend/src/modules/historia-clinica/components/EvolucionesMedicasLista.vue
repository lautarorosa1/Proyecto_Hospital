

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
  font-size: 20px;
  color: #1e293b;
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
  padding: 14px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: top;
}

th {
  background: #f1f5f9;
  color: #334155;
  font-weight: 600;
}

td {
  color: #475569;
}

tbody tr:hover {
  background: #f8fafc;
}

.mensaje {
  color: #64748b;
  padding: 15px 0;
}

.acciones {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.acciones button {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  white-space: nowrap;
}

.ver {
  background: #dbeafe;
  color: #1d4ed8;
}

.editar {
  background: #fef3c7;
  color: #92400e;
}

.eliminar {
  background: #fee2e2;
  color: #b91c1c;
}

.acciones button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

</style>
