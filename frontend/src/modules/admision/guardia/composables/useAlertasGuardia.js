import { ref, unref, watch, onMounted, onBeforeUnmount } from 'vue'
import { urlAlertasStream } from '../services/guardiaService'

// Escucha por SSE las alertas que el backend emite hacia los monitores de guardia:
//   - `riesgo_vital`:   triaje Código Rojo en la guardia (Admisión).
//   - `signos_vitales`: temperatura > 39 °C en un paciente internado (Enfermería).
// profesionalId (valor o ref): si viene, las de riesgo vital llegan solo al médico indicado.
// onAlerta / onAlertaClinica: callbacks opcionales para refrescar datos cuando llega una alerta.
export function useAlertasGuardia(profesionalId, { onAlerta, onAlertaClinica } = {}) {
  const alertas = ref([])
  const alertasClinicas = ref([])
  const conectado = ref(false)
  let fuente = null

  const cerrar = () => {
    fuente?.close()
    fuente = null
    conectado.value = false
  }

  const abrir = () => {
    cerrar()
    fuente = new EventSource(urlAlertasStream(unref(profesionalId)))
    fuente.onopen = () => {
      conectado.value = true
    }
    // EventSource reintenta solo; mientras tanto el monitor muestra "reconectando"
    fuente.onerror = () => {
      conectado.value = false
    }
    fuente.addEventListener('riesgo_vital', (evento) => {
      const alerta = JSON.parse(evento.data)
      // si el stream reenvía una alerta ya vista, no se duplica
      if (!alertas.value.some((a) => a.ingresoId === alerta.ingresoId)) {
        alertas.value.unshift(alerta)
      }
      onAlerta?.(alerta)
    })
    fuente.addEventListener('signos_vitales', (evento) => {
      const alerta = JSON.parse(evento.data)
      if (!alertasClinicas.value.some((a) => a.signosVitalesId === alerta.signosVitalesId)) {
        alertasClinicas.value.unshift(alerta)
      }
      onAlertaClinica?.(alerta)
    })
  }

  const descartar = (ingresoId) => {
    alertas.value = alertas.value.filter((a) => a.ingresoId !== ingresoId)
  }

  const descartarClinica = (signosVitalesId) => {
    alertasClinicas.value = alertasClinicas.value.filter(
      (a) => a.signosVitalesId !== signosVitalesId
    )
  }

  onMounted(abrir)
  onBeforeUnmount(cerrar)
  watch(() => unref(profesionalId), abrir)

  return { alertas, alertasClinicas, conectado, descartar, descartarClinica }
}
