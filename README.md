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

```text
Proyecto_Hospital/
├── docs/
│   └── api/                           # Contratos y endpoints por módulo
│       ├── iam.md
│       ├── admision.md
│       ├── pacientes.md
│       ├── historia-clinica.md
│       ├── enfermeria.md
│       ├── camas.md
│       └── facturacion.md
├── backend/
│   ├── src/
│   │   ├── modules/                   # Arquitectura Hexagonal / DDD por módulo
│   │   │   ├── iam/                   # Identidad y accesos (RBAC, JWT)
│   │   │   ├── admision/              # Turnos, agenda, triaje
│   │   │   ├── pacientes/             # Gestión y registro de pacientes
│   │   │   ├── historia-clinica/      # HCE, evoluciones, antecedentes
│   │   │   ├── atencion-enfermeria/   # Internaciones, signos vitales, protocolos
│   │   │   ├── recursos-camas/        # Camas, habitaciones, stock de insumos
│   │   │   └── facturacion/           # Obras sociales, liquidación, cargos
│   │   ├── shared/                    # Bus de eventos y manejadores comunes
│   │   ├── app.ts                     # Configuración de Express
│   │   ├── container.ts               # Inyección de dependencias
│   │   ├── data-source.ts             # Conexión dinámica a PostgreSQL
│   │   └── server.ts                  # Punto de entrada
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/                # Componentes UI reutilizables
    │   ├── router/                    # Rutas de la aplicación
    │   ├── services/                  # Servicios de integración HTTP
    │   ├── views/                     # Vistas de la aplicación
    │   └── utils/
    └── package.json
```

El backend sigue una arquitectura por capas (dominio, aplicación, infraestructura y adaptadores), con un módulo por entidad.

## Flujo de trabajo con Git

> **Regla fundamental:** NUNCA se programa directamente sobre `main` ni `development`. Todo desarrollo se realiza en una rama propia y se integra a `development` mediante un Pull Request (PR).

Cada vez que comiences una nueva tarea o funcionalidad:

1. **Actualizar la rama base (`development`):**
   ```bash
   git checkout development
   git pull origin development
   ```

2. **Crear la rama de funcionalidad:**
   ```bash
   git checkout -b feat/mi-modulo/tarea
   ```
   *(Ejemplo: `git checkout -b feat/admision/agenda-turnos`)*

3. **Desarrollar y guardar cambios (commits atómicos e imperativos):**
   ```bash
   git add .
   git commit -m "feat(modulo): breve descripcion de lo que hiciste"
   ```

4. **Subir la rama a GitHub:**
   ```bash
   git push -u origin feat/mi-modulo/tarea
   ```

5. **Abrir el Pull Request (PR) apuntando como rama destino a `development` (no a `main`):**
   - En GitHub aparecerá el botón verde **"Compare & pull request"**.
   - Asegurate de que la rama base apunte a **`development`**.
   - Hacé clic en **"Create pull request"** y avisá al equipo para su revisión y merge.

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

### 2. Crear la base de datos en PostgreSQL

Solo hay que crear la base de datos vacía. Las tablas se generan automáticamente al iniciar el backend.

**Opción A: desde la terminal con `psql`**

Conectarse a PostgreSQL con el usuario `postgres` (pedirá la contraseña que definiste al instalarlo):

```bash
psql -U postgres
```

Dentro de `psql`, crear la base de datos y salir:

```sql
CREATE DATABASE "Proyecto_Hospital";
\q
```

Las comillas dobles son necesarias para respetar las mayúsculas. Sin ellas, PostgreSQL crea la base como `proyecto_hospital`, y el valor de `DB_NAME` en el `.env` tendría que coincidir con ese nombre en minúsculas.

**Opción B: desde pgAdmin**

1. Abrir pgAdmin y conectarse al servidor.
2. Clic derecho sobre **Databases** → **Create** → **Database...**
3. En **Database** escribir `Proyecto_Hospital` y guardar.

Para comprobar que se creó, ejecutar `\l` dentro de `psql`: debería aparecer en la lista.

### 3. Configurar y levantar el backend

```bash
cd backend
npm install
copy .env.example .env
```

> En Linux o Mac el comando equivalente es `cp .env.example .env`.

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

## Documentación de la API

URL base: `http://localhost:3000`

> **Política documental:** Para evitar conflictos de fusión (*merge conflicts*) en el README, cada integrante debe registrar los nuevos endpoints, modelos y contratos de su módulo en su archivo correspondiente dentro de `docs/api/` como parte del mismo Pull Request en el que se implementa la funcionalidad.

### Módulos del Sistema:

- [Módulo IAM (Identidad y Accesos)](docs/api/iam.md)
- [Módulo Admisión y Turnos](docs/api/admision.md)
- [Módulo Pacientes](docs/api/pacientes.md)
- [Módulo Historia Clínica Electrónica](docs/api/historia-clinica.md)
- [Módulo Atención y Enfermería](docs/api/enfermeria.md)
- [Módulo Gestión de Recursos y Camas](docs/api/camas.md)
- [Módulo Facturación y Administración](docs/api/facturacion.md)


## Notas de desarrollo

- `synchronize` de TypeORM está activado en `backend/src/data-source.ts`, lo que crea y modifica las tablas automáticamente. Es cómodo en desarrollo, pero para producción conviene desactivarlo y usar migraciones.
- El archivo `.env` no se sube al repositorio. Usá `.env.example` como plantilla.
