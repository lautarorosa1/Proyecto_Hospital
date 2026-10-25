<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-3xl">
      <router-link to="/" class="text-sm text-indigo-600 hover:underline">
        ← Volver al menú principal
      </router-link>

      <h1 class="mb-8 mt-4 text-center text-3xl font-semibold text-gray-900">Admisión</h1>

      <div class="grid gap-4 sm:grid-cols-3">
        <router-link
          v-for="opcion in opciones"
          :key="opcion.ruta"
          :to="opcion.ruta"
          class="rounded-xl bg-white p-6 text-center shadow-sm ring-1 ring-gray-200 transition hover:ring-indigo-300 hover:shadow-md"
        >
          <h2 class="text-lg font-semibold text-gray-900">{{ opcion.titulo }}</h2>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
const opciones = [
  { titulo: 'Pacientes', ruta: '/pacientes' },
  { titulo: 'Profesionales', ruta: '/profesionales' },
  { titulo: 'Turnos', ruta: '/turnos' }
]
</script>
