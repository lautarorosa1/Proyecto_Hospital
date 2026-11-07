<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-5xl">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Administración de Roles</h1>
          <p class="mt-1 text-sm text-gray-500">
            Catálogo de roles del hospital y cantidad de usuarios asignados
          </p>
        </div>
        <div class="flex items-center gap-3">
          <router-link
            to="/admin/usuarios"
            class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-xs transition hover:bg-gray-50"
          >
            Gestión de Usuarios
          </router-link>
          <button
            type="button"
            class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-xs transition hover:bg-indigo-700"
            @click="abrirModalCrear"
          >
            Nuevo Rol
          </button>
        </div>
      </div>

      <p
        v-if="errorMsg"
        class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ errorMsg }}
      </p>

      <div class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <div v-if="loading" class="p-8 text-center text-sm text-gray-500">
          Cargando roles...
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead class="bg-gray-50 text-xs font-semibold uppercase text-gray-600">
              <tr>
                <th class="px-4 py-3">ID</th>
                <th class="px-4 py-3">Nombre del Rol</th>
                <th class="px-4 py-3">Descripción</th>
                <th class="px-4 py-3">Usuarios Asignados</th>
                <th class="px-4 py-3">Tipo</th>
                <th class="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-for="rol in roles" :key="rol.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-gray-500">#{{ rol.id }}</td>
                <td class="px-4 py-3 font-medium text-gray-900">{{ rol.nombre }}</td>
                <td class="px-4 py-3 text-gray-600">
                  {{ rol.descripcion || 'Rol operativo del sistema hospitalario' }}
                </td>
                <td class="px-4 py-3">
                  <span class="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                    {{ rol.cantidadUsuarios ?? 0 }} usuario(s)
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span
                    class="rounded-full px-2.5 py-0.5 text-xs font-medium"
                    :class="
                      rol.esEsencial
                        ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                        : 'bg-gray-100 text-gray-600'
                    "
                  >
                    {{ rol.esEsencial ? 'Esencial' : 'Personalizado' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="inline-flex gap-2">
                    <button
                      type="button"
                      class="rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                      @click="abrirModalEditar(rol)"
                    >
                      Editar
                    </button>
                    <button
                      v-if="!rol.esEsencial"
                      type="button"
                      class="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100"
                      @click="eliminarRol(rol)"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div
      v-if="mostrarModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-lg ring-1 ring-gray-200">
        <h2 class="mb-4 text-lg font-semibold text-gray-900">
          {{ rolEditando ? 'Editar rol' : 'Crear nuevo rol' }}
        </h2>
        <form class="flex flex-col gap-4" @submit.prevent="guardarRol">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700">Nombre del rol</label>
            <input
              v-model="form.nombre"
              type="text"
              required
              placeholder="Ej: Auditor Médico"
              class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700">Descripción</label>
            <input
              v-model="form.descripcion"
              type="text"
              placeholder="Descripción breve de responsabilidades"
              class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500"
            />
          </div>
          <div class="mt-2 flex justify-end gap-2">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              @click="mostrarModal = false"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="procesando"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import iamAdminService from '@/services/iamAdminService'

const roles = ref([])
const loading = ref(false)
const procesando = ref(false)
const errorMsg = ref('')

const mostrarModal = ref(false)
const rolEditando = ref(null)
const form = reactive({
  nombre: '',
  descripcion: ''
})

const cargarRoles = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await iamAdminService.getRoles()
    roles.value = data
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'Error al cargar los roles'
  } finally {
    loading.value = false
  }
}

const abrirModalCrear = () => {
  errorMsg.value = ''
  rolEditando.value = null
  form.nombre = ''
  form.descripcion = ''
  mostrarModal.value = true
}

const abrirModalEditar = (rol) => {
  errorMsg.value = ''
  rolEditando.value = rol
  form.nombre = rol.nombre
  form.descripcion = rol.descripcion || ''
  mostrarModal.value = true
}

const guardarRol = async () => {
  procesando.value = true
  errorMsg.value = ''
  try {
    if (rolEditando.value) {
      await iamAdminService.updateRol(rolEditando.value.id, {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim()
      })
    } else {
      await iamAdminService.createRol({
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim()
      })
    }
    mostrarModal.value = false
    await cargarRoles()
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'No se pudo guardar el rol'
  } finally {
    procesando.value = false
  }
}

const eliminarRol = async (rol) => {
  errorMsg.value = ''
  try {
    await iamAdminService.deleteRol(rol.id)
    await cargarRoles()
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'No se pudo eliminar el rol'
  }
}

onMounted(cargarRoles)
</script>

