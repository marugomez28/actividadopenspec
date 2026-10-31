# Especificaciones del Sistema de Reservas Académicas

## 1. Gestión de espacios académicos
* **Regla:** Solo los administradores pueden crear, modificar o eliminar espacios académicos.
* **Escenario de aceptación:**
  * **Dado** que un usuario con rol "Administrador" ha iniciado sesión
  * **Cuando** registra un nuevo espacio "Laboratorio de Física" con capacidad de 30 personas
  * **Entonces** el sistema guarda el espacio y lo muestra como "Disponible" (`isActive: true`) en el catálogo.

## 2. Registro y administración de usuarios
* **Regla:** El sistema debe identificar unívocamente a cada usuario por su correo institucional (`email`).
* **Escenario de aceptación:**
  * **Dado** que un usuario intenta registrarse o iniciar sesión en el sistema
  * **Cuando** ingresa el correo "juan@universidad.edu"
  * **Entonces** el sistema identifica o crea la cuenta y le asigna el rol correspondiente (por defecto "Estudiante").

## 3. Autenticación, Login y Protección de Rutas por Rol
* **Regla:** El sistema debe contar con un flujo de autenticación e inicio de sesión (`/login`) que diferencie entre el rol "Administrador" (con acceso para crear espacios y aprobar/rechazar reservas) y el rol "Estudiante" (con acceso exclusivo para consultar el catálogo, solicitar reservas y cancelar sus reservas), protegiendo las rutas de Next.js frente a accesos no autenticados.
* **Escenarios de aceptación:**
  * **Dado** un visitante no autenticado, **Cuando** intenta acceder al panel principal `/`, **Entonces** el sistema redirige automáticamente a `/login`.
  * **Dado** un usuario autenticado con rol "Estudiante", **Cuando** accede al sistema o intenta invocar endpoints administrativos (`POST /api/spaces` o aprobación de reservas), **Entonces** el sistema deniega el acceso administrativo (`403 Forbidden`) y solo le permite solicitar y cancelar reservas.
  * **Dado** un usuario autenticado con rol "Administrador", **Cuando** inicia sesión en `/login`, **Entonces** puede crear/modificar espacios y visualizar y aprobar/rechazar todas las reservas pendientes de la institución.

## 4. Creación de solicitudes de reserva
* **Regla:** Una solicitud debe contener espacio, fecha, hora de inicio y hora de fin, quedando asociada al usuario autenticado.
* **Escenario de aceptación:**
  * **Dado** un usuario autenticado
  * **Cuando** selecciona el "Auditorio Principal" para el "2026-11-05" de "08:00" a "10:00"
  * **Entonces** el sistema registra la solicitud con estado "Pendiente".

## 5. Validación de disponibilidad y horario operativo
* **Regla:** El sistema solo permite solicitudes en espacios marcados como "Activos" (`isActive: true`) y dentro del horario operativo de la institución (06:00 a 22:00).
* **Escenario de aceptación:**
  * **Dado** un usuario autenticado
  * **Cuando** solicita reservar un espacio a las "23:00"
  * **Entonces** el sistema rechaza la solicitud indicando "Fuera de horario operativo".

## 6. Prevención de reservas simultáneas (Solapamientos)
* **Regla:** Un espacio no puede tener dos reservas (aprobadas o pendientes) que se superpongan en el tiempo (`startTime < nuevoEndTime` y `endTime > nuevoStartTime`).
* **Escenario de aceptación:**
  * **Dado** que el "Laboratorio 1" tiene una reserva de "10:00" a "12:00"
  * **Cuando** otro usuario intenta reservar el "Laboratorio 1" de "11:00" a "13:00"
  * **Entonces** el sistema bloquea la acción y muestra un error de "Conflicto de horario".

## 7. Aprobación y rechazo de solicitudes
* **Regla:** Solo los administradores pueden cambiar el estado de una solicitud de "Pendiente" a "Aprobado" o "Rechazado".
* **Escenario de aceptación:**
  * **Dado** un administrador autenticado en el panel de control
  * **Cuando** hace clic en "Aprobar" sobre una solicitud pendiente
  * **Entonces** la reserva cambia de estado a "Aprobado" y el espacio queda definitivamente bloqueado para ese lapso.

## 8. Cancelación e historial de reservas
* **Regla:** Los usuarios pueden cancelar reservas activas (`Pendiente` o `Aprobado`), liberando el espacio. Todas las acciones se guardan en un historial inmutable.
* **Escenario de aceptación:**
  * **Dado** un estudiante con una reserva aprobada para el día siguiente
  * **Cuando** cancela su reserva
  * **Entonces** el estado cambia a "Cancelado", el espacio vuelve a estar disponible y la acción queda registrada en su historial.

## 9. Límite de duración de reserva (Máximo 4 horas consecutivas)
* **Regla:** Ningún usuario podrá reservar un espacio académico durante más de cuatro (4) horas consecutivas (`endTime - startTime <= 4 horas`).
* **Escenario de aceptación:**
  * **Dado** un usuario autenticado
  * **Cuando** solicita reservar un espacio por 5 horas (ej. de 08:00 a 13:00)
  * **Entonces** el sistema rechaza la solicitud indicando "La reserva no puede exceder las 4 horas consecutivas".
