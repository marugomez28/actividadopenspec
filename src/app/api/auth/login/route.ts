import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionCookie, UserRole, SessionPayload } from "@/lib/auth";

interface LoginBody {
  email?: string;
  role?: UserRole;
  password?: string;
}

// POST /api/auth/login - Iniciar sesión y establecer cookie HTTP-only firmada
export async function POST(
  request: NextRequest
): Promise<NextResponse<{ user: SessionPayload } | { error: string }>> {
  try {
    const body = (await request.json()) as LoginBody;
    const { email, role } = body;

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { error: "Debe ingresar un correo institucional válido." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const resolvedRole: UserRole =
      role === "Administrador" || role === "Estudiante"
        ? role
        : normalizedEmail.startsWith("admin")
        ? "Administrador"
        : "Estudiante";

    const user = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: { role: resolvedRole },
      create: {
        email: normalizedEmail,
        role: resolvedRole,
      },
    });

    const sessionPayload: SessionPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    };

    const cookie = await createSessionCookie(sessionPayload);
    const response = NextResponse.json({ user: sessionPayload }, { status: 200 });
    response.cookies.set(cookie.name, cookie.value, cookie.options);

    return response;
  } catch (error) {
    console.error("Error en inicio de sesión:", error);
    return NextResponse.json(
      { error: "Error interno al procesar el inicio de sesión." },
      { status: 500 }
    );
  }
}
