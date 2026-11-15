# Proyecto Hospital

Sistema de Información Hospitalaria: aplicación web full stack que digitaliza la operación diaria de un hospital. Cubre el circuito **paciente → turno o guardia → internación → cama → enfermería → facturación**, con control de concurrencia en reservas y asignaciones, avisos en tiempo real y administración de usuarios y roles.

## Funcionalidades

| Módulo | Qué incluye |
|---|---|
| **IAM** | Registro y login con JWT, roles (RBAC), gestión de usuarios y roles |
| **Admisión** | Pacientes, profesionales y horarios, turnos con reserva segura, entreturnos, lista de espera, guardia con triaje y confirmación de ingreso a internación |
| **Historia Clínica (HCE)** | Alergias, antecedentes familiares, evoluciones médicas, estudios médicos y línea de tiempo del paciente |
| **Atención y Enfermería** | Internaciones, signos vitales (con alerta), indicaciones, medicaciones y administración de dosis, notas de enfermería, protocolos de ingreso |
| **Recursos y Camas** | Habitaciones (internación o consultorio), mapa de camas en vivo, asignación y estados de cama, insumos y stock |
| **Consultorio** | Ocupación de consultorios, agenda del día, sala de espera y notificaciones del profesional |
| **Facturación** | Nomenclador de prestaciones, cargos, cálculo por cobertura (pública, prepaga, particular), liquidación de cuenta y facturas |

## Tecnologías

**Backend**
- Node.js + Express 5
- TypeScript (ejecución con `tsx`)
- TypeORM + PostgreSQL (`pg`)
- JWT (`jsonwebtoken`) y `bcryptjs`
- `cors`, `dotenv`, `reflect-metadata`
- Pruebas con el test runner nativo de Node (`node:test`)

**Frontend**
- Vue 3 + Vite
- Vue Router
- Pinia
- Axios
- Tailwind CSS 4
- SweetAlert2
- Vitest + Vue Test Utils + jsdom
- ESLint, oxlint y Prettier

## Arquitectura

Monolito modular con **arquitectura hexagonal** (puertos y adaptadores) dentro de cada módulo. Los módulos se comunican entre sí por **eventos de dominio** (bus en memoria) y por **puertos síncronos**, sin importar clases de otros módulos. El detalle está en [`backend/INTERACCIONES.md`](backend/INTERACCIONES.md).

| Capa | Carpeta | Responsabilidad |
|---|---|---|
| Adaptadores | `adapters/` | Rutas y controladores HTTP |
| Aplicación | `application/` | Casos de uso, validaciones y DTOs |
| Dominio | `domain/` | Reglas de negocio e interfaces (puertos) |
| Infraestructura | `infrastructure/` | Entidades TypeORM, repositorios y notificadores |

Patrones aplicados: **State** (estados del turno), **Builder** (protocolos de ingreso), **Strategy** (cobertura en facturación), **Repository**, **DTO** y **Observer** (bus de eventos).

Concurrencia: bloqueo optimista con columna `version` en turnos, bloqueo pesimista (`FOR UPDATE`) en camas e inventario, `SKIP LOCKED` en la lista de espera e índices únicos parciales en consultorio y guardia.

Tiempo real: **Server-Sent Events** (mapa de camas, alertas de guardia, lista de espera, consultorio).

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
├── Documentación técnica y arquitectónica — Sistema de Información Hospitalaria.docx
├── backend/
│   ├── src/
│   │   ├── modules/                   # Un módulo por área, con capas hexagonales
│   │   │   ├── iam/                   # Usuarios, roles, permisos, JWT
│   │   │   ├── admision/              # Subcarpetas: pacientes, profesionales,
│   │   │   │                          #   horarios, turnos, guardia, ingresos-internacion
│   │   │   ├── historia-clinica/      # Alergias, antecedentes, evoluciones, estudios, línea de tiempo
│   │   │   ├── atencion-enfermeria/   # Internaciones, signos vitales, medicación, notas, protocolos
│   │   │   ├── recursos-camas/        # Habitaciones, camas, insumos, inventario
│   │   │   ├── consultorio/           # Ocupación de salas, agenda, notificaciones
│   │   │   └── facturacion/           # Nomenclador, cargos, facturas, estrategias de cobertura
│   │   ├── migrations/                # Migraciones de TypeORM
│   │   ├── shared/                    # Bus de eventos, SSE, errores y errorHandler
│   │   ├── app.ts                     # Configuración de Express y montaje de rutas
│   │   ├── container.ts               # Ensamblado de los módulos
│   │   ├── data-source.ts             # Conexión a PostgreSQL
│   │   └── server.ts                  # Punto de entrada
│   ├── tests/                         # Pruebas unitarias y de integración (fuera de src)
│   ├── INTERACCIONES.md               # Eventos y puertos entre módulos
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── modules/                   # Un módulo por área: views, components, services, utils, routes.js
    │   │   ├── admision/              # pacientes, profesionales, turnos, guardia, ingresos-internacion
    │   │   ├── historia-clinica/
    │   │   ├── atencion-enfermeria/
    │   │   ├── recursos-camas/        # camas, habitaciones, insumos
    │   │   ├── consultorio/
    │   │   └── facturacion/
    │   ├── shared/                    # ConfirmModal, useEventStream (SSE), validators, formato
    │   ├── stores/                    # Pinia (authStore)
    │   ├── services/                  # Axios (api.js), auth e IAM admin
    │   ├── views/                     # Login, registro y administración de usuarios y roles
    │   ├── router/                    # Router global con guards por autenticación y rol
    │   └── main.js
    ├── tests/                         # Pruebas con Vitest
    ├── CAMBIOS_INTEGRACION.md         # Cambios de UI por la integración entre módulos
    └── package.json
```

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
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=Proyecto_Hospital
JWT_SECRET=un_secreto_largo_y_propio
JWT_EXPIRES_IN=8h
```

| Variable | Obligatoria | Descripción |
|---|---|---|
| `PORT` | No (3000) | Puerto del servidor |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | Sí | Conexión a PostgreSQL |
| `JWT_SECRET` | Sí en la práctica | Secreto para firmar los tokens. Si falta, el código usa un valor de desarrollo inseguro: definí siempre uno propio |
| `JWT_EXPIRES_IN` | No (8h) | Duración del token |
| `DB_SYNCHRONIZE` | No (`true`) | Si es `true`, TypeORM crea y modifica las tablas al iniciar |
| `DB_LOGGING` | No (`true`) | Muestra las consultas SQL en consola |

Iniciar el servidor en modo desarrollo:

```bash
npm run dev
```

El backend queda disponible en `http://localhost:3000`. Para comprobar que está activo: `GET http://localhost:3000/health` devuelve `{ "status": "ok" }`.

### 4. Levantar el frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite indicará la URL en la terminal (por defecto `http://localhost:5173`).

> El frontend apunta a `http://localhost:3000` (definido en `frontend/src/services/api.js`). Si cambiás el puerto del backend, actualizá esa URL.

### 5. Crear el primer usuario

Todas las pantallas, salvo el login y el registro, requieren sesión. Abrí `http://localhost:5173/register`, creá un usuario y elegí al menos un rol. Con el rol `Administrador` se accede a la gestión de usuarios y roles (`/admin/usuarios` y `/admin/roles`).

Roles del personal: `Administrador`, `Médico`, `Enfermero`, `Recepcionista`, `Administrativo` y `Maestranza`. El rol `Paciente` existe, pero no se puede elegir al registrarse.

## Scripts disponibles

**Backend** (`/backend`)

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor con recarga automática (tsx) |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm test` | Ejecuta las pruebas unitarias (`*.unit.test.ts`) y verifica los tipos de las pruebas |
| `npm start` | Ejecuta la versión compilada |

**Frontend** (`/frontend`)

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Genera la build de producción |
| `npm run preview` | Previsualiza la build de producción |
| `npm test` | Ejecuta las pruebas con Vitest |
| `npm run lint` | Ejecuta oxlint y ESLint (con corrección automática) |
| `npm run format` | Formatea el código con Prettier |

## Pruebas

- **Backend:** las pruebas unitarias usan dobles de los repositorios y **no requieren PostgreSQL**. Están en `backend/tests/`, fuera de `src`, por lo que no entran en la compilación. La prueba de integración de `AlergiaRepository` no forma parte de `npm test` y necesita una base descartable; las instrucciones están en [`backend/tests/README.md`](backend/tests/README.md).
- **Frontend:** `npm test` en `/frontend` ejecuta las pruebas de formularios, componentes, utilidades y del store de autenticación.

## Rutas de la API

URL base: `http://localhost:3000`. Estos son los prefijos que monta `backend/src/app.ts`:

| Módulo | Prefijo |
|---|---|
| IAM | `/auth`, `/roles`, `/usuarios` (también bajo `/api/v1/iam`) |
| Pacientes | `/pacientes` |
| Profesionales y horarios | `/profesionales` |
| Turnos, entreturnos y lista de espera | `/turnos` |
| Guardia (triaje) | `/guardia` |
| Confirmación de ingreso a internación | `/ingresos-internacion` |
| Historia clínica | `/alergias`, `/antecedentes-familiares`, `/evoluciones-medicas`, `/estudios-medicos`, `/historia-clinica` |
| Enfermería | `/atencion-enfermeria/{internaciones,signos-vitales,indicaciones,medicaciones,administraciones,notas,protocolos}` |
| Recursos y camas | `/habitaciones`, `/camas`, `/insumos` |
| Consultorio | `/consultorio` |
| Facturación | `/api/facturacion` |
| Estado del servidor | `/health` |

**Streams en tiempo real (SSE):**

| Endpoint | Qué emite |
|---|---|
| `GET /camas/eventos/stream` | Cambios de estado del mapa de camas |
| `GET /guardia/alertas/stream` | Código Rojo y alertas de signos vitales |
| `GET /turnos/espera/alertas/stream` | Promoción desde la lista de espera |
| `GET /consultorio/habitaciones/stream` | Ocupación de consultorios |
| `GET /consultorio/profesionales/:id/stream` | Notificaciones y ocupación del profesional |

## Documentación de la API

> **Política documental:** Para evitar conflictos de fusión (*merge conflicts*) en el README, cada integrante debe registrar los nuevos endpoints, modelos y contratos de su módulo en su archivo correspondiente dentro de `docs/api/` como parte del mismo Pull Request en el que se implementa la funcionalidad.

- [Módulo IAM (Identidad y Accesos)](docs/api/iam.md)
- [Módulo Admisión y Turnos](docs/api/admision.md)
- [Módulo Pacientes](docs/api/pacientes.md)
- [Módulo Historia Clínica Electrónica](docs/api/historia-clinica.md)
- [Módulo Atención y Enfermería](docs/api/enfermeria.md)
- [Módulo Gestión de Recursos y Camas](docs/api/camas.md)
- [Módulo Facturación y Administración](docs/api/facturacion.md)

El módulo **Consultorio** todavía no tiene su archivo en `docs/api/`; sus endpoints están descritos en [`backend/INTERACCIONES.md`](backend/INTERACCIONES.md).

## Documentación adicional

- [`backend/INTERACCIONES.md`](backend/INTERACCIONES.md): eventos de dominio, puertos entre módulos y endpoints de Consultorio.
- [`frontend/CAMBIOS_INTEGRACION.md`](frontend/CAMBIOS_INTEGRACION.md): cambios de la interfaz por la integración entre módulos.
- *Documentación técnica y arquitectónica — Sistema de Información Hospitalaria* (`.docx` en la raíz): decisiones de diseño, patrones, base de datos, seguridad y relación entre diseño e implementación.

## Notas de desarrollo

- `synchronize` de TypeORM está activado por defecto en `backend/src/data-source.ts` y crea o modifica las tablas automáticamente. Es cómodo en desarrollo, pero para producción conviene desactivarlo (`DB_SYNCHRONIZE=false`) y usar migraciones. Las migraciones están en `backend/src/migrations/` (antecedentes familiares, evoluciones médicas y estudios médicos); `package.json` no incluye un script para ejecutarlas.
- **Autorización pendiente:** los middlewares `authenticateJWT` y `authorizeRoles` solo se aplican hoy en las rutas de IAM y en `POST /camas/:id/limpieza`. El resto de la API no exige token, y el control por rol se hace en el router del frontend. Antes de un uso real hay que protegerlas en el servidor.
- El registro público acepta el campo `roles`, por lo que cualquiera puede registrarse como `Administrador`. Conviene restringirlo antes de publicar el sistema.
- Los streams SSE no requieren token y el bus de eventos es en memoria, sin reintentos.
- Los archivos `.env` no se suben al repositorio. Usá `.env.example` como plantilla y no incluyas tu `.env` real al compartir el proyecto.
- Facturación no sigue la estructura de capas del resto: su controlador está en `infrastructure/` y sus servicios usan `AppDataSource` directamente.
