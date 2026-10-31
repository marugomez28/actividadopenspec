# Spec Delta: usuarios-y-roles

## Purpose

Define la identificación unívoca de usuarios mediante su correo electrónico institucional, la asignación del rol por defecto y el control de permisos según el rol asignado (`Estudiante` o `Administrador`).

## ADDED Requirements

### Requirement: Identificación unívoca y registro por correo institucional
El sistema SHALL identificar de forma única a cada usuario por su correo electrónico institucional (`email`) y MUST asignarle el rol por defecto "Estudiante" al momento de su creación.

#### Scenario: Registro automático con rol por defecto Estudiante
- **GIVEN** que un usuario no registrado solicita una operación en el sistema
- **WHEN** ingresa el correo institucional "juan@universidad.edu"
- **THEN** el sistema crea la cuenta asociada a ese correo y le asigna el rol por defecto "Estudiante"

### Requirement: Control de acceso basado en roles
El sistema SHALL restringir las funciones administrativas de acuerdo con el rol del usuario autenticado (`Estudiante` frente a `Administrador`).

#### Scenario: Denegación de acceso al panel de aprobación para Estudiante
- **GIVEN** un usuario con rol "Estudiante"
- **WHEN** intenta acceder al panel de aprobación o ejecutar una acción administrativa de aprobación o rechazo
- **THEN** el sistema MUST denegar el acceso

#### Scenario: Visualización de reservas pendientes para Administrador
- **GIVEN** un usuario con rol "Administrador"
- **WHEN** accede al panel de administración del sistema
- **THEN** el sistema MUST permitir visualizar y gestionar todas las reservas pendientes de la institución
