# Tasks

## 1. Compatibilidad Web Crypto y Acceso Público a `/login`

- [ ] 1.1 Actualizar `src/lib/auth.ts` para usar codificación Base64URL estándar (`TextEncoder`, `TextDecoder`, `btoa`, `atob`) sin depender de `Buffer`, y verificar que `npx tsc --noEmit` compile sin errores
- [ ] 1.2 Verificar y asegurar en `src/proxy.ts` que la ruta `/login` y `/api/auth/*` permitan acceso público directo para usuarios no autenticados
- [ ] 1.3 Verificar el componente de interfaz `src/app/login/page.tsx` con el formulario de inicio de sesión para los roles `'Administrador'` y `'Estudiante'`

## 2. Reconstrucción de Caché de Rutas y Verificación HTTP 200

- [ ] 2.1 Limpiar el directorio `.next`, iniciar el servidor y verificar que una petición HTTP a `http://localhost:3000/login` responda con estado `200 OK`
