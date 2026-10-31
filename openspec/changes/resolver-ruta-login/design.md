# Design

## Context

El proyecto utiliza la estructura con directorio `src/` (`src/app/`), por lo que todas las rutas del App Router de Next.js deben residir bajo `src/app/` (`src/app/login/page.tsx`) y nunca en un directorio `app/` duplicado en la raíz (lo cual provoca conflictos de enrutamiento y errores 404 en Next.js). Adicionalmente, si el proceso `next dev` tenía una compilación previa en `.next/` anterior a la creación de `src/app/login/page.tsx`, o si `src/lib/auth.ts` utiliza APIs no estándar en el runtime de proxy, la ruta `/login` no se sirve adecuadamente (ver `proposal.md` - Why).

## Goals / Non-Goals

**Goals:**
- Garantizar que `src/app/login/page.tsx` esté correctamente registrado en el App Router de Next.js y sea públicamente accesible en `/login`.
- Asegurar que `src/lib/auth.ts` y `src/proxy.ts` utilicen exclusivamente APIs estándar Web (`TextEncoder`, `TextDecoder`, `btoa`, `atob`, `crypto.subtle`) compatibles con cualquier runtime de Next.js 16.
- Limpiar la caché `.next` y verificar que el servidor sirva `GET /login` con HTTP 200.

**Non-Goals:**
- Modificar las reglas de negocio del motor de reservas o el esquema de Prisma.

## Decisions

1. **Mantener un único árbol de App Router en `src/app/login/page.tsx`:**
   - *Racional:* Next.js ignora `src/app` si existe una carpeta `app/` en la raíz del proyecto, causando errores 404 en las demás rutas. Mantener todas las rutas bajo `src/app/` conserva la integridad de todo el proyecto.
2. **Codificación Base64URL con Web APIs puras en `src/lib/auth.ts`:**
   - *Racional:* Reemplazar `Buffer.from` por `TextEncoder`/`btoa`/`atob` garantiza compatibilidad total tanto en `src/proxy.ts` como en los Route Handlers de Node.js.
3. **Paso directo en `src/proxy.ts` para `/login` cuando no existe cookie de sesión:**
   - *Racional:* Evita procesamiento innecesario en visitas públicas a `/login` y previene cualquier redirección circular.

## Risks / Trade-offs

- **[Riesgo] Caché `.next/` obsoleta de una instancia previa del servidor** → **Mitigación:** Limpiar `.next/` y reiniciar el servidor de desarrollo verificando `http://localhost:3000/login`.
