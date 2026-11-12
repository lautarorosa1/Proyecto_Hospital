<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
      <router-link to="/camas" class="text-sm text-indigo-600 hover:underline">← Volver al mapa</router-link>

      <h1 class="mt-4 mb-2 text-2xl font-semibold text-gray-900">Cama {{ cama?.numero }}</h1>
      <p v-if="cama" class="mb-6 text-sm text-gray-500">
        Estado: <strong>{{ cama.estado }}</strong> · Version: <strong>{{ cama.version }}</strong> · Habitación: {{ cama.habitacion_id }}
      </p>

      <div class="flex flex-col gap-5">
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
          <input v-model.number="asignar.usuario_id" type="number" min="1" placeholder="usuario_id" class="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <button @click="hacerAsignacion" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Asignar
          </button>
        </div>

        <div v-if="cama?.estado === 'Ocupada'" class="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
          <h2 class="font-medium text-gray-900">Pasar a limpieza</h2>
          <input v-model.number="limpieza.usuario_id" type="number" min="1" placeholder="usuario_id" class="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <button @click="hacerLimpieza" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Enviar a limpieza
          </button>
        </div>

        <div v-if="cama?.estado === 'En limpieza' || cama?.estado === 'Bloqueada'" class="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
          <h2 class="font-medium text-gray-900">
            {{ cama.estado === 'En limpieza' ? 'Confirmar higiene y liberar' : 'Volver a Libre' }}
          </h2>
          <p v-if="cama.estado === 'En limpieza'" class="text-xs text-gray-500">
            La cama quedó bloqueada tras el alta hasta que maestranza confirme la higiene.
          </p>
          <input v-model.number="liberar.usuario_id" type="number" min="1" placeholder="usuario_id" class="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <button @click="hacerLiberar" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Liberar cama
          </button>
        </div>

        <div v-if="cama?.estado === 'Libre'" class="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
          <h2 class="font-medium text-gray-900">Bloquear cama</h2>
          <input v-model.number="bloquear.usuario_id" type="number" min="1" placeholder="usuario_id" class="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
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
  asignarCama,
  pasarALimpieza,
  cambiarEstadoCama,
  urlCamasStream
} from '../services/camaService'
import { listarInternaciones } from '@/modules/atencion-enfermeria/services/internacionService'
import { getPacientes } from '@/modules/admision/pacientes/services/pacienteService'
import { useEventStream } from '@/shared/composables/useEventStream'
import { usuarioIdActual } from '@/shared/utils/formato'

const route = useRoute()
const cama = ref(null)
const error = ref('')
const ok = ref('')

const asignar = reactive({ paciente_id: '', usuario_id: usuarioIdActual() })
const limpieza = reactive({ usuario_id: 1 })
const liberar = reactive({ usuario_id: 1 })
const bloquear = reactive({ usuario_id: 1 })

const cargar = async () => {
  error.value = ''
  const res = await getCamaById(route.params.id)
  cama.value = res.data
}

onMounted(async () => {
  try {
    await cargar()
  } catch (e) {
    error.value = e.response?.data?.error || 'No se pudo cargar la cama'
  }
})

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
      usuario_id: asignar.usuario_id,
      version: cama.value.version
    })
    ok.value = 'Cama asignada'
    await cargar()
  } catch (e) {
    error.value = e.response?.data?.error || 'No se pudo asignar'
  }
}

// Solo se asigna cama a pacientes ya ingresados (con internación activa) y sin cama todavía
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

// Tiempo real: si cambia el estado de esta cama (alta, limpieza confirmada) se refresca sola
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
      usuario_id: limpieza.usuario_id,
      version: cama.value.version
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
      usuario_id: liberar.usuario_id,
      version: cama.value.version
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
      usuario_id: bloquear.usuario_id,
      version: cama.value.version
    })
    ok.value = 'Cama bloqueada'
    await cargar()
  } catch (e) {
    error.value = e.response?.data?.error || 'No se pudo bloquear'
  }
}
</script>