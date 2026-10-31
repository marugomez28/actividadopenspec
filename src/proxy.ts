import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rutas de autenticación y archivos estáticos
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const session = await getSessionFromRequest(request);

  // Si ya tiene sesión activa e intenta ir a /login, redirigir al inicio
  if (pathname === "/login") {
    if (session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Para rutas de API protegidas, dejar que los Route Handlers devuelvan 401/403 JSON estructurado
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Para páginas de la aplicación sin sesión activa, redirigir a /login
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
