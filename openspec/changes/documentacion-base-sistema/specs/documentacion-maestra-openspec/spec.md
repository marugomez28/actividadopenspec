# Spec Delta: documentacion-maestra-openspec

## Purpose

Mantiene la documentación maestra del Sistema de Reservas Académicas en `openspec/especificaciones.md` y el checklist de desarrollo en `openspec/tasks.md` con todas las reglas de negocio actualizadas.

## ADDED Requirements

### Requirement: Especificaciones maestras completas en `openspec/especificaciones.md`
El repositorio SHALL contar con el archivo `openspec/especificaciones.md` que documente las reglas de negocio de gestión de espacios, registro de usuarios, login diferenciado por rol (`Administrador` y `Estudiante`), horario operativo (`06:00` a `22:00`), prevención de solapamientos, límite de 4 horas consecutivas, aprobación/rechazo y cancelación con historial inmutable.

#### Scenario: Verificación de reglas de negocio en `openspec/especificaciones.md`
- **GIVEN** el directorio `openspec/` del proyecto
- **WHEN** se inspecciona el archivo `openspec/especificaciones.md`
- **THEN** el documento MUST incluir la regla del límite máximo de 4 horas consecutivas por reserva y la diferenciación de permisos entre los roles "Administrador" y "Estudiante" para el login

### Requirement: Checklist de desarrollo en `openspec/tasks.md`
El repositorio SHALL contar con el archivo `openspec/tasks.md` que liste de forma secuencial las tareas de inicialización, modelo de datos, CRUD de espacios, lógica de reservas, aprobación/cancelación, límite de 4 horas y autenticación/login.

#### Scenario: Consulta del checklist en `openspec/tasks.md`
- **GIVEN** el directorio `openspec/` del proyecto
- **WHEN** se consulta el archivo `openspec/tasks.md`
- **THEN** el archivo MUST mostrar la lista de tareas de implementación y evolución del sistema en formato Markdown con casillas de verificación
