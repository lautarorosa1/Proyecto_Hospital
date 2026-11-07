import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

import admisionRoutes from '@/modules/admision/routes'
import historiaClinicaRoutes from '@/modules/historia-clinica/routes'
import recursosCamasRoutes from '@/modules/recursos-camas/routes'

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
  ...admisionRoutes,
  ...historiaClinicaRoutes,
  ...recursosCamasRoutes
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { path: '/login' }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { path: '/pacientes' }
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
