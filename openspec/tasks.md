# Tareas de Implementación y Evolución (OpenSpec)

- [x] **Tarea 1: Inicialización.** Crear el proyecto base con Next.js, TypeScript y Tailwind CSS.
- [x] **Tarea 2: Modelo de Datos.** Configurar Prisma ORM con SQLite y crear el `prisma/schema.prisma` con los modelos `User` (id, email, role), `Space` (id, name, capacity, isActive) y `Reservation` (id, userId, spaceId, startTime, endTime, status).
- [x] **Tarea 3: CRUD de Espacios.** Implementar las rutas de API (`/api/spaces`, `/api/spaces/[id]`) y la interfaz para que un Administrador pueda crear, activar/desactivar, eliminar y listar espacios.
- [x] **Tarea 4: Lógica de Reservas.** Crear el endpoint de solicitud de reserva (`/api/reservations`), incluyendo la validación de horario operativo (06:00 a 22:00) y la consulta a la base de datos en Prisma para evitar solapamientos.
- [x] **Tarea 5: Aprobación y Cancelación.** Implementar el panel de administrador para cambiar el estado de las reservas (`Aprobado`/`Rechazado`) y la opción de cancelación (`Cancelado`) para el usuario manteniendo el historial inmutable.
- [x] **Tarea 6: Cambio de Regla de Negocio (Límite 4 horas).** Actualizar la lógica del endpoint de reservas para validar matemáticamente que la diferencia entre `endTime` y `startTime` no sea mayor a 4 horas consecutivas.
- [x] **Tarea 7: Autenticación, Login y Protección de Rutas por Rol.** Implementar el sistema de login (`/login`, `/api/auth/*`, `src/lib/auth.ts`, `src/proxy.ts`) diferenciando entre el rol `'Administrador'` (crear espacios y aprobar reservas) y el rol `'Estudiante'` (solo solicitar y cancelar reservas).
