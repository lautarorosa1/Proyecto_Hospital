<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
    <h1 class="mb-8 text-center text-3xl font-semibold text-indigo-700">Sistema de Información Hospitalaria</h1>

    <main class="w-full max-w-md">
      <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
        <div class="mb-6 text-center">
          <h2 class="text-xl font-semibold text-gray-900">Iniciar sesión</h2>
          <p class="mt-1 text-sm text-gray-500">Ingresá con tu cuenta institucional</p>
        </div>

        <p
          v-if="route.query.sesion === 'expirada'"
          class="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
        >
          Tu sesión expiró. Volvé a iniciar sesión para continuar.
        </p>

        <form class="flex flex-col gap-5" @submit.prevent="handleLogin">
          <div class="flex flex-col gap-1.5">
            <label for="login-email" class="text-sm font-medium text-gray-700">Email</label>
            <input
              id="login-email"
              v-model="email"
              type="email"
              required
              autocomplete="username"
              placeholder="usuario@hospital.com"
              class="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="login-password" class="text-sm font-medium text-gray-700">Contraseña</label>
            <div class="relative">
              <input
                id="login-password"
                v-model="password"
                :type="mostrarPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                placeholder="••••••••"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-20 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 px-3 text-xs font-medium text-gray-500 hover:text-indigo-600"
                @click="mostrarPassword = !mostrarPassword"
              >
                {{ mostrarPassword ? 'Ocultar' : 'Mostrar' }}
              </button>
            </div>
          </div>

          <p v-if="authStore.error" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {{ authStore.error }}
          </p>

          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
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
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const mostrarPassword = ref(false)

const destinoSeguro = (redirect) =>
  typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
    ? redirect
    : '/'

const handleLogin = async () => {
  try {
    await authStore.login(email.value.trim(), password.value)
    router.push(destinoSeguro(route.query.redirect))
  } catch {
    return
  }
}
</script>
