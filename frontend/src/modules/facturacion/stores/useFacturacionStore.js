import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const API_URL = 'http://localhost:3000/api/facturacion';
const PACIENTES_URL = 'http://localhost:3000/pacientes';

export const useFacturacionStore = defineStore('facturacion', () => {
  // Estado reactivo
  const pacientes = ref([]);
  const nomenclador = ref([]);
  const cuentaActual = ref(null);
  const facturas = ref([]);
  const simulacionActual = ref(null);
  const cargando = ref(false);
  const error = ref(null);

  // Propiedades computadas
  const cantidadPrestaciones = computed(() => nomenclador.value.length);

  const cargosPendientes = computed(() =>
    cuentaActual.value ? cuentaActual.value.cargos.filter((c) => c.estado === 'PENDIENTE') : []
  );

  const totalFacturadoGeneral = computed(() =>
    facturas.value.reduce((acc, f) => acc + Number(f.montoTotal), 0)
  );

  // Acciones contra la API
  async function cargarPacientes() {
    try {
      const resp = await fetch(PACIENTES_URL);
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Error al obtener la lista de pacientes.');
      pacientes.value = Array.isArray(data) ? data : (data.data || []);
    } catch (err) {
      error.value = err.message;
    }
  }

  async function cargarNomenclador() {
    cargando.value = true;
    error.value = null;
    try {
      const resp = await fetch(`${API_URL}/nomenclador`);
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Error al obtener el nomenclador.');
      nomenclador.value = data;
    } catch (err) {
      error.value = err.message;
    } finally {
      cargando.value = false;
    }
  }

  async function obtenerPrestacionDetalle(id) {
    cargando.value = true;
    error.value = null;
    try {
      const resp = await fetch(`${API_URL}/nomenclador/${id}`);
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Error al obtener el detalle de la prestación.');
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  async function agregarPrestacion(codigo, descripcion, precioBase) {
    cargando.value = true;
    error.value = null;
    try {
      const resp = await fetch(`${API_URL}/nomenclador`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo, descripcion, precioBase }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Error al registrar la prestación.');
      nomenclador.value.push(data);
      nomenclador.value.sort((a, b) => a.codigo.localeCompare(b.codigo));
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  async function actualizarPrestacion(id, codigo, descripcion, precioBase) {
    cargando.value = true;
    error.value = null;
    try {
      const resp = await fetch(`${API_URL}/nomenclador/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo, descripcion, precioBase }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Error al actualizar la prestación.');
      const index = nomenclador.value.findIndex((item) => item.id === id);
      if (index !== -1) {
        nomenclador.value[index] = data;
        nomenclador.value.sort((a, b) => a.codigo.localeCompare(b.codigo));
      }
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  async function eliminarPrestacion(id) {
    cargando.value = true;
    error.value = null;
    try {
      const resp = await fetch(`${API_URL}/nomenclador/${id}`, {
        method: 'DELETE',
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Error al eliminar la prestación.');
      nomenclador.value = nomenclador.value.filter((item) => item.id !== id);
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  async function simularCalculo(tipoCobertura, valorBase, copagoFijo, entidadNombre) {
    cargando.value = true;
    error.value = null;
    try {
      const resp = await fetch(`${API_URL}/calcular`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipoCobertura, valorBase, copagoFijo, entidadNombre }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Error al simular el cálculo.');
      simulacionActual.value = data;
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  async function registrarCargo(payload) {
    cargando.value = true;
    error.value = null;
    try {
      const resp = await fetch(`${API_URL}/cargos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Error al registrar el cargo.');
      await consultarCuentaPaciente(payload.pacienteId);
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  async function obtenerCargoDetalle(id) {
    cargando.value = true;
    error.value = null;
    try {
      const resp = await fetch(`${API_URL}/cargos/${id}`);
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Error al obtener el detalle del cargo.');
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  async function actualizarCargo(id, payload, pacienteId) {
    cargando.value = true;
    error.value = null;
    try {
      const resp = await fetch(`${API_URL}/cargos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Error al actualizar el cargo.');
      await consultarCuentaPaciente(pacienteId);
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  async function eliminarCargo(id, pacienteId) {
    cargando.value = true;
    error.value = null;
    try {
      const resp = await fetch(`${API_URL}/cargos/${id}`, {
        method: 'DELETE',
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Error al eliminar el cargo.');
      await consultarCuentaPaciente(pacienteId);
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  async function consultarCuentaPaciente(pacienteId) {
    cargando.value = true;
    error.value = null;
    try {
      const resp = await fetch(`${API_URL}/pacientes/${pacienteId}/cuenta`);
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Error al consultar la cuenta del paciente.');
      cuentaActual.value = data;
      return data;
    } catch (err) {
      error.value = err.message;
    } finally {
      cargando.value = false;
    }
  }

  async function liquidarCuentaPaciente(pacienteId, nombrePaciente) {
    cargando.value = true;
    error.value = null;
    try {
      const resp = await fetch(`${API_URL}/pacientes/${pacienteId}/liquidar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombrePaciente }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Error al liquidar la cuenta.');
      await consultarCuentaPaciente(pacienteId);
      await cargarFacturas();
      return data.facturas;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  async function cargarFacturas() {
    cargando.value = true;
    error.value = null;
    try {
      const resp = await fetch(`${API_URL}/facturas`);
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Error al cargar las facturas.');
      facturas.value = data;
    } catch (err) {
      error.value = err.message;
    } finally {
      cargando.value = false;
    }
  }

  return {
    pacientes,
    nomenclador,
    cuentaActual,
    facturas,
    simulacionActual,
    cargando,
    error,
    cantidadPrestaciones,
    cargosPendientes,
    totalFacturadoGeneral,
    cargarPacientes,
    cargarNomenclador,
    obtenerPrestacionDetalle,
    agregarPrestacion,
    actualizarPrestacion,
    eliminarPrestacion,
    simularCalculo,
    registrarCargo,
    obtenerCargoDetalle,
    actualizarCargo,
    eliminarCargo,
    consultarCuentaPaciente,
    liquidarCuentaPaciente,
    cargarFacturas,
  };
});