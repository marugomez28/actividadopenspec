# Tasks

## 1. Base e Infraestructura de Datos (Migrado de `.openspec/tasks.md`)

- [ ] 1.1 Verificar la configuración del proyecto base con Next.js, TypeScript y Tailwind CSS ejecutando `npx tsc --noEmit` sin errores
- [ ] 1.2 Verificar el modelo de datos en `prisma/schema.prisma` (`User`, `Space`, `Reservation`) ejecutando `npx prisma validate`

## 2. Capacidades de Espacios, Usuarios y Motor de Reservas

- [ ] 2.1 Verificar el CRUD de espacios académicos en `src/app/api/spaces/route.ts` y `src/app/api/spaces/[id]/route.ts`, comprobando que solo el rol `Administrador` pueda crear o modificar espacios
- [ ] 2.2 Verificar en `src/app/api/reservations/route.ts` la validación de horario operativo (`06:00` a `22:00`), la consulta a Prisma contra solapamientos (`Pendiente` / `Aprobado`) y el límite máximo de **4 horas consecutivas** (`La reserva no puede exceder las 4 horas consecutivas`)
- [ ] 2.3 Verificar en `src/app/api/reservations/[id]/route.ts` y `src/app/page.tsx` el flujo de aprobación/rechazo exclusivo para `Administrador` y la opción de cancelación con historial inmutable para el usuario

## 3. Consolidación OpenSpec y Eliminación de `.openspec/`

- [ ] 3.1 Validar la estructura formal del cambio ejecutando `openspec validate "migrar-estructura-openspec" --strict` y verificar que no reporte errores
- [ ] 3.2 Eliminar la carpeta manual antigua `.openspec/` (`.openspec/especificaciones.md` y `.openspec/tasks.md`) y verificar que el directorio `.openspec` ya no exista en la raíz del proyecto

## Workflow follow-up

- Sincronizar o archivar el cambio (`openspec archive "migrar-estructura-openspec"`) una vez completada y revisada la fase de aplicación (`apply`).
