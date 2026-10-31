# Spec Delta: interfaz-login-publica

## Purpose

Asegura que la ruta `/login` del App Router de Next.js sea accesible públicamente con estado HTTP 200 (sin errores 404 ni bucles de redirección) y presente el formulario de acceso para los roles "Administrador" y "Estudiante".

## ADDED Requirements

### Requirement: Resolución pública de la ruta `/login` sin error 404
El sistema SHALL servir públicamente la interfaz de inicio de sesión en la ruta `/login` con código de estado HTTP 200 para cualquier visitante no autenticado.

#### Scenario: Visitante no autenticado navega a `/login`
- **GIVEN** un usuario sin sesión activa en el navegador
- **WHEN** accede a la ruta `/login`
- **THEN** el servidor MUST responder con estado HTTP 200 renderizando la interfaz de inicio de sesión sin devolver error 404

### Requirement: Formulario de acceso para los roles Administrador y Estudiante
La vista `/login` SHALL presentar un formulario de autenticación que permita ingresar el correo institucional y seleccionar o acceder bajo el rol `'Administrador'` o `'Estudiante'`.

#### Scenario: Acceso mediante formulario con rol Administrador o Estudiante
- **GIVEN** que el usuario visualiza la página `/login`
- **WHEN** ingresa su correo institucional, elige el rol `'Administrador'` o `'Estudiante'` y envía el formulario
- **THEN** el sistema autentica la sesión contra `/api/auth/login` y redirige al usuario a la vista principal `/`
