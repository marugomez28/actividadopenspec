# Design

## Context

El Sistema de Reservas Académicas está implementado como un monolito modular en un único repositorio con **Next.js (App Router)**, **TypeScript**, **Prisma ORM** sobre **SQLite** (`prisma/schema.prisma`) y **Tailwind CSS**, siguiendo las decisiones arquitectónicas de `PLAN_INGENIERIA.md` (ver `proposal.md` - Why). Inicialmente, las especificaciones y la lista de tareas se alojaron manualmente en `.openspec/especificaciones.md` y `.openspec/tasks.md`. Con la inicialización formal de OpenSpec (`openspec/config.yaml` con `schema: spec-driven`), se requiere consolidar la arquitectura y reglas de negocio en los artefactos oficiales y retirar el directorio manual `.openspec/`.

## Goals / Non-Goals

**Goals:**
- Formalizar en artefactos OpenSpec (`specs/`, `design.md`, `tasks.md`) la arquitectura monolítica y las reglas de validación del sistema ya implementadas en el código fuente.
- Documentar las invariantes técnicas del motor de reservas (horario operativo `06:00`–`22:00`, duración máxima de 4 horas consecutivas y consulta de intersección de intervalos en Prisma).
- Establecer el plan de migración y eliminación limpia de la carpeta `.openspec/`.

**Non-Goals:**
- Cambiar de motor de base de datos o migrar fuera del monolito Next.js + Prisma + SQLite.
- Introducir proveedores externos de autenticación OAuth en esta fase.

## Decisions

1. **Organización de capacidades en tres dominios cohesivos (`gestion-espacios`, `usuarios-y-roles`, `motor-reservas`):**
   - *Racional:* Refleja directamente los tres módulos definidos en `PLAN_INGENIERIA.md` (Sección 2: Organización en módulos), permitiendo evolucionar cada especificación de manera independiente.
   - *Alternativa descartada:* Un único archivo `spec.md` monolítico para todo el sistema, descartado porque dificulta auditar deltas específicos (como el cambio de la regla de 4 horas).

2. **Validación determinista de fechas, horario operativo y límite de 4 horas en el endpoint `/api/reservations`:**
   - *Racional:* Antes de consultar o insertar en SQLite mediante Prisma, el endpoint normaliza `startTime` y `endTime`, verifica que pertenezcan al mismo día entre `06:00` (360 min) y `22:00` (1320 min), y comprueba matemáticamente que `endTime.getTime() - startTime.getTime() <= 4 * 60 * 60 * 1000` (14,400,000 ms).
   - *Alternativa descartada:* Validar únicamente en el cliente (frontend), descartado porque permitiría omitir las reglas mediante llamadas directas al API.

3. **Prevención de solapamientos e historial inmutable mediante filtrado de estados en Prisma:**
   - *Racional:* La detección de colisiones consulta `prisma.reservation.findFirst` filtrando por `spaceId`, `status: { in: ["Pendiente", "Aprobado"] }`, `startTime < nuevoEndTime` y `endTime > nuevoStartTime`. Las reservas con estado `"Cancelado"` o `"Rechazado"` permanecen almacenadas en la tabla `Reservation` para conservar el historial inmutable sin bloquear nuevas solicitudes en ese bloque horario.

## Risks / Trade-offs

- **[Riesgo] Desfase entre archivos antiguos en `.openspec/` y artefactos oficiales en `openspec/`** → **Mitigación:** Eliminar por completo el directorio `.openspec/` como parte de la aplicación de este cambio una vez validados los artefactos con `openspec validate`.
- **[Riesgo] Condiciones de carrera en solicitudes concurrentes sobre el mismo espacio** → **Mitigación:** Mantener la consulta de solapamiento inmediatamente antes de la escritura en Prisma y validar nuevamente al aprobar solicitudes en `PATCH /api/reservations/[id]`.

## Migration Plan

1. Generar y validar los artefactos formales bajo `openspec/changes/migrar-estructura-openspec/`.
2. Durante la fase de aplicación (`apply`), verificar que las especificaciones (`gestion-espacios`, `usuarios-y-roles`, `motor-reservas`) coincidan con los endpoints `/api/spaces`, `/api/reservations` y `/api/reservations/[id]`.
3. Eliminar los archivos `.openspec/especificaciones.md`, `.openspec/tasks.md` y el directorio `.openspec/`.
4. Sincronizar/archivar las especificaciones hacia `openspec/specs/` cuando se cierre el cambio.
