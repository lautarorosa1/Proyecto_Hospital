
<script setup>
defineProps({
  estudios: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['ver-detalle', 'editar', 'eliminar'])

function editarEstudio(estudio) {
  emit('editar', estudio)
}

function verDetalle(estudio) {
  emit('ver-detalle', estudio)
}

function formatearFecha(fecha) {
  if (!fecha) return '-'

  const partes = fecha.split('-')

  if (partes.length !== 3) return fecha

  return `${partes[2]}/${partes[1]}/${partes[0]}`
}
function eliminarEstudio(estudio) {
  emit('eliminar', estudio)
}
</script>

<template>
  <section class="listado">
    <h2>Estudios médicos registrados</h2>

    <p v-if="estudios.length === 0" class="mensaje">
      No hay estudios médicos para mostrar.
    </p>

    <div v-else class="tabla-contenedor">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo de estudio</th>
            <th>Descripción</th>
            <th>Resultado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="estudio in estudios"
            :key="estudio.id"
          >
            <td>{{ formatearFecha(estudio.fecha) }}</td>
            <td>{{ estudio.tipoEstudio }}</td>
            <td>{{ estudio.descripcion }}</td>
            <td>
              {{ estudio.resultado || 'Sin resultado' }}
            </td>
            
<td>
  <div class="acciones">
    
<button
  type="button"
  class="ver"
  @click="verDetalle(estudio)"
>
  Ver detalle
</button>
  
<button
  type="button"
  class="editar"
  @click="editarEstudio(estudio)"
>
  Editar
</button>

   <button
  type="button"
  class="eliminar"
  @click="eliminarEstudio(estudio)"
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
  font-size: 22px;
  margin-bottom: 20px;
  color: #1e293b;
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
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
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
