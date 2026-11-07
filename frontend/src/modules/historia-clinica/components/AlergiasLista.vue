

<script setup>
defineProps({
  alergias: {
    type: Array,
    default: () => []
  },
  modoPrueba: {
    type: Boolean,
    default: false
  }
})


const emit = defineEmits(['editar', 'eliminar'])

function eliminarAlergia(alergia) {
  emit('eliminar', alergia)
}


function editarAlergia(alergia) {
  emit('editar', alergia)
}
</script>


<template>
  <section class="listado">
    <h2>Alergias registradas</h2>

    <p v-if="alergias.length === 0" class="mensaje">
      No hay registros de alergias para mostrar.
    </p>

    <div v-else class="tabla-contenedor">
      <table>
        <thead>
          <tr>
            <th>Alérgeno</th>
            <th>Reacción</th>
            <th>Severidad</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="alergia in alergias"
            :key="alergia.id"
          >
            <td>{{ alergia.alergeno }}</td>
            <td>{{ alergia.reaccion }}</td>
            <td>
              <span
                class="severidad"
                :class="alergia.severidad"
              >
                {{ alergia.severidad }}
              </span>
            </td>
            
<td>
  <div class="acciones">
   
<button
  type="button"
  class="editar"
  :disabled="!modoPrueba"
  @click="editarAlergia(alergia)"
>
  Editar
</button>


    
<button
  type="button"
  class="eliminar"
  :disabled="!modoPrueba"
  @click="eliminarAlergia(alergia)"
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
  font-weight: bold;
  margin-bottom: 20px;
}

.tabla-contenedor {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 14px;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
}

th {
  background: #f1f5f9;
  font-weight: 600;
}

.severidad {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 6px;
  font-weight: 600;
  text-transform: capitalize;
}

.leve {
  background: #dcfce7;
  color: #166534;
}

.moderada {
  background: #fef3c7;
  color: #92400e;
}

.alta {
  background: #fee2e2;
  color: #991b1b;
}

.mensaje {
  color: #64748b;
  text-align: center;
  padding: 20px;
}

.acciones {
  display: flex;
  gap: 10px;
}

.acciones button {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
}

.editar {
  background: #dbeafe;
  color: #1d4ed8;
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
