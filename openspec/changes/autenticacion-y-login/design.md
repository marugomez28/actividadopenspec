# Design

## Context

El proyecto cuenta actualmente con un modelo `User` (`id`, `email`, `role`) en `prisma/schema.prisma` y endpoints REST en Next.js App Router (`/api/spaces` y `/api/reservations`). Sin embargo, el rol activo se envía desde el cliente mediante un `<select>` y la cabecera `x-user-role`, lo cual carece de autenticación real y de protección de rutas en el servidor (ver `proposal.md` - Why).

## Goals / Non-Goals

**Goals:**
- Implementar un flujo de inicio y cierre de sesión con cookies HTTP-only firmadas que almacenen de forma segura `{ userId, email, role }`.
- Proteger las rutas de páginas y endpoints de API en Next.js 16 mediante `src/proxy.ts` y utilidades de validación de sesión en el servidor (`src/lib/auth.ts`).
- Garantizar en el servidor que `'Administrador'` pueda crear/modificar espacios y aprobar/rechazar reservas, mientras que `'Estudiante'` solo pueda solicitar y cancelar sus reservas.

**Non-Goals:**
- Integración con sistemas externos de Single Sign-On (SAML / OAuth2 institucional) o recuperación de contraseña por correo SMTP.

## Decisions

1. **Sesión basada en Cookie HTTP-Only firmada con HMAC (Web Crypto API) en lugar de cabeceras del cliente:**
   - *Racional:* El uso de Web Crypto API (`crypto.subtle`) es nativo en Node.js y en el Edge Runtime de `middleware.ts` de Next.js, evitando instalar dependencias pesadas de terceros y garantizando que el cliente no pueda falsificar su `role` (`Administrador` vs `Estudiante`).
   - *Alternativa descartada:* Confiar en `localStorage` o en la cabecera `x-user-role`, descartado porque cualquier usuario puede modificarla desde las herramientas de desarrollo del navegador.

2. **Doble capa de protección (Middleware de Next.js + Guardas en Route Handlers):**
   - *Racional:* `src/middleware.ts` intercepta las solicitudes a rutas protegidas redirigiendo a `/login` cuando no existe sesión válida, mientras que cada Route Handler (`/api/spaces`, `/api/reservations`) verifica explícitamente la sesión y el rol requerido (`requireAuth` / `requireAdmin`) antes de consultar Prisma.
   - *Alternativa descartada:* Proteger únicamente en la interfaz ocultando botones, descartado porque deja expuestos los endpoints de API.

3. **Autenticación respaldada por la tabla `User` de Prisma:**
   - *Racional:* Al iniciar sesión en `POST /api/auth/login`, el servidor consulta o registra el usuario en Prisma (`prisma.user`), respetando los roles `'Administrador'` y `'Estudiante'` definidos en el esquema de datos.

## Risks / Trade-offs

- **[Riesgo] Secreto de firma no configurado en variables de entorno** → **Mitigación:** Proveer un valor `AUTH_SECRET` en `.env` con un fallback seguro para el entorno de desarrollo local.
- **[Riesgo] Compatibilidad con clientes o pruebas existentes durante la transición** → **Mitigación:** Mantener mensajes de error HTTP claros (`401 No autenticado` y `403 Acceso denegado`) alineados con las especificaciones de `proteccion-rutas-rbac`.

## Migration Plan

1. Crear el módulo de sesión y autenticación en `src/lib/auth.ts`.
2. Implementar los endpoints `/api/auth/login`, `/api/auth/logout` y `/api/auth/session`.
3. Crear la página `/login` (`src/app/login/page.tsx`) y el middleware de protección de rutas (`src/middleware.ts`).
4. Actualizar `/api/spaces`, `/api/spaces/[id]`, `/api/reservations`, `/api/reservations/[id]` y `src/app/page.tsx` para usar la sesión autenticada en lugar del selector manual de rol.
