<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-3xl">
      <h1 class="mb-8 text-center text-3xl font-semibold text-gray-900">Menú principal</h1>

      <div class="grid gap-4 sm:grid-cols-2">
        <router-link
          v-for="modulo in modulos"
          :key="modulo.ruta"
          :to="modulo.ruta"
          class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition hover:ring-indigo-300 hover:shadow-md"
        >
          <h2 class="text-lg font-semibold text-gray-900">{{ modulo.titulo }}</h2>
          <p class="mt-1 text-sm text-gray-500">{{ modulo.descripcion }}</p>
        </router-link>
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
  }
  // { titulo: 'Otro módulo', descripcion: '...', ruta: '/otro-modulo' }
]
</script>