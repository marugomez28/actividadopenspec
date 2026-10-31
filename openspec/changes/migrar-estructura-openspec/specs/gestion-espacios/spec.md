# Spec Delta: gestion-espacios

## Purpose

Gestiona el catálogo e inventario de espacios académicos de la institución (laboratorios, auditorios y salas de cómputo), restringiendo su creación, modificación y eliminación al rol de Administrador.

## ADDED Requirements

### Requirement: Creación y modificación de espacios por Administradores
El sistema SHALL permitir únicamente a los usuarios con rol "Administrador" registrar nuevos espacios académicos, actualizar su disponibilidad (`isActive`) o eliminarlos del catálogo.

#### Scenario: Registro exitoso de espacio académico por un Administrador
- **GIVEN** que un usuario con rol "Administrador" está autenticado
- **WHEN** registra un nuevo espacio llamado "Laboratorio de Física" con capacidad de 30 personas
- **THEN** el sistema guarda el espacio como activo (`isActive: true`) y lo muestra como "Disponible" en el catálogo

#### Scenario: Rechazo de creación de espacio por un Estudiante
- **GIVEN** que un usuario con rol "Estudiante" intenta crear o modificar un espacio
- **WHEN** envía la solicitud de creación o actualización del espacio
- **THEN** el sistema MUST rechazar la operación con estado HTTP 403 indicando que solo los administradores pueden crear o modificar espacios

### Requirement: Consulta pública del catálogo de espacios
El sistema SHALL permitir consultar el listado completo de espacios académicos registrados con su identificador, nombre, capacidad y estado operativo (`Disponible` o `Inactivo`).

#### Scenario: Listado del catálogo de espacios
- **WHEN** un usuario consulta el catálogo de espacios académicos
- **THEN** el sistema devuelve la lista ordenada de espacios registrados junto con su capacidad y estado de disponibilidad
