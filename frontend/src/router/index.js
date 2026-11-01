import { createRouter, createWebHistory } from 'vue-router'

import admisionRoutes from '@/modules/admision/routes'
import historiaClinicaRoutes from '@/modules/historia-clinica/routes'

const routes = [
  {
    path: '/',
    component: () => import('@/shared/views/HomeView.vue')
  },
  ...admisionRoutes,
  ...historiaClinicaRoutes
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router