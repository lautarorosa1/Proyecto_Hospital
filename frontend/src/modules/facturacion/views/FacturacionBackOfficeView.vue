<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <!-- Encabezado -->
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Facturación y Administración</h1>
        <p class="text-sm text-gray-600">
          Gestión de cuentas corrientes, cálculo de coberturas, nomenclador y emisión de comprobantes
        </p>
      </div>
      <div class="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-right">
        <span class="block text-xs font-medium text-indigo-700">Total Facturado Histórico</span>
        <span class="text-lg font-bold text-indigo-900">
          ${{ Number(store.totalFacturadoGeneral).toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}
        </span>
      </div>
    </div>

    <!-- Alertas -->
    <div
      v-if="store.error"
      class="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      {{ store.error }}
    </div>
    <div
      v-if="mensajeExito"
      class="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
    >
      {{ mensajeExito }}
    </div>

    <!-- Pestañas de navegación del módulo -->
    <div class="mb-6 flex flex-wrap gap-2 border-b border-gray-200 pb-3">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        @click="tabActiva = tab.id"
        :class="[
          'rounded-lg px-4 py-2 text-sm font-medium transition',
          tabActiva === tab.id
            ? 'bg-indigo-600 text-white shadow-xs'
            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- PESTAÑA 1: CUENTA CORRIENTE Y LIQUIDACIÓN -->
    <div v-if="tabActiva === 'cuenta'" class="space-y-6">
      <!-- Selector de paciente y botón de liquidación -->
      <div class="rounded-lg border border-gray-200 bg-white p-5 shadow-xs">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div class="flex flex-wrap items-end gap-3">
            <div>
              <label class="mb-1 block text-xs font-semibold text-gray-700">Filtrar por DNI o Apellido</label>
              <input
                v-model="filtroPaciente"
                type="text"
                placeholder="Ej: Sanchez o 34567827"
                class="w-48 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label class="mb-1 block text-xs font-semibold text-gray-700">Seleccionar Paciente</label>
              <select
                v-model.number="pacienteIdBusqueda"
                @change="alCambiarPaciente"
                class="w-72 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="" disabled>Elegir paciente...</option>
                <option v-for="pac in pacientesFiltrados" :key="pac.id" :value="pac.id">
                  {{ pac.apellido }}, {{ pac.nombre }} — DNI: {{ pac.dni }}
                </option>
              </select>
            </div>

            <div>
              <label class="mb-1 block text-xs font-semibold text-gray-700">
                Titular / Razón Social (Factura)
              </label>
              <input
                v-model="nombrePacienteLiquidar"
                type="text"
                placeholder="Nombre completo del titular"
                class="w-56 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="button"
            :disabled="!pacienteIdBusqueda || store.cargosPendientes.length === 0 || store.cargando"
            @click="ejecutarLiquidacion"
            class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Liquidar Cuenta y Emitir Facturas ({{ store.cargosPendientes.length }})
          </button>
        </div>

        <!-- Tarjetas de resumen de saldo -->
        <div v-if="store.cuentaActual" class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <span class="text-xs font-medium text-gray-500">Pendiente a Cargo del Paciente</span>
            <p class="mt-1 text-xl font-bold text-gray-900">
              ${{ Number(store.cuentaActual.totalAdeudadoPaciente).toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}
            </p>
          </div>
          <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <span class="text-xs font-medium text-gray-500">Pendiente a Liquidar a Terceros</span>
            <p class="mt-1 text-xl font-bold text-indigo-700">
              ${{ Number(store.cuentaActual.totalLiquidadoTerceros).toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}
            </p>
          </div>
          <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <span class="text-xs font-medium text-gray-500">Cargos Sin Facturar</span>
            <p class="mt-1 text-xl font-bold text-amber-600">
              {{ store.cargosPendientes.length }}
            </p>
          </div>
        </div>
      </div>

      <!-- Formulario de carga de consumo / prestación -->
      <div class="rounded-lg border border-gray-200 bg-white p-5 shadow-xs">
        <h2 class="mb-4 text-base font-semibold text-gray-900">
          Registrar Nuevo Cargo —
          <span v-if="pacienteSeleccionado" class="text-indigo-700">
            {{ pacienteSeleccionado.apellido }}, {{ pacienteSeleccionado.nombre }} (DNI {{ pacienteSeleccionado.dni }})
          </span>
          <span v-else class="text-gray-500">Seleccioná un paciente</span>
        </h2>
        <form @submit.prevent="guardarNuevoCargo" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label class="mb-1 block text-xs font-semibold text-gray-700">Prestación</label>
            <select
              v-model="nuevoCargo.codigoPrestacion"
              required
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="" disabled>Seleccionar...</option>
              <option v-for="item in store.nomenclador" :key="item.id" :value="item.codigo">
                {{ item.codigo }} - {{ item.descripcion }} (${{ item.precioBase }})
              </option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-xs font-semibold text-gray-700">Tipo Cobertura</label>
            <select
              v-model="nuevoCargo.tipoCobertura"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="PUBLICA">Pública (100% Estado)</option>
              <option value="PREPAGA">Prepaga / Obra Social</option>
              <option value="PARTICULAR">Particular (100% Paciente)</option>
            </select>
          </div>

          <div v-if="nuevoCargo.tipoCobertura === 'PREPAGA'">
            <label class="mb-1 block text-xs font-semibold text-gray-700">Prepaga / Obra Social</label>
            <input
              v-model="nuevoCargo.entidadNombre"
              type="text"
              placeholder="Ej: OSDE, Swiss Medical"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div v-if="nuevoCargo.tipoCobertura === 'PREPAGA'">
            <label class="mb-1 block text-xs font-semibold text-gray-700">Copago Fijo ($)</label>
            <input
              v-model.number="nuevoCargo.copagoFijo"
              type="number"
              min="0"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label class="mb-1 block text-xs font-semibold text-gray-700">ID Evento Origen (Opcional)</label>
            <input
              v-model="nuevoCargo.eventoOrigenId"
              type="text"
              placeholder="Ej: ENF-ADM-902"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div class="flex items-end">
            <button
              type="submit"
              :disabled="!pacienteIdBusqueda || store.cargando"
              class="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Agregar Cargo
            </button>
          </div>
        </form>
      </div>

      <!-- Tabla de cargos del paciente -->
      <div class="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-xs">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-600">
            <tr>
              <th class="px-4 py-3">Concepto</th>
              <th class="px-4 py-3">Cobertura</th>
              <th class="px-4 py-3">Cargo Paciente</th>
              <th class="px-4 py-3">Cargo Tercero</th>
              <th class="px-4 py-3">Ente</th>
              <th class="px-4 py-3">Trazabilidad</th>
              <th class="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="!store.cuentaActual || store.cuentaActual.cargos.length === 0">
              <td colspan="7" class="px-4 py-6 text-center text-gray-500">
                No hay cargos registrados para este paciente.
              </td>
            </tr>
            <tr v-for="cargo in store.cuentaActual?.cargos" :key="cargo.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-gray-900">{{ cargo.concepto }}</td>
              <td class="px-4 py-3 text-gray-600">{{ cargo.tipoCobertura }}</td>
              <td class="px-4 py-3 font-medium text-gray-900">${{ Number(cargo.cargoPaciente).toFixed(2) }}</td>
              <td class="px-4 py-3 font-medium text-indigo-700">${{ Number(cargo.cargoTercero).toFixed(2) }}</td>
              <td class="px-4 py-3 text-gray-600">{{ cargo.enteAFacturar || '-' }}</td>
              <td class="px-4 py-3 text-xs text-gray-500">{{ cargo.eventoOrigenId || 'Carga manual' }}</td>
              <td class="px-4 py-3">
                <span
                  :class="[
                    'rounded-full px-2.5 py-0.5 text-xs font-medium',
                    cargo.estado === 'PENDIENTE'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  ]"
                >
                  {{ cargo.estado }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

<!-- PESTAÑA 2: SIMULADOR DE COBERTURAS -->
    <div v-if="tabActiva === 'simulador'" class="rounded-lg border border-gray-200 bg-white p-6 shadow-xs">
      <h2 class="mb-4 text-base font-semibold text-gray-900">Simulador de Coberturas y Copagos</h2>
      <form @submit.prevent="ejecutarSimulacion" class="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div>
          <label class="mb-1 block text-xs font-semibold text-gray-700">Tipo de Cobertura</label>
          <select
            v-model="simForm.tipoCobertura"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          >
            <option value="PUBLICA">Pública</option>
            <option value="PREPAGA">Prepaga</option>
            <option value="PARTICULAR">Particular</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold text-gray-700">Valor Base Prestación ($)</label>
          <input
            v-model.number="simForm.valorBase"
            type="number"
            min="1"
            required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div v-if="simForm.tipoCobertura === 'PREPAGA'">
          <label class="mb-1 block text-xs font-semibold text-gray-700">Copago Fijo ($)</label>
          <input
            v-model.number="simForm.copagoFijo"
            type="number"
            min="0"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div v-if="simForm.tipoCobertura === 'PREPAGA'">
          <label class="mb-1 block text-xs font-semibold text-gray-700">Entidad</label>
          <input
            v-model="simForm.entidadNombre"
            type="text"
            placeholder="Ej: OSDE"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div class="flex items-end gap-2">
          <button
            type="submit"
            class="w-full whitespace-nowrap rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            Calcular Distribución
          </button>
          <button
            v-if="store.simulacionActual"
            type="button"
            @click="limpiarSimulacion"
            class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Limpiar
          </button>
        </div>
      </form>

      <div
        v-if="store.simulacionActual"
        class="mt-6 rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-950"
      >
        <p class="font-semibold">{{ store.simulacionActual.descripcionDetalle }}</p>
        <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <span class="text-xs text-indigo-700">Abona el Paciente:</span>
            <p class="text-lg font-bold">${{ Number(store.simulacionActual.cargoPaciente).toFixed(2) }}</p>
          </div>
          <div>
            <span class="text-xs text-indigo-700">Se Factura a Tercero:</span>
            <p class="text-lg font-bold">${{ Number(store.simulacionActual.cargoTercero).toFixed(2) }}</p>
          </div>
          <div>
            <span class="text-xs text-indigo-700">Ente Destinatario:</span>
            <p class="text-lg font-bold">{{ store.simulacionActual.enteAFacturar }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- PESTAÑA 3: NOMENCLADOR DE PRESTACIONES -->
    <div v-if="tabActiva === 'nomenclador'" class="space-y-6">
      <div class="rounded-lg border border-gray-200 bg-white p-5 shadow-xs">
        <h2 class="mb-4 text-base font-semibold text-gray-900">Alta de Nueva Prestación en Nomenclador</h2>
        <form @submit.prevent="crearNuevaPrestacion" class="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label class="mb-1 block text-xs font-semibold text-gray-700">Código</label>
            <input
              v-model="nuevaPrestacion.codigo"
              type="text"
              required
              placeholder="Ej: EST-ECO-01"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div class="sm:col-span-2">
            <label class="mb-1 block text-xs font-semibold text-gray-700">Descripción</label>
            <input
              v-model="nuevaPrestacion.descripcion"
              type="text"
              required
              placeholder="Ej: Ecografía Abdominal"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-gray-700">Precio Base ($)</label>
            <div class="flex gap-2">
              <input
                v-model.number="nuevaPrestacion.precioBase"
                type="number"
                min="1"
                required
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </form>
      </div>

      <div class="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-xs">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-600">
            <tr>
              <th class="px-4 py-3">Código</th>
              <th class="px-4 py-3">Descripción</th>
              <th class="px-4 py-3">Arancel Base</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="item in store.nomenclador" :key="item.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-mono text-xs font-semibold text-indigo-700">{{ item.codigo }}</td>
              <td class="px-4 py-3 text-gray-900">{{ item.descripcion }}</td>
              <td class="px-4 py-3 font-semibold text-gray-900">${{ Number(item.precioBase).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- PESTAÑA 4: COMPROBANTES EMITIDOS -->
    <div v-if="tabActiva === 'facturas'" class="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-xs">
      <table class="min-w-full divide-y divide-gray-200 text-sm">
        <thead class="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-600">
          <tr>
            <th class="px-4 py-3">Comprobante</th>
            <th class="px-4 py-3">Tipo</th>
            <th class="px-4 py-3">Paciente</th>
            <th class="px-4 py-3">Destinatario</th>
            <th class="px-4 py-3">Monto Total</th>
            <th class="px-4 py-3">Estado</th>
            <th class="px-4 py-3">Fecha Emisión</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="store.facturas.length === 0">
            <td colspan="7" class="px-4 py-6 text-center text-gray-500">
              Aún no se han emitido comprobantes.
            </td>
          </tr>
          <tr v-for="fac in store.facturas" :key="fac.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 font-mono text-xs font-bold text-gray-900">{{ fac.numeroComprobante }}</td>
            <td class="px-4 py-3">
              <span
                :class="[
                  'rounded-full px-2.5 py-0.5 text-xs font-medium',
                  fac.tipoLiquidacion === 'PACIENTE'
                    ? 'bg-sky-100 text-sky-800'
                    : 'bg-purple-100 text-purple-800'
                ]"
              >
                {{ fac.tipoLiquidacion }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-700">{{ obtenerEtiquetaPaciente(fac.pacienteId) }}</td>
            <td class="px-4 py-3 font-medium text-gray-900">{{ fac.destinatario }}</td>
            <td class="px-4 py-3 font-bold text-gray-900">${{ Number(fac.montoTotal).toFixed(2) }}</td>
            <td class="px-4 py-3">
              <span class="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                {{ fac.estado }}
              </span>
            </td>
            <td class="px-4 py-3 text-xs text-gray-500">
              {{ new Date(fac.fechaEmision).toLocaleString('es-AR') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useFacturacionStore } from '../stores/useFacturacionStore';

const store = useFacturacionStore();

const tabs = [
  { id: 'cuenta', label: 'Cuenta Corriente y Liquidación' },
  { id: 'simulador', label: 'Simulador de Coberturas' },
  { id: 'nomenclador', label: 'Nomenclador' },
  { id: 'facturas', label: 'Comprobantes Emitidos' },
];

const tabActiva = ref('cuenta');
const mensajeExito = ref('');

const filtroPaciente = ref('');
const pacienteIdBusqueda = ref('');
const nombrePacienteLiquidar = ref('');

const pacientesFiltrados = computed(() => {
  const activos = store.pacientes.filter((p) => p.activo !== false);
  const termino = filtroPaciente.value.trim().toLowerCase();
  if (!termino) return activos;
  return activos.filter(
    (p) =>
      String(p.dni).toLowerCase().includes(termino) ||
      p.apellido.toLowerCase().includes(termino) ||
      p.nombre.toLowerCase().includes(termino)
  );
});

watch(pacientesFiltrados, async (lista) => {
  if (filtroPaciente.value.trim() && lista.length === 1 && pacienteIdBusqueda.value !== lista[0].id) {
    pacienteIdBusqueda.value = lista[0].id;
    await alCambiarPaciente();
  }
});

const pacienteSeleccionado = computed(() =>
  store.pacientes.find((p) => p.id === pacienteIdBusqueda.value) || null
);

function obtenerEtiquetaPaciente(id) {
  const pac = store.pacientes.find((p) => p.id === id);
  return pac ? `${pac.apellido}, ${pac.nombre}` : `Paciente #${id}`;
}

const nuevoCargo = ref({
  codigoPrestacion: '',
  tipoCobertura: 'PREPAGA',
  copagoFijo: 1500,
  entidadNombre: 'OSDE',
  eventoOrigenId: '',
});

const simForm = ref({
  tipoCobertura: 'PREPAGA',
  valorBase: 15000,
  copagoFijo: 3500,
  entidadNombre: 'OSDE',
});

const nuevaPrestacion = ref({
  codigo: '',
  descripcion: '',
  precioBase: 10000,
});

function mostrarExito(texto) {
  mensajeExito.value = texto;
  setTimeout(() => {
    mensajeExito.value = '';
  }, 4000);
}

async function alCambiarPaciente() {
  if (!pacienteIdBusqueda.value) return;
  const pac = pacienteSeleccionado.value;
  if (pac) {
    nombrePacienteLiquidar.value = `${pac.nombre} ${pac.apellido}`;
  }
  await store.consultarCuentaPaciente(pacienteIdBusqueda.value);
}

async function guardarNuevoCargo() {
  try {
    await store.registrarCargo({
      pacienteId: pacienteIdBusqueda.value,
      codigoPrestacion: nuevoCargo.value.codigoPrestacion,
      tipoCobertura: nuevoCargo.value.tipoCobertura,
      copagoFijo: nuevoCargo.value.tipoCobertura === 'PREPAGA' ? nuevoCargo.value.copagoFijo : undefined,
      entidadNombre: nuevoCargo.value.tipoCobertura === 'PREPAGA' ? nuevoCargo.value.entidadNombre : undefined,
      eventoOrigenId: nuevoCargo.value.eventoOrigenId || undefined,
    });
    nuevoCargo.value.eventoOrigenId = '';
    mostrarExito('Cargo registrado correctamente en la cuenta del paciente.');
  } catch {
    // El error ya queda reflejado en store.error
  }
}

async function ejecutarLiquidacion() {
  try {
    const emitidas = await store.liquidarCuentaPaciente(
      pacienteIdBusqueda.value,
      nombrePacienteLiquidar.value
    );
    mostrarExito(`Se emitieron ${emitidas.length} comprobante(s) correctamente.`);
  } catch {
    // El error ya queda reflejado en store.error
  }
}

async function ejecutarSimulacion() {
  try {
    await store.simularCalculo(
      simForm.value.tipoCobertura,
      simForm.value.valorBase,
      simForm.value.tipoCobertura === 'PREPAGA' ? simForm.value.copagoFijo : undefined,
      simForm.value.tipoCobertura === 'PREPAGA' ? simForm.value.entidadNombre : undefined
    );
  } catch {
    // El error ya queda reflejado en store.error
  }
}

function limpiarSimulacion() {
  store.simulacionActual = null;
}

async function crearNuevaPrestacion() {
  try {
    await store.agregarPrestacion(
      nuevaPrestacion.value.codigo,
      nuevaPrestacion.value.descripcion,
      nuevaPrestacion.value.precioBase
    );
    nuevaPrestacion.value = { codigo: '', descripcion: '', precioBase: 10000 };
    mostrarExito('Prestación agregada al nomenclador.');
  } catch {
    // El error ya queda reflejado en store.error
  }
}

onMounted(async () => {
  await Promise.all([
    store.cargarPacientes(),
    store.cargarNomenclador(),
    store.cargarFacturas(),
  ]);

  if (pacientesFiltrados.value.length > 0) {
    pacienteIdBusqueda.value = pacientesFiltrados.value[0].id;
    await alCambiarPaciente();
  }
});
</script>