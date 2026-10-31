# Spec Delta: proteccion-rutas-rbac

## Purpose

Garantiza la protección de las rutas de interfaz y endpoints de API de Next.js mediante control de acceso basado en roles (RBAC), diferenciando entre los permisos del rol "Administrador" y los del rol "Estudiante".

## ADDED Requirements

### Requirement: Protección de rutas de Next.js frente a accesos no autenticados
El sistema SHALL exigir una sesión autenticada válida para acceder a las páginas protegidas y a los endpoints de mutación de la aplicación en Next.js.

#### Scenario: Redirección de usuario no autenticado a login
- **GIVEN** un visitante que no ha iniciado sesión
- **WHEN** intenta acceder a la ruta principal o al panel de administración
- **THEN** el sistema MUST redirigir la navegación a `/login`

#### Scenario: Bloqueo de petición API sin sesión activa
- **GIVEN** un cliente sin cookie de sesión válida
- **WHEN** envía una petición de creación de espacio o solicitud de reserva a `/api/spaces` o `/api/reservations`
- **THEN** el sistema MUST rechazar la petición con estado HTTP 401 ("No autenticado")

### Requirement: Autorización exclusiva de Administrador para gestión de espacios y aprobación de reservas
El sistema SHALL autorizar únicamente a usuarios cuya sesión activa tenga el rol "Administrador" para crear, modificar o eliminar espacios académicos y para aprobar o rechazar solicitudes de reserva.

#### Scenario: Administrador crea un espacio y aprueba una reserva
- **GIVEN** un usuario autenticado con rol "Administrador"
- **WHEN** crea un nuevo espacio en `/api/spaces` o cambia el estado de una reserva pendiente a "Aprobado" o "Rechazado" en `/api/reservations/[id]`
- **THEN** el sistema MUST autorizar y persistir la operación exitosamente

### Requirement: Restricción del rol Estudiante a solicitud de reservas
El sistema SHALL permitir a los usuarios con rol "Estudiante" únicamente consultar espacios disponibles, crear nuevas solicitudes de reserva y cancelar sus propias reservas, bloqueando cualquier intento de crear espacios o aprobar/rechazar reservas.

#### Scenario: Estudiante solicita una reserva válidamente
- **GIVEN** un usuario autenticado con rol "Estudiante"
- **WHEN** envía una solicitud de reserva válida en `/api/reservations`
- **THEN** el sistema registra la reserva asociándola automáticamente al usuario de la sesión activa con estado "Pendiente"

#### Scenario: Estudiante intenta crear un espacio o aprobar una reserva
- **GIVEN** un usuario autenticado con rol "Estudiante"
- **WHEN** intenta enviar una petición `POST /api/spaces` para crear un espacio o `PATCH /api/reservations/[id]` con estado "Aprobado" o "Rechazado"
- **THEN** el sistema MUST denegar la operación con estado HTTP 403 ("Acceso denegado: Se requiere rol Administrador")
