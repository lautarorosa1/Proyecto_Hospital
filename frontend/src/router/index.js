import { createRouter, createWebHistory } from 'vue-router'

import admisionRoutes from '@/modules/admision/routes'
// Cada módulo suma su archivo de rutas con una línea:
// import otroModuloRoutes from '@/modules/otro-modulo/routes'

const routes = [
  {
    path: '/',
    component: () => import('@/shared/views/HomeView.vue')
  },
  ...admisionRoutes
  // ...otroModuloRoutes
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
