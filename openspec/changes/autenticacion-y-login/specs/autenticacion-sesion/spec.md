# Spec Delta: autenticacion-sesion

## Purpose

Proporciona el mecanismo de inicio de sesión (login), emisión de sesión autenticada, consulta del usuario activo y cierre de sesión (logout), identificando el correo institucional y el rol asignado (`Administrador` o `Estudiante`).

## ADDED Requirements

### Requirement: Inicio de sesión con correo institucional y rol
El sistema SHALL permitir a un usuario iniciar sesión mediante sus credenciales institucionales y MUST establecer una sesión activa en el servidor que contenga su identificador (`id`), correo (`email`) y rol (`Administrador` o `Estudiante`).

#### Scenario: Inicio de sesión exitoso como Administrador
- **GIVEN** un usuario registrado con rol "Administrador" y correo "admin@universidad.edu"
- **WHEN** envía sus credenciales válidas en el formulario de inicio de sesión
- **THEN** el sistema crea una sesión autenticada con rol "Administrador" y redirige al panel principal

#### Scenario: Inicio de sesión exitoso como Estudiante
- **GIVEN** un usuario con correo institucional "juan@universidad.edu"
- **WHEN** inicia sesión en el sistema como estudiante
- **THEN** el sistema establece una sesión activa con el rol "Estudiante" y redirige a la vista de reserva de espacios

#### Scenario: Rechazo de inicio de sesión con datos inválidos
- **GIVEN** un usuario no autenticado en la página de login
- **WHEN** intenta iniciar sesión sin proporcionar un correo institucional válido o con credenciales incorrectas
- **THEN** el sistema MUST rechazar la solicitud con estado HTTP 401 o 400 mostrando un mensaje de error de autenticación

### Requirement: Cierre de sesión activa
El sistema SHALL permitir a cualquier usuario autenticado cerrar su sesión activa, invalidando la cookie de sesión y redirigiéndolo a la pantalla de login.

#### Scenario: Cierre de sesión exitoso
- **GIVEN** un usuario con una sesión activa en el sistema
- **WHEN** selecciona la opción "Cerrar sesión"
- **THEN** el sistema elimina la sesión activa y redirige al usuario a la ruta `/login`
