
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
  font-size: var(--font-heading-2);
  margin-bottom: 20px;
  color: var(--color-neutral-900);
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
  border-bottom: 1px solid var(--color-border);
  text-align: left;
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
