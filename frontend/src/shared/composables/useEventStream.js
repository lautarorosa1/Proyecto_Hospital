import { ref, unref, watch, onMounted, onBeforeUnmount } from 'vue'

// Escucha un canal Server-Sent Events del backend (monitores en tiempo real).
//   url:      string o ref con la URL del stream (si cambia, se reconecta)
//   handlers: { nombreEvento: (datos) => void }
// EventSource reintenta solo; `conectado` permite mostrar "reconectando…".
export function useEventStream(url, handlers = {}) {
  const conectado = ref(false)
  let fuente = null

  const cerrar = () => {
    fuente?.close()
    fuente = null
    conectado.value = false
  }

  const abrir = () => {
    cerrar()
    fuente = new EventSource(unref(url))
    fuente.onopen = () => {
      conectado.value = true
    }
    fuente.onerror = () => {
      conectado.value = false
    }
    for (const [evento, manejador] of Object.entries(handlers)) {
      fuente.addEventListener(evento, (e) => {
        try {
          manejador(JSON.parse(e.data))
        } catch (error) {
          console.error(`Evento "${evento}" inválido:`, error)
        }
      })
    }
  }

  onMounted(abrir)
  onBeforeUnmount(cerrar)
  watch(() => unref(url), abrir)

  return { conectado, cerrar }
}
