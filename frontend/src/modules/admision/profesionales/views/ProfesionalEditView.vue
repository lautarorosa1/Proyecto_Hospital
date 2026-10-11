<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
      <h1 class="mb-6 text-2xl font-semibold text-gray-900">Editar profesional</h1>

      <ProfesionalForm
        v-if="profesional"
        v-model="profesional"
        :errores="errores"
        :error-general="errorGeneral"
        :guardando="guardando"
        mostrar-estado
        texto-boton="Actualizar"
        @submit="editarProfesional"
      />

      <div v-else class="flex justify-center py-10">
        <p v-if="errorGeneral" class="text-sm text-red-500">{{ errorGeneral }}</p>
        <p v-else class="text-sm text-gray-400">Cargando profesional...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProfesionalForm from '../components/ProfesionalForm.vue'
import { getProfesionalById, updateProfesional } from '../services/profesionalService'
import {
  erroresVacios,
  validarProfesional,
  armarPayload,
  procesarErrorServidor
} from '../utils/profesionalForm'

const route = useRoute()
const router = useRouter()

const profesional = ref(null)
const errores = reactive(erroresVacios())
const errorGeneral = ref('')
const guardando = ref(false)

const cargarProfesional = async () => {
  try {
    const { data } = await getProfesionalById(route.params.id)
    // el backend omite telefono si no tiene valor
    profesional.value = { ...data, telefono: data.telefono ?? '' }
  } catch (error) {
    console.error('Error cargando profesional:', error)
    errorGeneral.value = procesarErrorServidor(error, errores)
  }
}

const editarProfesional = async () => {
  errorGeneral.value = ''
  if (!validarProfesional(profesional.value, errores)) return

  guardando.value = true
  try {
    await updateProfesional(
      route.params.id,
      armarPayload(profesional.value, { edicion: true })
    )
    router.push('/profesionales')
  } catch (error) {
    console.error('Error actualizando profesional:', error)
    errorGeneral.value = procesarErrorServidor(error, errores)
  } finally {
    guardando.value = false
  }
}

onMounted(() => {
  cargarProfesional()
})
</script>
