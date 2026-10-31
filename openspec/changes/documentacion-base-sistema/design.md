# Design

## Context

El proyecto requiere tanto los artefactos estructurados de cambios de OpenSpec (`openspec/changes/*`) como los dos documentos base consolidados directamente en `openspec/especificaciones.md` y `openspec/tasks.md` para facilitar la revisión académica y la trazabilidad completa de Spec-Driven Development (ver `proposal.md` - Why).

## Goals / Non-Goals

**Goals:**
- Consolidar en `openspec/especificaciones.md` todas las reglas de negocio vigentes con sus escenarios Given/When/Then (incluyendo el límite de 4 horas y los roles `Administrador`/`Estudiante` del login).
- Consolidar en `openspec/tasks.md` el checklist completo de desarrollo desde la Tarea 1 hasta la Tarea 7 (Autenticación y Login).

**Non-Goals:**
- Alterar el esquema de base de datos o introducir dependencias adicionales.

## Decisions

1. **Ubicación directa en `openspec/especificaciones.md` y `openspec/tasks.md` coexistiendo con `openspec/config.yaml`:**
   - *Racional:* El CLI de OpenSpec ignora archivos Markdown sueltos en la raíz de `openspec/` al validar `openspec/changes/` y `openspec/specs/`, lo que permite mantener ambos archivos maestros sin interferir con `openspec validate --strict`.

## Risks / Trade-offs

- **[Riesgo] Desincronización futura entre `openspec/especificaciones.md` y nuevos cambios** → **Mitigación:** Incluir la actualización de `openspec/especificaciones.md` y `openspec/tasks.md` como paso de cierre en futuros cambios.
