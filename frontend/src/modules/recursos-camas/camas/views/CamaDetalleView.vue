<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
      <router-link to="/camas" class="text-sm text-indigo-600 hover:underline">← Volver al mapa</router-link>

      <h1 class="mt-4 mb-2 text-2xl font-semibold text-gray-900">Cama {{ cama?.id }}</h1>
      <p v-if="cama" class="mb-6 text-sm text-gray-500">
        Estado: <strong>{{ cama.estado }}</strong> · Habitación: {{ cama.habitacion_id }}
        <span v-if="habitacionActual"> ({{ habitacionActual.numero }} · {{ habitacionActual.sector }})</span>
      </p>

      <div class="flex flex-col gap-5">
        <div class="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
          <h2 class="font-medium text-gray-900">Mover habitación / sector</h2>
          <select
            v-model.number="destinoHabitacionId"
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option :value="0" disabled>Elegí habitación…</option>
            <option v-for="h in habitaciones" :key="h.id" :value="h.id">
              #{{ h.id }} — {{ h.numero }} ({{ h.sector }})
            </option>
          </select>
          <button
            @click="hacerMover"
            class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Mover
          </button>
        </div>

        <div v-if="cama?.estado === 'Libre'" class="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
          <h2 class="font-medium text-gray-900">Asignar paciente</h2>
          <select v-model.number="asignar.paciente_id" class="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="" disabled>Seleccionar paciente internado…</option>
            <option v-for="c in candidatos" :key="c.pacienteId" :value="c.pacienteId">
              {{ c.nombre }}{{ c.dni ? ` — DNI ${c.dni}` : '' }}
            </option>
          </select>
          <p v-if="candidatos.length === 0" class="text-xs text-amber-600">
            No hay pacientes internados sin cama. Primero hay que confirmar su ingreso en
            Atención de Enfermería › Internaciones.
          </p>
          <button @click="hacerAsignacion" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Asignar
          </button>
        </div>

        <div v-if="cama?.estado === 'Ocupada' && esAdmin" class="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
          <h2 class="font-medium text-gray-900">Pasar a limpieza (admin)</h2>
          <p class="text-xs text-gray-500">
            Uso excepcional. El flujo normal es el alta del paciente.
          </p>
          <button @click="hacerLimpieza" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Enviar a limpieza
          </button>
        </div>

        <div
          v-else-if="cama?.estado === 'Ocupada'"
          class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
        >
          Esta cama está ocupada. Pasa a limpieza con el alta del paciente.
        </div>

        <div v-if="cama?.estado === 'En limpieza' || cama?.estado === 'Bloqueada'" class="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
          <h2 class="font-medium text-gray-900">
            {{ cama.estado === 'En limpieza' ? 'Confirmar higiene y liberar' : 'Volver a Libre' }}
          </h2>
          <p v-if="cama.estado === 'En limpieza'" class="text-xs text-gray-500">
            La cama quedó bloqueada tras el alta hasta que maestranza confirme la higiene.
          </p>
          <button @click="hacerLiberar" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Liberar cama
          </button>
        </div>

        <div v-if="cama?.estado === 'Libre'" class="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
          <h2 class="font-medium text-gray-900">Bloquear cama</h2>
          <button @click="hacerBloqueo" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Bloquear
          </button>
        </div>
      </div>

      <p v-if="error" class="mt-4 text-sm text-red-500">{{ error }}</p>
      <p v-if="ok" class="mt-4 text-sm text-green-600">{{ ok }}</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  getCamaById,
  moverCama,
  asignarCama,
  pasarALimpieza,
  cambiarEstadoCama,
  urlCamasStream
} from '../services/camaService'
import { getHabitaciones } from '../../habitaciones/services/habitacionService'
import { listarInternaciones } from '@/modules/atencion-enfermeria/services/internacionService'
import { getPacientes } from '@/modules/admision/pacientes/services/pacienteService'
import { useEventStream } from '@/shared/composables/useEventStream'
import { usuarioIdActual } from '@/shared/utils/formato'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const authStore = useAuthStore()
const cama = ref(null)
const habitaciones = ref([])
const destinoHabitacionId = ref(0)
const error = ref('')
const ok = ref('')
const esAdmin = authStore.hasRole('Administrador')

const asignar = reactive({ paciente_id: '' })

const habitacionActual = computed(() =>
  habitaciones.value.find((h) => Number(h.id) === Number(cama.value?.habitacion_id))
)

const cargar = async () => {
  error.value = ''
  const res = await getCamaById(route.params.id)
  cama.value = res.data
  destinoHabitacionId.value = res.data.habitacion_id
}

const cargarHabitaciones = async () => {
  const res = await getHabitaciones()
  habitaciones.value = res.data
}

onMounted(async () => {
  try {
    await Promise.all([cargar(), cargarHabitaciones()])
  } catch (e) {
    error.value = e.response?.data?.error || 'No se pudo cargar la cama'
  }
})

const hacerMover = async () => {
  error.value = ''
  ok.value = ''
  if (!destinoHabitacionId.value) {
    error.value = 'Elegí una habitación'
    return
  }
  if (destinoHabitacionId.value === cama.value.habitacion_id) {
    error.value = 'La cama ya está en esa habitación'
    return
  }
  try {
    await moverCama(cama.value.id, { habitacion_id: destinoHabitacionId.value })
    ok.value = 'Cama movida'
    await cargar()
  } catch (e) {
    error.value = e.response?.data?.error || 'No se pudo mover la cama'
  }
}

const hacerAsignacion = async () => {
  error.value = ''
  ok.value = ''
  if (!asignar.paciente_id) {
    error.value = 'Seleccioná el paciente a internar'
    return
  }
  try {
    await asignarCama(cama.value.id, {
      paciente_id: asignar.paciente_id,
      usuario_id: usuarioIdActual()
    })
    ok.value = 'Cama asignada'
    await cargar()
  } catch (e) {
    error.value = e.response?.data?.error || 'No se pudo asignar'
  }
}

const internaciones = ref([])
const pacientes = ref([])

const candidatos = computed(() =>
  internaciones.value
    .filter((i) => i.estado === 'ACTIVA' && !i.camaId)
    .map((i) => {
      const p = pacientes.value.find((x) => Number(x.id) === Number(i.pacienteId))
      return {
        pacienteId: i.pacienteId,
        nombre: p ? `${p.apellido}, ${p.nombre}` : `Paciente #${i.pacienteId}`,
        dni: p?.dni
      }
    })
)

const cargarCandidatos = async () => {
  try {
    const [resInternaciones, resPacientes] = await Promise.all([listarInternaciones(), getPacientes()])
    internaciones.value = resInternaciones
    pacientes.value = Array.isArray(resPacientes.data) ? resPacientes.data : resPacientes.data?.data || []
  } catch (e) {
    console.error('No se pudieron cargar los pacientes internados:', e)
  }
}

onMounted(cargarCandidatos)

useEventStream(urlCamasStream(), {
  cama_estado: async (evento) => {
    if (cama.value && Number(evento.camaId) === Number(cama.value.id)) {
      await cargar().catch(() => {})
      await cargarCandidatos()
    }
  }
})

const hacerLimpieza = async () => {
  error.value = ''
  ok.value = ''
  try {
    await pasarALimpieza(cama.value.id, {
      usuario_id: usuarioIdActual()
    })
    ok.value = 'Cama en limpieza'
    await cargar()
  } catch (e) {
    error.value = e.response?.data?.error || 'No se pudo pasar a limpieza'
  }
}

const hacerLiberar = async () => {
  error.value = ''
  ok.value = ''
  try {
    await cambiarEstadoCama(cama.value.id, {
      estado: 'Libre',
      usuario_id: usuarioIdActual()
    })
    ok.value = 'Cama libre'
    await cargar()
  } catch (e) {
    error.value = e.response?.data?.error || 'No se pudo liberar'
  }
}

const hacerBloqueo = async () => {
  error.value = ''
  ok.value = ''
  try {
    await cambiarEstadoCama(cama.value.id, {
      estado: 'Bloqueada',
      usuario_id: usuarioIdActual()
    })
    ok.value = 'Cama bloqueada'
    await cargar()
  } catch (e) {
    error.value = e.response?.data?.error || 'No se pudo bloquear'
  }
}
</script>
