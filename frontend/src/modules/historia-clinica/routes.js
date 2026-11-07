
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
    path: '/historia-clinica/:id/evoluciones',
    name: 'historia-clinica-evoluciones',
    component: () => import('./views/EvolucionesMedicasView.vue')
  }
]

export default historiaClinicaRoutes

