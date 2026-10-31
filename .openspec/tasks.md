# Tareas de Implementación
- [x] **Tarea 1: Inicialización.** Crear el proyecto base con Next.js, TypeScript y Tailwind CSS.
- [x] **Tarea 2: Modelo de Datos.** Configurar Prisma ORM y crear el `schema.prisma` con los modelos `User` (id, email, role), `Space` (id, name, capacity, isActive) y `Reservation` (id, userId, spaceId, startTime, endTime, status).
- [x] **Tarea 3: CRUD de Espacios.** Implementar las rutas de API y la interfaz para que un Administrador pueda crear y listar espacios.
- [x] **Tarea 4: Lógica de Reservas.** Crear el endpoint de solicitud de reserva, incluyendo la validación de horario (06:00 a 22:00) y la consulta a la base de datos para evitar solapamientos.
- [x] **Tarea 5: Aprobación y Cancelación.** Implementar el panel de administrador para cambiar el estado de las reservas (Aprobado/Rechazado) y la opción de cancelación para el usuario.
- [ ] **Tarea 6: Cambio de Regla de Negocio (Límite 4 horas).** Actualizar la lógica del endpoint de reservas para validar que la diferencia entre `endTime` y `startTime` no sea mayor a 4 horas.