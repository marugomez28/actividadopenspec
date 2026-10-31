# Especificaciones del Sistema de Reservas

## 1. Gestión de espacios académicos
* **Regla:** Solo los administradores pueden crear o modificar espacios.
* **Escenario de aceptación:**
  * **Dado** que un usuario con rol "Administrador" está autenticado
  * **Cuando** registra un nuevo espacio "Laboratorio de Física" con capacidad de 30 personas
  * **Entonces** el sistema guarda el espacio y lo muestra como "Disponible" en el catálogo.

## 2. Registro y administración de usuarios
* **Regla:** El sistema debe identificar unívocamente a cada usuario por su correo institucional.
* **Escenario de aceptación:**
  * **Dado** que un usuario intenta registrarse
  * **Cuando** ingresa el correo "juan@universidad.edu"
  * **Entonces** el sistema crea la cuenta y le asigna el rol por defecto "Estudiante".

## 3. Roles y permisos
* **Regla:** Los roles determinan qué acciones puede realizar un usuario.
* **Escenarios de aceptación:**
  * **Dado** un usuario con rol "Estudiante", **Cuando** intenta acceder al panel de aprobación, **Entonces** el sistema deniega el acceso.
  * **Dado** un usuario con rol "Administrador", **Cuando** accede al sistema, **Entonces** puede visualizar todas las reservas pendientes de la institución.

## 4. Creación de solicitudes de reserva
* **Regla:** Una solicitud debe contener espacio, fecha, hora de inicio y hora de fin.
* **Escenario de aceptación:**
  * **Dado** un usuario autenticado
  * **Cuando** selecciona el "Auditorio Principal" para el "2026-11-05" de "08:00" a "10:00"
  * **Entonces** el sistema registra la solicitud con estado "Pendiente".
  ## 5. Validación de disponibilidad
* **Regla:** El sistema solo permite solicitudes en espacios marcados como "Activos" y dentro del horario operativo de la institución (06:00 a 22:00).
* **Escenario de aceptación:**
  * **Dado** un usuario autenticado
  * **Cuando** solicita reservar un espacio a las "23:00"
  * **Entonces** el sistema rechaza la solicitud indicando "Fuera de horario operativo".

## 6. Prevención de reservas simultáneas
* **Regla:** Un espacio no puede tener dos reservas (aprobadas o pendientes) que se superpongan en el tiempo.
* **Escenario de aceptación:**
  * **Dado** que el "Laboratorio 1" tiene una reserva de "10:00" a "12:00"
  * **Cuando** otro usuario intenta reservar el "Laboratorio 1" de "11:00" a "13:00"
  * **Entonces** el sistema bloquea la acción y muestra un error de "Conflicto de horario".

## 7. Aprobación y rechazo de solicitudes
* **Regla:** Solo los administradores pueden cambiar el estado de una solicitud de "Pendiente" a "Aprobado" o "Rechazado".
* **Escenario de aceptación:**
  * **Dado** un administrador en el panel de control
  * **Cuando** hace clic en "Aprobar" sobre una solicitud pendiente
  * **Entonces** la reserva cambia de estado y el espacio queda definitivamente bloqueado para ese lapso.

## 8. Cancelación e historial de reservas
* **Regla:** Los usuarios pueden cancelar reservas futuras, liberando el espacio. Todas las acciones se guardan en un historial inmutable.
* **Escenario de aceptación:**
  * **Dado** un estudiante con una reserva aprobada para el día siguiente
  * **Cuando** cancela su reserva
  * **Entonces** el estado cambia a "Cancelado", el espacio vuelve a estar disponible y la acción queda registrada en su historial.