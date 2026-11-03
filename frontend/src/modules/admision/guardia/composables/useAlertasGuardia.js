import { ref, unref, watch, onMounted, onBeforeUnmount } from 'vue'
import { urlAlertasStream } from '../services/guardiaService'

// Escucha las alertas de Riesgo Vital que el backend emite por SSE.
// profesionalId (valor o ref): si viene, solo recibe las dirigidas a ese médico.
// onAlerta: callback opcional para refrescar datos cuando llega una alerta.
export function useAlertasGuardia(profesionalId, { onAlerta } = {}) {
  const alertas = ref([])
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
  }

  const descartar = (ingresoId) => {
    alertas.value = alertas.value.filter((a) => a.ingresoId !== ingresoId)
  }

  onMounted(abrir)
  onBeforeUnmount(cerrar)
  watch(() => unref(profesionalId), abrir)

  return { alertas, conectado, descartar }
}
