<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
      <h1 class="mb-6 text-2xl font-semibold text-gray-900">Crear paciente</h1>

      <form class="flex flex-col gap-5" @submit.prevent="guardarPaciente">
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium text-gray-700">Nombre</label>
            <small class="text-xs text-red-500">{{ errores.nombre }}</small>
          </div>
          <input
            v-model="paciente.nombre"
            type="text"
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium text-gray-700">Apellido</label>
            <small class="text-xs text-red-500">{{ errores.apellido }}</small>
          </div>
          <input
            v-model="paciente.apellido"
            type="text"
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium text-gray-700">DNI</label>
            <small class="text-xs text-red-500">{{ errores.dni }}</small>
          </div>
          <input
            v-model="paciente.dni"
            type="text" 
            inputmode="numeric"
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium text-gray-700">Email</label>
            <small class="text-xs text-red-500">{{ errores.email }}</small>
          </div>
          <input
            v-model="paciente.email"
            type="email"
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium text-gray-700">Fecha de nacimiento</label>
            <small class="text-xs text-red-500">{{ errores.fechaNacimiento }}</small>
          </div>
          <input
            v-model="paciente.fechaNacimiento"
            type="date"
            :max="hoy"
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-700">Teléfono <span class="font-normal text-gray-400">(opcional)</span></label>
          <input
            v-model="paciente.telefono"
            type="tel"
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-700">Dirección <span class="font-normal text-gray-400">(opcional)</span></label>
          <input
            v-model="paciente.direccion"
            type="text"
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <p v-if="errorGeneral" class="text-sm text-red-500">{{ errorGeneral }}</p>

        <div class="mt-2 flex justify-end">
          <button
            type="submit"
            :disabled="guardando"
            class="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { createPaciente } from '../services/pacienteService'
import {
  hoyISO,
  erroresVacios,
  validarPaciente,
  procesarErrorServidor
} from '../utils/pacienteForm'

const router = useRouter()
const hoy = hoyISO()

const paciente = reactive({
  nombre: '',
  apellido: '',
  dni: '',
  email: '',
  fechaNacimiento: '',
  telefono: '',
  direccion: ''
})

const errores = reactive(erroresVacios())
const errorGeneral = ref('')
const guardando = ref(false)

const guardarPaciente = async () => {
  errorGeneral.value = ''
  if (!validarPaciente(paciente, errores)) return

  guardando.value = true
  try {
    await createPaciente({
      nombre: paciente.nombre.trim(),
      apellido: paciente.apellido.trim(),
      dni: paciente.dni.trim(),
      email: paciente.email.trim(),
      fechaNacimiento: paciente.fechaNacimiento,
      // los opcionales vacíos no se envían
      telefono: paciente.telefono.trim() || undefined,
      direccion: paciente.direccion.trim() || undefined
    })
    router.push('/pacientes')
  } catch (error) {
    console.error(error)
    errorGeneral.value = procesarErrorServidor(error, errores)
  } finally {
    guardando.value = false
  }
}
</script>