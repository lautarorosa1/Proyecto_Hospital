export default [
  {
    path: '/recursos-camas',
    component: () => import('./RecursosCamasMenuView.vue')
  },
  {
    path: '/habitaciones',
    component: () => import('./habitaciones/views/HabitacionListView.vue')
  },
  {
    path: '/habitaciones/create',
    component: () => import('./habitaciones/views/HabitacionCreateView.vue')
  },
  {
    path: '/habitaciones/edit/:id',
    component: () => import('./habitaciones/views/HabitacionEditView.vue')
  },
  {
    path: '/insumos',
    component: () => import('./insumos/views/InsumoListView.vue')
  },
  {
    path: '/insumos/create',
    component: () => import('./insumos/views/InsumoCreateView.vue')
  },
  {
    path: '/insumos/:id/ingresos',
    component: () => import('./insumos/views/InsumoIngresoView.vue')
  },
  {
    path: '/camas',
    component: () => import('./camas/views/CamaMapaView.vue')
  },
  {
    path: '/camas/create',
    component: () => import('./camas/views/CamaCreateView.vue')
  },
  {
    path: '/camas/:id',
    component: () => import('./camas/views/CamaDetalleView.vue')
  }
]