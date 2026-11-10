<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-md text-center">
      <h1 class="text-3xl font-semibold text-gray-900">Página no encontrada</h1>
      <p class="mt-2 text-sm text-gray-500">La dirección a la que intentaste entrar no existe.</p>
      <router-link
        to="/"
        class="mt-6 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
      >
        Volver al menú principal
      </router-link>
    </div>
  </div>
</template>
