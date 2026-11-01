// Rutas del módulo de Admisión. Cada módulo exporta su propio arreglo de rutas
// y el router principal (src/router/index.js) los junta.
//
// Para sumar una pantalla nueva de admisión (profesionales, turnos, etc.),
// agregá sus rutas acá. Las vistas se cargan de forma diferida (lazy).

export default [
  // Menú del módulo
  {
    path: '/admision',
    component: () => import('./views/AdmisionMenuView.vue')
  },

  // Pacientes
  {
    path: '/pacientes',
    component: () => import('./pacientes/views/PacienteListView.vue')
  },
  {
    path: '/pacientes/create',
    component: () => import('./pacientes/views/PacienteCreateView.vue')
  },
  {
    path: '/pacientes/:id',
    component: () => import('./pacientes/views/PacienteDetailView.vue')
  },
  {
    path: '/pacientes/edit/:id',
    component: () => import('./pacientes/views/PacienteEditView.vue')
  },

  // Profesionales
  {
    path: '/profesionales',
    component: () => import('./profesionales/views/ProfesionalListView.vue')
  },
  {
    path: '/profesionales/create',
    component: () => import('./profesionales/views/ProfesionalCreateView.vue')
  },
  {
    path: '/profesionales/:id',
    component: () => import('./profesionales/views/ProfesionalDetailView.vue')
  },
  {
    path: '/profesionales/edit/:id',
    component: () => import('./profesionales/views/ProfesionalEditView.vue')
  },
  {
    path: '/profesionales/:id/horarios',
    component: () => import('./profesionales/views/ProfesionalHorariosView.vue')
  },

  // Turnos
  {
    path: '/turnos',
    component: () => import('./turnos/views/TurnoAgendaView.vue')
  },
  {
    path: '/turnos/generar',
    component: () => import('./turnos/views/TurnoGenerarView.vue')
  }
]
