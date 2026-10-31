import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

// POST /api/auth/logout - Cerrar la sesión activa eliminando la cookie
export async function POST(): Promise<NextResponse<{ message: string }>> {
  const response = NextResponse.json(
    { message: "Sesión cerrada correctamente." },
    { status: 200 }
  );

  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 0,
  });

  return response;
}
