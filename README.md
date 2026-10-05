# Proyecto Hospital

Aplicación web full stack para la gestión de pacientes de un hospital. Permite listar, ver, crear, editar y eliminar pacientes, con validaciones de datos en el servidor.

## Tecnologías

**Backend**
- Node.js + Express 5
- TypeScript
- TypeORM
- PostgreSQL
- dotenv

**Frontend**
- Vue 3 + Vite
- Vue Router
- Pinia
- Axios
- Tailwind CSS 4

## Estructura del proyecto

```
Proyecto_Hospital/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   └── pacientes/
│   │   │       ├── adapters/          # Controlador y rutas HTTP
│   │   │       ├── application/       # Servicio, interfaces y DTOs
│   │   │       ├── domain/            # Modelo e interfaz del repositorio
│   │   │       ├── infrastructure/    # Entidad TypeORM y repositorio
│   │   │       └── paciente.module.ts
│   │   ├── shared/                    # Errores y manejador de errores
│   │   ├── app.ts                     # Configuración de Express
│   │   ├── container.ts               # Inyección de dependencias
│   │   ├── data-source.ts             # Conexión a PostgreSQL
│   │   └── server.ts                  # Punto de entrada
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/                # Componentes reutilizables
    │   ├── router/                    # Rutas del frontend
    │   ├── services/                  # Cliente HTTP (Axios)
    │   ├── utils/
    │   └── views/                     # Vistas de pacientes
    └── package.json
```

El backend sigue una arquitectura por capas (dominio, aplicación, infraestructura y adaptadores), con un módulo por entidad.

## Requisitos previos

- [Node.js](https://nodejs.org/) `^22.18.0` o `>=24.12.0` (requerido por el frontend)
- [PostgreSQL](https://www.postgresql.org/) en ejecución
- npm

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd Proyecto_Hospital
```

### 2. Crear la base de datos

Crear una base de datos vacía en PostgreSQL (por ejemplo `Proyecto_Hospital`). Las tablas se generan automáticamente al iniciar el backend.

### 3. Configurar y levantar el backend

```bash
cd backend
npm install
copy .env.example .env
```

Completar el archivo `.env` con los datos de tu base de datos:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=Proyecto_Hospital
```

Iniciar el servidor en modo desarrollo:

```bash
npm run dev
```

El backend queda disponible en `http://localhost:3000`. El puerto se puede cambiar con la variable opcional `PORT`.

### 4. Levantar el frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite indicará la URL en la terminal (por defecto `http://localhost:5173`).

> El frontend apunta a `http://localhost:3000` (definido en `frontend/src/services/api.js`). Si cambiás el puerto del backend, actualizá esa URL.

## Scripts disponibles

**Backend** (`/backend`)

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor con recarga automática (tsx) |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm start` | Ejecuta la versión compilada |

**Frontend** (`/frontend`)

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Genera la build de producción |
| `npm run preview` | Previsualiza la build de producción |
| `npm run lint` | Ejecuta oxlint y ESLint |
| `npm run format` | Formatea el código con Prettier |

## API

URL base: `http://localhost:3000`

| Método | Ruta | Descripción | Respuesta |
|---|---|---|---|
| GET | `/health` | Estado del servidor | `200` |
| GET | `/pacientes` | Listar pacientes | `200` |
| GET | `/pacientes/:id` | Obtener un paciente | `200` / `404` |
| POST | `/pacientes` | Crear un paciente | `201` / `400` / `409` |
| PUT | `/pacientes/:id` | Actualizar un paciente | `200` / `400` / `404` / `409` |
| DELETE | `/pacientes/:id` | Eliminar un paciente | `204` / `404` |

### Modelo de paciente

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | número | — | Generado automáticamente |
| `nombre` | string | Sí | |
| `apellido` | string | Sí | |
| `dni` | string | Sí | De 7 a 9 dígitos, único |
| `email` | string | Sí | Formato válido, único (se guarda en minúsculas) |
| `fechaNacimiento` | string | Sí | Formato `YYYY-MM-DD`, fecha real y no futura |
| `telefono` | string | No | |
| `direccion` | string | No | |

### Ejemplo

```bash
curl -X POST http://localhost:3000/pacientes \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "dni": "30123456",
    "email": "juan.perez@mail.com",
    "fechaNacimiento": "1990-05-20",
    "telefono": "1155551234",
    "direccion": "Av. Siempre Viva 742"
  }'
```

### Errores

Los errores devuelven un JSON con el formato `{ "error": "mensaje" }`.

| Código | Cuándo ocurre |
|---|---|
| `400` | Datos faltantes o inválidos, id no válido o JSON mal formado |
| `404` | El paciente o la ruta no existe |
| `409` | Ya existe un paciente con ese DNI o email |
| `500` | Error interno del servidor |

## Rutas del frontend

| Ruta | Vista |
|---|---|
| `/pacientes` | Listado de pacientes |
| `/pacientes/create` | Formulario de alta |
| `/pacientes/:id` | Detalle del paciente |
| `/pacientes/edit/:id` | Formulario de edición |

## Notas de desarrollo

- `synchronize` de TypeORM está activado en `backend/src/data-source.ts`, lo que crea y modifica las tablas automáticamente. Es cómodo en desarrollo, pero para producción conviene desactivarlo y usar migraciones.
- El archivo `.env` no se sube al repositorio. Usá `.env.example` como plantilla.
