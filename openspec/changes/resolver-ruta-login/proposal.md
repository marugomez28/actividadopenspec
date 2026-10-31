# Proposal

## Why

Al navegar hacia la ruta `/login`, el servidor de desarrollo puede devolver un error HTTP 404 si el manifiesto de rutas de Next.js (`.next/`) quedó desactualizado respecto a la creación de `src/app/login/page.tsx` o si el proxy intercepta la ruta antes de resolverla. Es necesario garantizar que la interfaz de inicio de sesión (`src/app/login/page.tsx` en el App Router bajo `src/app/`) sea accesible públicamente con código HTTP 200 y presente el formulario completo para los roles `'Administrador'` y `'Estudiante'`.

## What Changes

- Garantizar la resolución pública de la ruta `/login` (`src/app/login/page.tsx`) con el formulario de inicio de sesión para los roles `'Administrador'` y `'Estudiante'`.
- Asegurar que `src/proxy.ts` permita el acceso público directo a `/login` y `/api/auth/*` sin bloqueos ni dependencias exclusivas de Node.js que fallen en el runtime de proxy.
- Limpiar y regenerar la caché de rutas de Next.js (`.next`) y verificar con una petición HTTP real a `/login` que devuelva estado `200 OK`.

## Capabilities

### New Capabilities
- `interfaz-login-publica`: Acceso público sin restricciones a la ruta `/login` mostrando el formulario de inicio de sesión institucional con selección e ingreso para los roles `'Administrador'` y `'Estudiante'`.

### Modified Capabilities

*(Ninguna capacidad registrada aún en `openspec/specs/`).*

## Impact

- **Interfaz de Login (`src/app/login/page.tsx`):** Vista pública del App Router con formulario de correo institucional y selector de rol (`Administrador` / `Estudiante`).
- **Proxy y Autenticación (`src/proxy.ts`, `src/lib/auth.ts`):** Exclusión explícita de `/login` en el matcher/flujo de redirección para visitantes no autenticados y compatibilidad de codificación Base64URL estándar (`TextEncoder`/`btoa`/`atob`).
- **Servidor Next.js (`.next/`):** Regeneración limpia del manifiesto de rutas del App Router.
