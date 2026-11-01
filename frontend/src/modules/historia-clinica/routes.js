
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
  }
]

export default historiaClinicaRoutes