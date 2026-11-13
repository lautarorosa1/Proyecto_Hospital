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
          {{ editandoCargoId ? `Editando Cargo #${editandoCargoId}` : 'Registrar Nuevo Cargo' }} —
          <span v-if="pacienteSeleccionado" class="text-indigo-700">
            {{ pacienteSeleccionado.apellido }}, {{ pacienteSeleccionado.nombre }} (DNI {{ pacienteSeleccionado.dni }})
          </span>
          <span v-else class="text-gray-500">Seleccioná un paciente</span>
        </h2>
        <form @submit.prevent="guardarCargo" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label class="mb-1 block text-xs font-semibold text-gray-700">Prestación</label>
            <select
              v-model="nuevoCargo.codigoPrestacion"
              required
              :disabled="editandoCargoId !== null"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none disabled:bg-gray-100"
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

          <div v-if="!editandoCargoId">
            <label class="mb-1 block text-xs font-semibold text-gray-700">ID Evento Origen (Opcional)</label>
            <input
              v-model="nuevoCargo.eventoOrigenId"
              type="text"
              placeholder="Ej: ENF-ADM-902"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div class="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
            <button
              v-if="editandoCargoId"
              type="button"
              @click="cancelarEdicionCargo"
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="!pacienteIdBusqueda || store.cargando"
              :class="[
                'w-full rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50',
                editandoCargoId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
              ]"
            >
              {{ editandoCargoId ? 'Actualizar' : 'Agregar Cargo' }}
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
              <th class="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="!store.cuentaActual || store.cuentaActual.cargos.length === 0">
              <td colspan="8" class="px-4 py-6 text-center text-gray-500">
                No hay cargos registrados para este paciente.
              </td>
            </tr>
            <tr
              v-for="cargo in store.cuentaActual?.cargos"
              :key="cargo.id"
              :class="[
                'hover:bg-gray-50 transition',
                editandoCargoId === cargo.id ? 'bg-amber-50/60' : ''
              ]"
            >
              <td class="px-4 py-3 font-medium text-gray-900">{{ cargo.concepto }}</td>
              <td class="px-4 py-3 text-gray-600">{{ cargo.tipoCobertura }}</td>
              <td class="px-4 py-3 font-medium text-gray-900">${{ Number(cargo.cargoPaciente).toFixed(2) }}</td>
              <td class="px-4 py-3 font-medium text-indigo-700">${{ Number(cargo.cargoTercero).toFixed(2) }}</td>
              <td class="px-4 py-3 text-gray-600">{{ cargo.enteAFacturar || '-' }}</td>
              <td class="px-4 py-3 text-xs text-gray-500">{{ cargo.eventoOrigenId || 'Carga manual' }}</td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span
                  :class="[
                    'inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium',
                    cargo.estado === 'PENDIENTE'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  ]"
                >
                  {{ cargo.estado }}
                </span>
              </td>
              <td class="px-4 py-3 text-right whitespace-nowrap">
                <div class="flex items-center justify-end gap-2 flex-nowrap">
                  <button
                    type="button"
                    @click="verDetalleCargo(cargo)"
                    class="shrink-0 whitespace-nowrap rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100"
                  >
                    Ver detalle
                  </button>
                  <button
                    v-if="cargo.estado === 'PENDIENTE'"
                    type="button"
                    @click="iniciarEdicionCargo(cargo)"
                    class="shrink-0 whitespace-nowrap rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 transition hover:bg-amber-100"
                  >
                    Editar
                  </button>
                  <button
                    v-if="cargo.estado === 'PENDIENTE'"
                    type="button"
                    @click="confirmarEliminarCargo(cargo)"
                    class="shrink-0 whitespace-nowrap rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100"
                  >
                    Eliminar
                  </button>
                </div>
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
      <div
        :class="[
          'rounded-lg border p-5 shadow-xs transition',
          editandoPrestacionId ? 'border-amber-300 bg-amber-50/40' : 'border-gray-200 bg-white'
        ]"
      >
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-base font-semibold text-gray-900">
            {{ editandoPrestacionId ? `Editando Prestación #${editandoPrestacionId}` : 'Alta de Nueva Prestación en Nomenclador' }}
          </h2>
          <span
            v-if="editandoPrestacionId"
            class="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-medium text-amber-800"
          >
            Modo Edición
          </span>
        </div>

        <form @submit.prevent="guardarPrestacion" class="space-y-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label class="mb-1 block text-xs font-semibold text-gray-700">Código</label>
              <input
                v-model="nuevaPrestacion.codigo"
                type="text"
                required
                placeholder="Ej: EST-ECO-01"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm uppercase focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-semibold text-gray-700">Descripción</label>
              <input
                v-model="nuevaPrestacion.descripcion"
                type="text"
                required
                placeholder="Ej: Ecografía Abdominal"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-semibold text-gray-700">Precio Base ($)</label>
              <input
                v-model.number="nuevaPrestacion.precioBase"
                type="number"
                min="1"
                required
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button
              v-if="editandoPrestacionId"
              type="button"
              @click="cancelarEdicionPrestacion"
              class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="store.cargando"
              :class="[
                'rounded-lg px-5 py-2 text-sm font-medium text-white transition disabled:opacity-50',
                editandoPrestacionId
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              ]"
            >
              {{ editandoPrestacionId ? 'Actualizar Prestación' : 'Guardar Prestación' }}
            </button>
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
              <th class="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="store.nomenclador.length === 0">
              <td colspan="4" class="px-4 py-6 text-center text-gray-500">
                No hay prestaciones cargadas en el nomenclador.
              </td>
            </tr>
            <tr
              v-for="item in store.nomenclador"
              :key="item.id"
              :class="[
                'hover:bg-gray-50 transition',
                editandoPrestacionId === item.id ? 'bg-amber-50/60' : ''
              ]"
            >
              <td class="px-4 py-3 font-mono text-xs font-semibold text-indigo-700">{{ item.codigo }}</td>
              <td class="px-4 py-3 text-gray-900">{{ item.descripcion }}</td>
              <td class="px-4 py-3 font-semibold text-gray-900">
                ${{ Number(item.precioBase).toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}
              </td>
              <td class="px-4 py-3 text-right whitespace-nowrap">
                <div class="flex items-center justify-end gap-2 flex-nowrap">
                  <button
                    type="button"
                    @click="verDetallePrestacion(item)"
                    class="shrink-0 whitespace-nowrap rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100"
                  >
                    Ver detalle
                  </button>
                  <button
                    type="button"
                    @click="iniciarEdicionPrestacion(item)"
                    class="shrink-0 whitespace-nowrap rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 transition hover:bg-amber-100"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    @click="confirmarEliminarPrestacion(item)"
                    class="shrink-0 whitespace-nowrap rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal de Detalle de Prestación -->
      <div
        v-if="prestacionDetalle"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="prestacionDetalle = null"
      >
        <div class="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
          <div class="flex items-start justify-between border-b border-gray-200 pb-3">
            <div>
              <span class="rounded-md bg-indigo-100 px-2 py-0.5 font-mono text-xs font-bold text-indigo-800">
                {{ prestacionDetalle.codigo }}
              </span>
              <h3 class="mt-1 text-lg font-bold text-gray-900">{{ prestacionDetalle.descripcion }}</h3>
            </div>
            <button
              type="button"
              @click="prestacionDetalle = null"
              class="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div class="mt-4 space-y-4 text-sm">
            <div class="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3">
              <div>
                <span class="block text-xs text-gray-500">ID Interno</span>
                <span class="font-semibold text-gray-900">#{{ prestacionDetalle.id }}</span>
              </div>
              <div>
                <span class="block text-xs text-gray-500">Estado en Nomenclador</span>
                <span class="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                  {{ prestacionDetalle.activo ? 'Activa' : 'Inactiva' }}
                </span>
              </div>
              <div class="col-span-2">
                <span class="block text-xs text-gray-500">Arancel Base Oficial</span>
                <span class="text-xl font-bold text-indigo-700">
                  ${{ Number(prestacionDetalle.precioBase).toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}
                </span>
              </div>
            </div>
            <div>
              <h4 class="mb-2 text-xs font-semibold uppercase text-gray-500">
                Referencia de Cobertura sobre Arancel Base
              </h4>
              <div class="space-y-2 rounded-lg border border-gray-200 p-3 text-xs">
                <div class="flex justify-between">
                  <span class="font-medium text-gray-700">Salud Pública (100% Estado):</span>
                  <span class="font-semibold text-gray-900">
                    Paciente $0,00 / Ministerio ${{ Number(prestacionDetalle.precioBase).toFixed(2) }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium text-gray-700">Prepaga / Obra Social (80% base + copago):</span>
                  <span class="font-semibold text-gray-900">
                    Cobertura base ${{ (Number(prestacionDetalle.precioBase) * 0.8).toFixed(2) }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium text-gray-700">Particular (100% Paciente):</span>
                  <span class="font-semibold text-gray-900">
                    Paciente ${{ Number(prestacionDetalle.precioBase).toFixed(2) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-2">
            <button
              type="button"
              @click="iniciarEdicionPrestacion(prestacionDetalle); prestacionDetalle = null"
              class="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
            >
              Editar Prestación
            </button>
            <button
              type="button"
              @click="prestacionDetalle = null"
              class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Cerrar
            </button>
          </div>
        </div>
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

    <!-- Modal de Detalle de Cargo -->
    <div
      v-if="cargoDetalleModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="cargoDetalleModal = null"
    >
      <div class="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
        <div class="flex items-start justify-between border-b border-gray-200 pb-3">
          <div>
            <span class="rounded-md bg-indigo-100 px-2 py-0.5 font-mono text-xs font-bold text-indigo-800">
              Cargo #{{ cargoDetalleModal.id }}
            </span>
            <h3 class="mt-1 text-lg font-bold text-gray-900">{{ cargoDetalleModal.concepto }}</h3>
          </div>
          <button
            type="button"
            @click="cargoDetalleModal = null"
            class="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div class="mt-4 space-y-4 text-sm">
          <div class="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3">
            <div>
              <span class="block text-xs text-gray-500">Tipo de Cobertura</span>
              <span class="font-semibold text-gray-900">{{ cargoDetalleModal.tipoCobertura }}</span>
            </div>
            <div>
              <span class="block text-xs text-gray-500">Estado</span>
              <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" :class="cargoDetalleModal.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'">
                {{ cargoDetalleModal.estado }}
              </span>
            </div>
            <div>
              <span class="block text-xs text-gray-500">Cargo Paciente</span>
              <span class="text-base font-bold text-gray-900">${{ Number(cargoDetalleModal.cargoPaciente).toFixed(2) }}</span>
            </div>
            <div>
              <span class="block text-xs text-gray-500">Cargo Tercero</span>
              <span class="text-base font-bold text-indigo-700">${{ Number(cargoDetalleModal.cargoTercero).toFixed(2) }}</span>
            </div>
            <div class="col-span-2">
              <span class="block text-xs text-gray-500">Ente Destinatario / Trazabilidad</span>
              <span class="font-medium text-gray-900">{{ cargoDetalleModal.enteAFacturar || 'Ninguno' }} ({{ cargoDetalleModal.eventoOrigenId || 'Carga manual' }})</span>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <button
            v-if="cargoDetalleModal.estado === 'PENDIENTE'"
            type="button"
            @click="iniciarEdicionCargo(cargoDetalleModal); cargoDetalleModal = null"
            class="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
          >
            Editar Cargo
          </button>
          <button
            type="button"
            @click="cargoDetalleModal = null"
            class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useFacturacionStore } from '../stores/useFacturacionStore';
import Swal from 'sweetalert2';

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

const editandoPrestacionId = ref(null);
const prestacionDetalle = ref(null);

const editandoCargoId = ref(null);
const cargoDetalleModal = ref(null);

function mostrarExito(texto) {
  Swal.fire({
    icon: 'success',
    title: '¡Éxito!',
    text: texto,
    timer: 2500,
    showConfirmButton: false,
  });
}

function mostrarError(texto) {
  Swal.fire({
    icon: 'error',
    title: 'Atención',
    text: texto,
  });
}

async function alCambiarPaciente() {
  if (!pacienteIdBusqueda.value) return;
  const pac = pacienteSeleccionado.value;
  if (pac) {
    nombrePacienteLiquidar.value = `${pac.nombre} ${pac.apellido}`;
  }
  await store.consultarCuentaPaciente(pacienteIdBusqueda.value);
}

async function guardarCargo() {
  try {
    if (editandoCargoId.value) {
      await store.actualizarCargo(
        editandoCargoId.value,
        {
          tipoCobertura: nuevoCargo.value.tipoCobertura,
          copagoFijo: nuevoCargo.value.tipoCobertura === 'PREPAGA' ? nuevoCargo.value.copagoFijo : undefined,
          entidadNombre: nuevoCargo.value.tipoCobertura === 'PREPAGA' ? nuevoCargo.value.entidadNombre : undefined,
        },
        pacienteIdBusqueda.value
      );
      mostrarExito('Cargo actualizado correctamente.');
      cancelarEdicionCargo();
    } else {
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
    }
  } catch (err) {
    mostrarError(err.message || 'Ocurrió un error inesperado.');
  }
}

function iniciarEdicionCargo(cargo) {
  editandoCargoId.value = cargo.id;
  const prestacionMatch = store.nomenclador.find(n => n.descripcion === cargo.concepto);
  nuevoCargo.value = {
    codigoPrestacion: prestacionMatch ? prestacionMatch.codigo : '',
    tipoCobertura: cargo.tipoCobertura,
    copagoFijo: Number(cargo.cargoPaciente) || 0,
    entidadNombre: cargo.enteAFacturar !== 'Paciente (Sin cobertura)' && cargo.enteAFacturar !== 'Estado / Ente Regulador' ? cargo.enteAFacturar : 'OSDE',
    eventoOrigenId: cargo.eventoOrigenId || ''
  };
  tabActiva.value = 'cuenta';
}

function cancelarEdicionCargo() {
  editandoCargoId.value = null;
  nuevoCargo.value = {
    codigoPrestacion: '',
    tipoCobertura: 'PREPAGA',
    copagoFijo: 1500,
    entidadNombre: 'OSDE',
    eventoOrigenId: '',
  };
}

async function verDetalleCargo(cargo) {
  try {
    const detalle = await store.obtenerCargoDetalle(cargo.id);
    cargoDetalleModal.value = detalle;
  } catch (err) {
    mostrarError(err.message);
  }
}

async function confirmarEliminarCargo(cargo) {
  const resultado = await Swal.fire({
    title: '¿Estás seguro?',
    text: `Vas a eliminar el cargo "${cargo.concepto}"`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  });

  if (!resultado.isConfirmed) return;

  try {
    await store.eliminarCargo(cargo.id, pacienteIdBusqueda.value);
    if (editandoCargoId.value === cargo.id) {
      cancelarEdicionCargo();
    }
    mostrarExito('Cargo eliminado correctamente.');
  } catch (err) {
    mostrarError(err.message || 'No se pudo eliminar el cargo.');
  }
}

async function ejecutarLiquidacion() {
  try {
    const emitidas = await store.liquidarCuentaPaciente(
      pacienteIdBusqueda.value,
      nombrePacienteLiquidar.value
    );
    mostrarExito(`Se emitieron ${emitidas.length} comprobante(s) correctamente.`);
  } catch (err) {
    mostrarError(err.message || 'Ocurrió un error al liquidar.');
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
  } catch (err) {
    mostrarError(err.message);
  }
}

function limpiarSimulacion() {
  store.simulacionActual = null;
}

async function verDetallePrestacion(item) {
  try {
    const detalle = await store.obtenerPrestacionDetalle(item.id);
    prestacionDetalle.value = detalle;
  } catch (err) {
    mostrarError(err.message);
  }
}

function iniciarEdicionPrestacion(item) {
  editandoPrestacionId.value = item.id;
  nuevaPrestacion.value = {
    codigo: item.codigo,
    descripcion: item.descripcion,
    precioBase: Number(item.precioBase),
  };
}

function cancelarEdicionPrestacion() {
  editandoPrestacionId.value = null;
  nuevaPrestacion.value = { codigo: '', descripcion: '', precioBase: 10000 };
}

async function guardarPrestacion() {
  try {
    if (editandoPrestacionId.value) {
      await store.actualizarPrestacion(
        editandoPrestacionId.value,
        nuevaPrestacion.value.codigo,
        nuevaPrestacion.value.descripcion,
        nuevaPrestacion.value.precioBase
      );
      mostrarExito('Prestación actualizada correctamente.');
      cancelarEdicionPrestacion();
    } else {
      await store.agregarPrestacion(
        nuevaPrestacion.value.codigo,
        nuevaPrestacion.value.descripcion,
        nuevaPrestacion.value.precioBase
      );
      nuevaPrestacion.value = { codigo: '', descripcion: '', precioBase: 10000 };
      mostrarExito('Prestación agregada al nomenclador.');
    }
  } catch (err) {
    mostrarError(err.message || 'Ocurrió un error inesperado.');
  }
}

async function confirmarEliminarPrestacion(item) {
  const resultado = await Swal.fire({
    title: '¿Estás seguro?',
    text: `Vas a eliminar la prestación "${item.codigo} - ${item.descripcion}"`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  });

  if (!resultado.isConfirmed) return;

  try {
    await store.eliminarPrestacion(item.id);
    if (editandoPrestacionId.value === item.id) {
      cancelarEdicionPrestacion();
    }
    mostrarExito(`Prestación "${item.codigo}" eliminada del nomenclador.`);
  } catch (err) {
    mostrarError(err.message || 'No se pudo eliminar la prestación.');
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