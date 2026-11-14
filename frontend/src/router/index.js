
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

import admisionRoutes from '@/modules/admision/routes'
import historiaClinicaRoutes from '@/modules/historia-clinica/routes'
import recursosCamasRoutes from '@/modules/recursos-camas/routes'
import atencionEnfermeriaRoutes from '@/modules/atencion-enfermeria/routes'

const routes = [
  {
    path: '/',
    component: () => import('@/shared/views/HomeView.vue')
  },
  {
    path: '/login',
    component: () => import('@/views/LoginView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/admin/usuarios',
    component: () => import('@/views/iam/UsuariosAdminView.vue'),
    meta: { requiresAuth: true, roles: ['Administrador'] }
  },
  {
    path: '/admin/roles',
    component: () => import('@/views/iam/RolesAdminView.vue'),
    meta: { requiresAuth: true, roles: ['Administrador'] }
  },

  // Rutas de los módulos
  ...admisionRoutes,
  ...historiaClinicaRoutes,
  ...recursosCamasRoutes,
  ...atencionEnfermeriaRoutes,

  // Siempre al final: captura cualquier ruta que no coincida con las anteriores
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/shared/views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.guestOnly) {
    return authStore.isAuthenticated ? { path: '/' } : true
  }

  if (!authStore.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (!authStore.puedeAcceder(to.path)) {
    return { path: '/', query: { forbidden: '1' } }
  }

  if (
    Array.isArray(to.meta.roles) &&
    to.meta.roles.length > 0 &&
    !authStore.hasRole(...to.meta.roles)
  ) {
    return { path: '/', query: { forbidden: '1' } }
  }

  return true
})

export default router
