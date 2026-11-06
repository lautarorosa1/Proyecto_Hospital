# Pruebas del backend

Desde `backend/`, `npm test` ejecuta únicamente los archivos
`*.unit.test.ts`. Estas pruebas usan dobles de repositorios y no requieren
PostgreSQL. Las pruebas se mantienen fuera de `src`, por lo que no se incluyen
en la compilación ni en la aplicación.

## Pruebas de integración

La integración de `AlergiaRepository` no forma parte de `npm test` y no se
ejecutó. Para correrla manualmente, se necesita una instancia PostgreSQL
descartable, aislada de cualquier base de desarrollo o producción, creada con
el nombre exacto `Proyecto_Hospital_Test`. Debe tener el esquema de las
entidades `PacienteEntity` y `AlergiaEntity` y un paciente sintético con
`id = 1`, requerido por la relación de alergias. No reutilices datos reales.

Configura explícitamente estas variables de entorno antes de invocar la prueba:

```text
TEST_DB_HOST
TEST_DB_PORT
TEST_DB_USERNAME
TEST_DB_PASSWORD
TEST_DB_NAME=Proyecto_Hospital_Test
```

La prueba de integración requiere el ejecutor ya instalado en el backend:

```bash
npx tsx --test tests/modules/historia-clinica/tests/AlergiaRepository.integration.test.ts
```

La configuración rechaza valores omitidos y cualquier `TEST_DB_NAME` distinto
del nombre dedicado indicado arriba. No se usan los valores de conexión de la
aplicación ni credenciales predeterminadas.
