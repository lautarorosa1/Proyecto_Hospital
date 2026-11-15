

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
  font-size: var(--font-heading-2);
  font-weight: 600;
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
  padding: .75rem 1rem;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
}

th {
  background: var(--color-neutral-100);
  font-weight: 600;
}

.severidad {
  display: inline-block;
  padding: 5px 12px;
  border-radius: var(--radius-control);
  font-weight: 600;
  text-transform: capitalize;
}

.leve {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.moderada {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.alta {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

.mensaje {
  color: var(--color-neutral-600);
  text-align: center;
  padding: 20px;
}

.acciones {
  display: flex;
  gap: 10px;
}

</style>
