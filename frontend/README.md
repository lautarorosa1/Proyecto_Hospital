# frontend

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Pruebas unitarias

```sh
npm test
```

Las pruebas se encuentran en `tests/`, organizadas por módulo, y ejecutan con Vitest
en un DOM simulado (`jsdom`). Las llamadas a servicios HTTP de los componentes se
simulan; no hace falta iniciar el backend, conectar una base de datos ni usar datos
reales de pacientes. La aplicación en ejecución sí necesita los servicios externos
que consume, como la API y el canal de eventos de guardia.

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
