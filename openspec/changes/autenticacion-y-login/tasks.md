# Tasks

## 1. Utilidades de Sesión y Endpoints de Autenticación

- [x] 1.1 Crear `src/lib/auth.ts` con las funciones de firma y lectura de cookies de sesión (`createSessionCookie`, `getSessionFromRequest`, `requireAuth`, `requireAdmin`) y verificar que `npx tsc --noEmit` compile sin errores
- [x] 1.2 Implementar los endpoints `POST /api/auth/login`, `POST /api/auth/logout` y `GET /api/auth/session` en `src/app/api/auth/` respaldados por el modelo `User` de Prisma (`Administrador` y `Estudiante`), verificando la creación y destrucción de la cookie de sesión

## 2. Protección de Rutas y Control de Acceso por Rol (RBAC) en Next.js

- [x] 2.1 Crear `src/proxy.ts` (convención oficial de Next.js 16 que reemplaza `middleware.ts`) para interceptar accesos no autenticados a rutas protegidas y redirigirlos a `/login`, verificando que las rutas públicas (`/login`, `/api/auth/*`) sigan accesibles
- [x] 2.2 Actualizar `src/app/api/spaces/route.ts` y `src/app/api/spaces/[id]/route.ts` para exigir sesión activa con rol `'Administrador'` en `POST`, `PATCH` y `DELETE`, verificando que un `'Estudiante'` reciba HTTP 403
- [x] 2.3 Actualizar `src/app/api/reservations/route.ts` y `src/app/api/reservations/[id]/route.ts` para asociar las nuevas reservas al usuario de la sesión activa y restringir los estados `'Aprobado'`/`'Rechazado'` exclusivamente al rol `'Administrador'`, verificando que un `'Estudiante'` solo pueda solicitar y cancelar reservas

## 3. Interfaz de Login y Panel Diferenciado por Rol

- [x] 3.1 Crear la página `src/app/login/page.tsx` con el formulario de inicio de sesión institucional (permitiendo iniciar sesión como `'Administrador'` o `'Estudiante'`), verificando la redirección a `/` tras autenticarse
- [x] 3.2 Actualizar `src/app/page.tsx` para mostrar el usuario autenticado, el botón de cerrar sesión y renderizar los controles de creación de espacios y aprobación de reservas únicamente para el rol `'Administrador'`, verificando que `npx tsc --noEmit` pase sin errores
