import { ref } from 'vue'
import { getUsuarios } from '@/services/iamAdminService'
import { getProfesionales } from '../services/profesionalService'

// Usuarios del sistema que se pueden vincular a un profesional: activos y que
// todavía no pertenecen a otro profesional. `usuarioActualId` (opcional) es el
// usuario ya vinculado del profesional que se está editando, que debe seguir
// apareciendo en la lista.
export function useUsuariosDisponibles() {
  const usuarios = ref([])
  const errorUsuarios = ref('')

  const cargarUsuarios = async (usuarioActualId = null) => {
    errorUsuarios.value = ''
    try {
      const [resUsuarios, resProfesionales] = await Promise.all([
        getUsuarios(),
        getProfesionales()
      ])
      const ocupados = new Set(resProfesionales.data.map((p) => p.usuarioId).filter(Boolean))
      usuarios.value = resUsuarios.data.filter(
        (u) => u.activo !== false && (!ocupados.has(u.id) || u.id === usuarioActualId)
      )
    } catch (error) {
      console.error('Error cargando usuarios:', error)
      usuarios.value = []
      errorUsuarios.value =
        'No se pudo cargar la lista de usuarios. Si el email coincide con el de un usuario, se vincula solo.'
    }
  }

  return { usuarios, errorUsuarios, cargarUsuarios }
}
