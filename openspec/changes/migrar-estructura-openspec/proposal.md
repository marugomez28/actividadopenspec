# Proposal

## Why

El proyecto inició utilizando una carpeta manual no estándar (`.openspec/`) para documentar las reglas de negocio y las tareas de implementación. Para garantizar la trazabilidad formal de Spec-Driven Development (SDD) y aprovechar las herramientas de validación y ciclo de vida del CLI oficial de OpenSpec (`openspec/`), es necesario migrar todos los requisitos, escenarios de aceptación y tareas hacia la estructura oficial definida por `openspec/config.yaml` (`schema: spec-driven`) y retirar la carpeta manual obsoleta `.openspec/`.

## What Changes

- Formalizar y migrar las especificaciones de negocio desde `.openspec/especificaciones.md` hacia artefactos de especificación estructurados bajo `openspec/changes/migrar-estructura-openspec/specs/`.
- Documentar formalmente las reglas de negocio vigentes del sistema:
  - CRUD y gestión de disponibilidad de espacios académicos restringida a Administradores.
  - Identificación de usuarios por correo institucional, rol por defecto (`Estudiante`) y control de permisos por rol (`Administrador` / `Estudiante`).
  - Motor de reservas con validación de horario operativo (`06:00` a `22:00`), prevención de solapamientos de reservas (`Pendiente` o `Aprobado`) para un mismo espacio y regla de negocio de límite máximo de **4 horas consecutivas**.
  - Flujo de aprobación/rechazo por parte de Administradores y cancelación con historial inmutable por parte de los usuarios.
- Registrar la arquitectura técnica y las tareas de consolidación/limpieza en `design.md` y `tasks.md`, incluyendo la eliminación definitiva del directorio manual `.openspec/`.

## Capabilities

### New Capabilities
- `gestion-espacios`: Creación, listado, activación/desactivación y eliminación de espacios académicos controlados por rol Administrador.
- `usuarios-y-roles`: Identificación unívoca de usuarios mediante correo institucional, asignación de rol por defecto (`Estudiante`) y control de permisos entre `Estudiante` y `Administrador`.
- `motor-reservas`: Solicitud de reservas académicas, validación de horario operativo (`06:00` a `22:00`), validación matemática de duración máxima de 4 horas consecutivas, prevención de solapamientos en Prisma, aprobación/rechazo administrativo y cancelación con historial inmutable.

### Modified Capabilities

*(Ninguna capacidad previa registrada en `openspec/specs/`).*

## Impact

- **Artefactos de especificación:** Creación de `proposal.md`, `design.md`, `tasks.md` y especificaciones delta en `openspec/changes/migrar-estructura-openspec/specs/`.
- **Limpieza del repositorio:** Eliminación de la carpeta manual `.openspec/` (`.openspec/especificaciones.md` y `.openspec/tasks.md`) una vez completada la migración al estándar oficial de OpenSpec.
- **Código fuente existente:** Alineación documental con la implementación actual en Next.js (App Router), TypeScript, Prisma ORM (`prisma/schema.prisma`) y rutas de API (`/api/spaces`, `/api/reservations`).
