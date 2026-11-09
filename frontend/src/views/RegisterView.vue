<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
      <div class="mb-6 text-center">
        <h1 class="text-2xl font-semibold text-gray-900">Registrar usuario</h1>
        <p class="mt-1 text-sm text-gray-500">Creá una cuenta y asigná uno o más roles del hospital</p>
      </div>

      <form class="flex flex-col gap-5" @submit.prevent="handleRegister">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-gray-700">Nombre</label>
            <input
              v-model="form.nombre"
              type="text"
              required
              class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-gray-700">Apellido</label>
            <input
              v-model="form.apellido"
              type="text"
              required
              class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="form.email"
            type="email"
            required
            placeholder="nombre@hospital.com"
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-700">Contraseña (mínimo 6 caracteres)</label>
          <input
            v-model="form.password"
            type="password"
            required
            minlength="6"
            placeholder="••••••••"
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-gray-700">Roles asignados</label>
          <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <label
              v-for="rol in rolesDisponibles"
              :key="rol"
              class="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition"
              :class="
                form.roles.includes(rol)
                  ? 'border-indigo-600 bg-indigo-50 font-medium text-indigo-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              "
            >
              <input
                v-model="form.roles"
                type="checkbox"
                :value="rol"
                class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>{{ rol }}</span>
            </label>
          </div>
          <small v-if="rolError" class="text-xs text-red-500">{{ rolError }}</small>
        </div>

        <p v-if="authStore.error" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {{ authStore.error }}
        </p>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="mt-1 w-full rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {{ authStore.loading ? 'Registrando...' : 'Crear cuenta' }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-gray-600">
        ¿Ya tenés cuenta?
        <router-link to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
          Iniciá sesión
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const rolesDisponibles = [
  'Administrador',
  'Médico',
  'Enfermero',
  'Recepcionista',
  'Paciente',
  'Administrativo',
  'Maestranza'
]

const form = reactive({
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  roles: ['Paciente']
})

const rolError = ref('')

const handleRegister = async () => {
  rolError.value = ''
  if (form.roles.length === 0) {
    rolError.value = 'Seleccioná al menos un rol'
    return
  }

  try {
    const data = await authStore.register({
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      email: form.email.trim(),
      password: form.password,
      roles: form.roles
    })

    if (data?.token) {
      router.push('/pacientes')
    } else {
      router.push('/login')
    }
  } catch {
    return
  }
}
</script>

