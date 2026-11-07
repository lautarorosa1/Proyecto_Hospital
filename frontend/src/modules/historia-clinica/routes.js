
const historiaClinicaRoutes = [
  {
    path: '/historia-clinica',
    name: 'historia-clinica',
    component: () => import('./views/HistoriaClinicaView.vue')
  },
  {
    path: '/historia-clinica/:id',
    name: 'historia-clinica-detalle',
    component: () => import('./views/HistoriaClinicaDetalleView.vue')
  },
  {
    path: '/historia-clinica/:id/alergias',
    name: 'historia-clinica-alergias',
    component: () => import('./views/AlergiasView.vue')
  },
  {
  path: '/historia-clinica/:id/estudios-medicos',
  name: 'EstudiosMedicos',
  component: () => import('./views/EstudiosMedicosView.vue')
  },
]

export default historiaClinicaRoutes
