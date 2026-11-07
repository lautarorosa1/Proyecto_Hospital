<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-6xl">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Gestión de Usuarios</h1>
          <p class="mt-1 text-sm text-gray-500">
            Administrá los usuarios del hospital, sus estados y sus roles asignados
          </p>
        </div>
        <router-link
          to="/admin/roles"
          class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-xs transition hover:bg-gray-50"
        >
          Ver catálogo de Roles
        </router-link>
      </div>

      <p
        v-if="errorMsg"
        class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ errorMsg }}
      </p>

      <div class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <div v-if="loading" class="p-8 text-center text-sm text-gray-500">
          Cargando usuarios...
        </div>

        <div v-else-if="usuarios.length === 0" class="p-8 text-center text-sm text-gray-500">
          No hay usuarios registrados.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead class="bg-gray-50 text-xs font-semibold uppercase text-gray-600">
              <tr>
                <th class="px-4 py-3">Usuario</th>
                <th class="px-4 py-3">Email</th>
                <th class="px-4 py-3">Roles</th>
                <th class="px-4 py-3">Estado</th>
                <th class="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-for="u in usuarios" :key="u.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-900">
                  {{ u.nombre }} {{ u.apellido }}
                </td>
                <td class="px-4 py-3 text-gray-600">{{ u.email }}</td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-1.5">
                    <span
                      v-for="rol in u.roles"
                      :key="rol"
                      class="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200"
                    >
                      {{ rol }}
                    </span>
                    <span
                      v-if="!u.roles || u.roles.length === 0"
                      class="text-xs italic text-gray-400"
                    >
                      Sin roles
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                    :class="
                      u.activo !== false
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                        : 'bg-red-50 text-red-700 ring-1 ring-red-200'
                    "
                  >
                    {{ u.activo !== false ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="inline-flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      class="rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                      @click="abrirModalEditar(u)"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      class="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100"
                      @click="abrirModalRoles(u)"
                    >
                      Roles
                    </button>
                    <button
                      type="button"
                      class="rounded-lg px-2.5 py-1 text-xs font-medium transition"
                      :class="
                        u.activo !== false
                          ? 'border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                          : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      "
                      @click="cambiarEstado(u)"
                    >
                      {{ u.activo !== false ? 'Desactivar' : 'Activar' }}
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
      v-if="usuarioEditando"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-lg ring-1 ring-gray-200">
        <h2 class="mb-4 text-lg font-semibold text-gray-900">Editar usuario</h2>
        <form class="flex flex-col gap-4" @submit.prevent="guardarEdicion">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700">Nombre</label>
            <input
              v-model="formEditar.nombre"
              type="text"
              required
              class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700">Apellido</label>
            <input
              v-model="formEditar.apellido"
              type="text"
              required
              class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700">Email</label>
            <input
              v-model="formEditar.email"
              type="email"
              required
              class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500"
            />
          </div>
          <div class="mt-2 flex justify-end gap-2">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              @click="usuarioEditando = null"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="procesando"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>

    <div
      v-if="usuarioRolesModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div class="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg ring-1 ring-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">
          Roles de {{ usuarioRolesModal.nombre }} {{ usuarioRolesModal.apellido }}
        </h2>
        <p class="mt-1 text-xs text-gray-500">{{ usuarioRolesModal.email }}</p>

        <div class="mt-4">
          <h3 class="text-xs font-semibold uppercase text-gray-500">Roles actuales</h3>
          <div class="mt-2 flex flex-wrap gap-2">
            <span
              v-for="rol in obtenerRolesDetalleUsuario(usuarioRolesModal)"
              :key="rol.id"
              class="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200"
            >
              {{ rol.nombre }}
              <button
                type="button"
                class="ml-1 font-bold text-indigo-500 hover:text-red-600"
                :disabled="procesando"
                @click="quitarRolUsuario(rol.id)"
              >
                ×
              </button>
            </span>
            <span
              v-if="obtenerRolesDetalleUsuario(usuarioRolesModal).length === 0"
              class="text-xs italic text-gray-400"
            >
              Este usuario no tiene roles asignados.
            </span>
          </div>
        </div>

        <form class="mt-5 border-t border-gray-200 pt-4" @submit.prevent="asignarNuevoRol">
          <label class="block text-sm font-medium text-gray-700">Agregar rol</label>
          <div class="mt-2 flex gap-2">
            <select
              v-model="rolSeleccionadoId"
              class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500"
            >
              <option value="" disabled>Seleccioná un rol...</option>
              <option
                v-for="rol in rolesCatalogo"
                :key="rol.id"
                :value="rol.id"
              >
                {{ rol.nombre }}
              </option>
            </select>
            <button
              type="submit"
              :disabled="!rolSeleccionadoId || procesando"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              Asignar
            </button>
          </div>
        </form>

        <div class="mt-6 flex justify-end">
          <button
            type="button"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            @click="usuarioRolesModal = null"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import iamAdminService from '@/services/iamAdminService'

const usuarios = ref([])
const rolesCatalogo = ref([])
const loading = ref(false)
const procesando = ref(false)
const errorMsg = ref('')

const usuarioEditando = ref(null)
const formEditar = reactive({
  nombre: '',
  apellido: '',
  email: ''
})

const usuarioRolesModal = ref(null)
const rolSeleccionadoId = ref('')

const cargarDatos = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const [resUsuarios, resRoles] = await Promise.all([
      iamAdminService.getUsuarios(),
      iamAdminService.getRoles()
    ])
    usuarios.value = resUsuarios.data
    rolesCatalogo.value = resRoles.data
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'Error al cargar los datos de IAM'
  } finally {
    loading.value = false
  }
}

const obtenerRolesDetalleUsuario = (usuario) => {
  if (Array.isArray(usuario.rolesDetalle) && usuario.rolesDetalle.length > 0) {
    return usuario.rolesDetalle
  }
  return (usuario.roles || [])
    .map((nombre) => rolesCatalogo.value.find((r) => r.nombre === nombre))
    .filter(Boolean)
}

const abrirModalEditar = (u) => {
  errorMsg.value = ''
  usuarioEditando.value = u
  formEditar.nombre = u.nombre
  formEditar.apellido = u.apellido
  formEditar.email = u.email
}

const guardarEdicion = async () => {
  if (!usuarioEditando.value) return
  procesando.value = true
  errorMsg.value = ''
  try {
    const { data } = await iamAdminService.updateUsuario(usuarioEditando.value.id, {
      nombre: formEditar.nombre.trim(),
      apellido: formEditar.apellido.trim(),
      email: formEditar.email.trim()
    })
    const idx = usuarios.value.findIndex((u) => u.id === data.id)
    if (idx !== -1) usuarios.value[idx] = data
    usuarioEditando.value = null
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'No se pudo actualizar el usuario'
  } finally {
    procesando.value = false
  }
}

const cambiarEstado = async (u) => {
  errorMsg.value = ''
  try {
    const nuevoEstado = u.activo === false ? true : false
    const { data } = await iamAdminService.toggleEstadoUsuario(u.id, nuevoEstado)
    const idx = usuarios.value.findIndex((item) => item.id === data.id)
    if (idx !== -1) usuarios.value[idx] = data
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'No se pudo cambiar el estado del usuario'
  }
}

const abrirModalRoles = (u) => {
  errorMsg.value = ''
  usuarioRolesModal.value = u
  rolSeleccionadoId.value = ''
}

const asignarNuevoRol = async () => {
  if (!usuarioRolesModal.value || !rolSeleccionadoId.value) return
  procesando.value = true
  errorMsg.value = ''
  try {
    const { data } = await iamAdminService.assignRoles(usuarioRolesModal.value.id, {
      rolId: Number(rolSeleccionadoId.value)
    })
    const idx = usuarios.value.findIndex((u) => u.id === data.id)
    if (idx !== -1) usuarios.value[idx] = data
    usuarioRolesModal.value = data
    rolSeleccionadoId.value = ''
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'No se pudo asignar el rol'
  } finally {
    procesando.value = false
  }
}

const quitarRolUsuario = async (rolId) => {
  if (!usuarioRolesModal.value) return
  procesando.value = true
  errorMsg.value = ''
  try {
    const { data } = await iamAdminService.removeRol(usuarioRolesModal.value.id, rolId)
    const idx = usuarios.value.findIndex((u) => u.id === data.id)
    if (idx !== -1) usuarios.value[idx] = data
    usuarioRolesModal.value = data
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'No se pudo quitar el rol'
  } finally {
    procesando.value = false
  }
}

onMounted(cargarDatos)
</script>

