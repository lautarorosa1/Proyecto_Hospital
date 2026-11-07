<template>
  <div class="min-h-screen bg-gray-50">
    <header class="border-b border-gray-200 bg-white shadow-xs">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <div class="flex flex-wrap items-center gap-6">
          <router-link to="/" class="text-lg font-bold text-indigo-600">
            Hospital IS
          </router-link>
          <nav class="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-600">
            <router-link to="/" class="transition hover:text-indigo-600">
              Inicio
            </router-link>
            <router-link to="/pacientes" class="transition hover:text-indigo-600">
              Pacientes
            </router-link>
            <router-link to="/admision" class="transition hover:text-indigo-600">
              Admisión
            </router-link>
            <router-link to="/recursos-camas" class="transition hover:text-indigo-600">
              Recursos y Camas
            </router-link>
            <router-link
              v-if="authStore.hasRole('Administrador')"
              to="/admin/usuarios"
              class="font-semibold text-indigo-600 transition hover:text-indigo-800"
            >
              Gestión de Usuarios
            </router-link>
            <router-link
              v-if="authStore.hasRole('Administrador')"
              to="/admin/roles"
              class="font-semibold text-indigo-600 transition hover:text-indigo-800"
            >
              Roles
            </router-link>
          </nav>
        </div>

        <div v-if="authStore.isAuthenticated" class="flex flex-wrap items-center gap-3">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-800">
              {{ authStore.usuario?.nombre }} {{ authStore.usuario?.apellido }}
            </span>
            <span
              v-for="rol in authStore.usuario?.roles"
              :key="rol"
              class="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200"
            >
              {{ rol }}
            </span>
          </div>
          <button
            type="button"
            class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
            @click="handleLogout"
          >
            Cerrar sesión
          </button>
        </div>

        <div v-else class="flex items-center gap-3">
          <router-link
            to="/login"
            class="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Iniciar sesión
          </router-link>
          <router-link
            to="/register"
            class="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white shadow-xs transition hover:bg-indigo-700"
          >
            Registrarse
          </router-link>
        </div>
      </div>
    </header>

    <div
      v-if="route.query.forbidden === '1'"
      class="mx-auto mt-4 max-w-4xl rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800"
    >
      No poseés los permisos o roles necesarios para acceder a la sección solicitada.
    </div>

    <router-view />
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
