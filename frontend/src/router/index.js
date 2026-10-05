import { createRouter, createWebHistory } from 'vue-router'

import PacienteListView from '../views/PacienteListView.vue'
import PacienteCreateView from '../views/PacienteCreateView.vue'
import PacienteEditView from '../views/PacienteEditView.vue'
import PacienteDetailView from '../views/PacienteDetailView.vue'

const routes = [
  {
    path: '/',
    redirect: '/pacientes'
  },
  {
    path: '/pacientes',
    component: PacienteListView
  },
  {
    path: '/pacientes/create',
    component: PacienteCreateView
  },
  {
    path: '/pacientes/:id',
    component: PacienteDetailView
  },
  {
    path: '/pacientes/edit/:id',
    component: PacienteEditView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router