# Spec Delta: motor-reservas

## Purpose

Regula el ciclo de vida completo de las reservas de espacios académicos: creación de solicitudes, validación de horario operativo institucional (06:00 a 22:00), límite máximo de 4 horas consecutivas, prevención de solapamientos de horarios, aprobación o rechazo por administradores y cancelación con historial inmutable.

## ADDED Requirements

### Requirement: Creación de solicitudes de reserva en estado Pendiente
El sistema SHALL exigir que toda solicitud de reserva indique espacio académico, fecha, hora de inicio y hora de fin, registrándola inicialmente con estado "Pendiente".

#### Scenario: Registro exitoso de solicitud de reserva
- **GIVEN** un usuario autenticado y un espacio activo llamado "Auditorio Principal"
- **WHEN** solicita reservar el "Auditorio Principal" para el "2026-11-05" de "08:00" a "10:00"
- **THEN** el sistema registra la solicitud con estado "Pendiente"

### Requirement: Validación de espacio activo y horario operativo institucional
El sistema SHALL permitir solicitudes únicamente en espacios marcados como activos (`isActive: true`) y dentro del horario operativo institucional de 06:00 a 22:00 del mismo día.

#### Scenario: Rechazo de reserva fuera del horario operativo
- **GIVEN** un usuario autenticado
- **WHEN** solicita reservar un espacio a las "23:00"
- **THEN** el sistema MUST rechazar la solicitud indicando "Fuera de horario operativo"

### Requirement: Límite máximo de duración de 4 horas consecutivas
El sistema SHALL validar matemáticamente que la diferencia entre `endTime` y `startTime` de una solicitud no exceda las cuatro (4) horas consecutivas.

#### Scenario: Rechazo de reserva que excede las 4 horas consecutivas
- **GIVEN** un usuario autenticado
- **WHEN** solicita reservar un espacio por 5 horas consecutivas (de "08:00" a "13:00")
- **THEN** el sistema MUST rechazar la solicitud con código HTTP 400 indicando "La reserva no puede exceder las 4 horas consecutivas"

### Requirement: Prevención de reservas simultáneas o solapadas
El sistema SHALL impedir que un mismo espacio académico tenga dos reservas con estado "Pendiente" o "Aprobado" cuyos intervalos de tiempo `[startTime, endTime)` se superpongan.

#### Scenario: Bloqueo por conflicto de horario superpuesto
- **GIVEN** que el "Laboratorio 1" tiene una reserva activa de "10:00" a "12:00"
- **WHEN** otro usuario intenta reservar el "Laboratorio 1" en la misma fecha de "11:00" a "13:00"
- **THEN** el sistema MUST bloquear la acción con estado HTTP 409 y mostrar un error de "Conflicto de horario"

### Requirement: Aprobación y rechazo de solicitudes por Administradores
El sistema SHALL permitir únicamente a los usuarios con rol "Administrador" cambiar el estado de una solicitud de "Pendiente" a "Aprobado" o "Rechazado".

#### Scenario: Aprobación de solicitud pendiente por un Administrador
- **GIVEN** un usuario con rol "Administrador" en el panel de control y una solicitud en estado "Pendiente"
- **WHEN** aprueba la solicitud pendiente
- **THEN** la reserva cambia su estado a "Aprobado" y el espacio queda bloqueado para ese lapso

### Requirement: Cancelación de reservas e historial inmutable
El sistema SHALL permitir a los usuarios cancelar sus reservas en estado "Pendiente" o "Aprobado", cambiando su estado a "Cancelado" para liberar la disponibilidad del espacio sin eliminar el registro del historial.

#### Scenario: Cancelación de reserva aprobada y liberación del espacio
- **GIVEN** un estudiante con una reserva en estado "Aprobado"
- **WHEN** cancela su reserva
- **THEN** el estado cambia a "Cancelado", el espacio vuelve a estar disponible para nuevas solicitudes en ese horario y la reserva permanece registrada en el historial inmutable
