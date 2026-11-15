
const atencionEnfermeriaRoutes = [
  // Menú principal de Atención de Enfermería
  {
    path: '/atencion-enfermeria',
    component: () =>
      import('./views/AtencionEnfermeriaView.vue')
  },

  // Gestión de internaciones
  {
    path: '/atencion-enfermeria/internaciones',
    component: () =>
      import('./views/InternacionesView.vue')
  },

  // Registro y consulta de signos vitales
  {
    path: '/atencion-enfermeria/signos-vitales',
    component: () =>
      import('./views/SignosVitalesView.vue')
  },

  // Registro y consulta de indicaciones
  {
    path: '/atencion-enfermeria/indicaciones',
    component: () =>
      import('./views/IndicacionesView.vue')
  },

  // Registro y consulta de medicaciones
  {
    path: '/atencion-enfermeria/medicaciones',
    component: () =>
      import('./views/MedicacionesView.vue')
  },

  // Registro y consulta de notas de enfermería
  {
    path: '/atencion-enfermeria/notas',
    component: () =>
      import('./views/NotasEnfermeriaView.vue')
  },

  // Registro y consulta de protocolos
  {
    path: '/atencion-enfermeria/protocolos',
    component: () =>
      import('./views/ProtocolosView.vue')
  }
]

export default atencionEnfermeriaRoutes