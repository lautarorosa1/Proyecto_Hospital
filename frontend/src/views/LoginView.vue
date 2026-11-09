<template>
  <div class="min-h-screen bg-gray-50 px-4 py-12">
    <div class="mx-auto max-w-md rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
      <div class="mb-6 text-center">
        <h1 class="text-2xl font-semibold text-gray-900">Iniciar sesión</h1>
        <p class="mt-1 text-sm text-gray-500">Acceso al Sistema de Información Hospitalaria</p>
      </div>

      <form class="flex flex-col gap-5" @submit.prevent="handleLogin">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="usuario@hospital.com"
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-700">Contraseña</label>
          <input
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <p v-if="authStore.error" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {{ authStore.error }}
        </p>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="mt-1 w-full rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {{ authStore.loading ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-gray-600">
        ¿No tenés cuenta?
        <router-link to="/register" class="font-medium text-indigo-600 hover:text-indigo-500">
          Registrate acá
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')

const handleLogin = async () => {
  try {
    await authStore.login(email.value.trim(), password.value)
    router.push('/pacientes')
  } catch {
    return
  }
}
</script>

