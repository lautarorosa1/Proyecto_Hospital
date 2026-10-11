<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
      <h1 class="mb-6 text-2xl font-semibold text-gray-900">Crear profesional</h1>

      <ProfesionalForm
        v-model="profesional"
        :errores="errores"
        :error-general="errorGeneral"
        :guardando="guardando"
        texto-boton="Guardar"
        @submit="guardarProfesional"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import ProfesionalForm from '../components/ProfesionalForm.vue'
import { createProfesional } from '../services/profesionalService'
import {
  profesionalVacio,
  erroresVacios,
  validarProfesional,
  armarPayload,
  procesarErrorServidor
} from '../utils/profesionalForm'

const router = useRouter()

const profesional = ref(profesionalVacio())
const errores = reactive(erroresVacios())
const errorGeneral = ref('')
const guardando = ref(false)

const guardarProfesional = async () => {
  errorGeneral.value = ''
  if (!validarProfesional(profesional.value, errores)) return

  guardando.value = true
  try {
    await createProfesional(armarPayload(profesional.value))
    router.push('/profesionales')
  } catch (error) {
    console.error(error)
    errorGeneral.value = procesarErrorServidor(error, errores)
  } finally {
    guardando.value = false
  }
}
</script>
