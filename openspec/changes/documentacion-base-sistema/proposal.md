# Proposal

## Why

Tras migrar desde la carpeta manual `.openspec/` hacia el directorio oficial `openspec/`, es necesario consolidar la documentación base unificada del sistema en `openspec/especificaciones.md` y el checklist integral de desarrollo en `openspec/tasks.md`, abarcando todas las reglas de negocio vigentes (incluyendo el límite máximo de 4 horas consecutivas por reserva y la diferenciación de roles `'Administrador'` y `'Estudiante'` en el login).

## What Changes

- Generar el documento maestro `openspec/especificaciones.md` con las 10 reglas de negocio y escenarios de aceptación Given/When/Then del Sistema de Reservas Académicas (CRUD de espacios, registro de usuarios, autenticación y login diferenciando `'Administrador'` y `'Estudiante'`, horario operativo `06:00`–`22:00`, prevención de solapamientos, límite de 4 horas consecutivas, aprobación/rechazo y cancelación con historial inmutable).
- Generar el checklist maestro de desarrollo en `openspec/tasks.md` reflejando todas las etapas de construcción y evolución del sistema.
- Formalizar los artefactos del cambio en `openspec/changes/documentacion-base-sistema/`.

## Capabilities

### New Capabilities
- `documentacion-maestra-openspec`: Consolidación de las especificaciones funcionales completas en `openspec/especificaciones.md` y del checklist de tareas de ingeniería en `openspec/tasks.md`.

### Modified Capabilities

*(Ninguna capacidad registrada aún en `openspec/specs/`).*

## Impact

- **Documentación OpenSpec (`openspec/especificaciones.md`, `openspec/tasks.md`):** Fuente única de la verdad consolidada en la carpeta `openspec/` con todas las reglas de negocio y tareas del proyecto.
