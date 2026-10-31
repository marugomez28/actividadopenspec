# Proposal

## Why

Actualmente el sistema utiliza un selector manual en la interfaz cliente (`x-user-role`) para simular el cambio entre `'Administrador'` y `'Estudiante'`, sin una sesión de usuario real ni protección de rutas en el servidor. Para garantizar la seguridad de las operaciones críticas (creación de espacios y aprobación/rechazo de reservas) es necesario incorporar un sistema formal de autenticación, inicio de sesión (login) y protección de rutas en Next.js basado en roles (RBAC).

## What Changes

- Incorporar un flujo de autenticación e inicio de sesión (`/login` y endpoints `/api/auth/login`, `/api/auth/logout`, `/api/auth/session`) respaldado por el modelo `User` en Prisma (`email`, `role` y credenciales asociadas).
- Reemplazar el selector manual de rol por una sesión autenticada persistida en cookie HTTP-only firmada.
- Diferenciar estrictamente los permisos por rol:
  - **Rol `'Administrador'`:** Acceso completo para crear, activar/desactivar y eliminar espacios académicos, así como para visualizar todas las solicitudes y aprobar o rechazar reservas pendientes.
  - **Rol `'Estudiante'`:** Acceso restringido únicamente a visualizar el catálogo de espacios disponibles, crear solicitudes de reserva y cancelar sus propias reservas activas.
- Proteger tanto las páginas de Next.js (mediante `middleware.ts` / guardas de servidor) como los Route Handlers (`/api/spaces` y `/api/reservations`) validando la sesión activa antes de ejecutar cualquier mutación.

## Capabilities

### New Capabilities
- `autenticacion-sesion`: Inicio de sesión (login) con correo institucional, emisión y verificación de sesión activa, cierre de sesión (logout) e identificación del rol (`Administrador` o `Estudiante`).
- `proteccion-rutas-rbac`: Control de acceso basado en roles (RBAC) para proteger las rutas de interfaz y los endpoints de API de Next.js según el rol `'Administrador'` o `'Estudiante'`.

### Modified Capabilities

*(Ninguna capacidad registrada aún en `openspec/specs/`).*

## Impact

- **Modelo de Datos (`prisma/schema.prisma`):** Extensión opcional o uso del modelo `User` (`id`, `email`, `role`) para autenticar usuarios institucionales y semillas iniciales de `Administrador` y `Estudiante`.
- **Rutas y Middleware de Next.js:** Creación de `src/app/login/page.tsx`, `src/middleware.ts`, y rutas `/api/auth/*`.
- **Endpoints protegidos:** `src/app/api/spaces/route.ts`, `src/app/api/spaces/[id]/route.ts`, `src/app/api/reservations/route.ts` y `src/app/api/reservations/[id]/route.ts` leerán la identidad y el rol desde la sesión del servidor en lugar de depender de cabeceras manipulables por el cliente.
