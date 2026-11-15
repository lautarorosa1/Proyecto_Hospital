<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-3xl">
      <router-link
        to="/"
        class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
      >
        ←
      </router-link>

      <h1 class="mb-8 mt-4 text-center text-3xl font-semibold text-gray-900">
        Recursos y Camas
      </h1>

      <div class="grid gap-4 sm:grid-cols-2">
        <router-link
          v-for="opcion in opciones"
          :key="opcion.ruta"
          :to="opcion.ruta"
          class="rounded-xl bg-white p-6 text-center shadow-sm ring-1 ring-gray-200 transition hover:ring-indigo-300 hover:shadow-md"
        >
          <h2 class="text-lg font-semibold text-gray-900">{{ opcion.titulo }}</h2>
          <p class="mt-1 text-sm text-gray-500">{{ opcion.descripcion }}</p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
const opciones = [
  { titulo: 'Habitaciones', descripcion: 'Alta y listado de habitaciones', ruta: '/habitaciones' },
  { titulo: 'Insumos', descripcion: 'Stock y edición de inventario', ruta: '/insumos' },
  { titulo: 'Camas', descripcion: 'Mapa, asignación y estados', ruta: '/camas' }
]
</script>