
<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-3xl">
      <h1 class="mb-2 text-center text-3xl font-semibold text-gray-900">
        Menú principal
      </h1>

      <p class="mb-8 text-center text-sm text-gray-500">
        Sistema de Gestión Hospitalaria
      </p>

      <div class="grid gap-4 sm:grid-cols-2">
        <!-- MÓDULOS GENERALES -->
        <router-link
          v-for="modulo in modulos"
          :key="modulo.ruta"
          :to="modulo.ruta"
          class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:ring-indigo-300 hover:shadow-md"
        >
          <h2 class="text-lg font-semibold text-gray-900">
            {{ modulo.titulo }}
          </h2>

          <p class="mt-1 text-sm text-gray-500">
            {{ modulo.descripcion }}
          </p>

          <span class="mt-4 inline-block text-sm font-medium text-indigo-600">
            Ingresar →
          </span>
        </router-link>

        <!-- MÓDULO: ATENCIÓN DE ENFERMERÍA -->
        <router-link
          to="/atencion-enfermeria"
          class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-teal-200 transition hover:-translate-y-1 hover:shadow-md hover:ring-teal-500"
        >
          <div
            class="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 5v14m-7-7h14"
              />
            </svg>
          </div>

          <h2 class="text-lg font-semibold text-gray-900">
            Atención de Enfermería
          </h2>

          <p class="mt-1 text-sm text-gray-500">
            Internaciones, signos vitales, indicaciones, medicaciones,
            protocolos y notas de enfermería.
          </p>

          <span class="mt-4 inline-block text-sm font-medium text-teal-700">
            Ingresar al módulo →
          </span>
        </router-link>
        <!-- FIN DEL MÓDULO -->
      </div>
    </div>
  </div>
</template>

<script setup>
// Cada módulo del sistema suma una entrada acá.
const modulos = [
  {
    titulo: 'Admisión',
    descripcion: 'Pacientes, profesionales y turnos',
    ruta: '/admision'
  },
  {
    titulo: 'Recursos y camas',
    descripcion: 'Habitaciones, camas e insumos',
    ruta: '/recursos-camas'
  },
  {
    titulo: 'Historia Clínica',
    descripcion: 'Alergias, evoluciones y estudios médicos',
    ruta: '/historia-clinica'
  }
]
</script>