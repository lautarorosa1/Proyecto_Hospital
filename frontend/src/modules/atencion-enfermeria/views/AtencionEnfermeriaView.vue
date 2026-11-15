
<template>
  <div class="min-h-screen bg-gray-50 px-6 py-8">
    <div class="mx-auto max-w-6xl">

      <!-- VOLVER AL INICIO -->
      <router-link
        to="/"
        class="mb-6 inline-flex items-center text-sm font-medium text-teal-700 hover:text-teal-900"
      >
        ← Volver al menú principal
      </router-link>

      <!-- ENCABEZADO -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">
          Atención de Enfermería
        </h1>

        <p class="mt-2 text-gray-500">
          Administración y seguimiento de los cuidados de pacientes internados.
        </p>
      </div>

      <!-- SECCIONES -->
      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <router-link
          v-for="seccion in secciones"
          :key="seccion.ruta"
          :to="seccion.ruta"
          class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-md hover:ring-teal-300"
        >
          <div
            class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-2xl"
          >
            {{ seccion.icono }}
          </div>

          <h2 class="text-lg font-semibold text-gray-900">
            {{ seccion.titulo }}
          </h2>

          <p class="mt-2 text-sm text-gray-500">
            {{ seccion.descripcion }}
          </p>

          <span class="mt-5 inline-block text-sm font-semibold text-teal-700">
            Ingresar →
          </span>
        </router-link>
      </div>

    </div>
  </div>
</template>

<script setup>
const secciones = [
  {
    titulo: 'Internaciones',
    descripcion: 'Registrar y consultar internaciones de pacientes.',
    icono: '🛏️',
    ruta: '/atencion-enfermeria/internaciones'
  },
  {
    titulo: 'Signos vitales',
    descripcion: 'Registrar y consultar controles de signos vitales.',
    icono: '❤️',
    ruta: '/atencion-enfermeria/signos-vitales'
  },
  {
    titulo: 'Indicaciones',
    descripcion: 'Consultar y gestionar indicaciones médicas.',
    icono: '📋',
    ruta: '/atencion-enfermeria/indicaciones'
  },
  {
    titulo: 'Medicaciones',
    descripcion: 'Registrar y consultar medicaciones.',
    icono: '💊',
    ruta: '/atencion-enfermeria/medicaciones'
  },
  {
    titulo: 'Notas de enfermería',
    descripcion: 'Crear y consultar notas de enfermería.',
    icono: '📝',
    ruta: '/atencion-enfermeria/notas'
  },
  {
    titulo: 'Protocolos',
    descripcion: 'Consultar y administrar protocolos de enfermería.',
    icono: '📚',
    ruta: '/atencion-enfermeria/protocolos'
  }
]
</script>