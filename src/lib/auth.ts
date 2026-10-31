import { NextRequest, NextResponse } from "next/server";

export type UserRole = "Administrador" | "Estudiante";

export interface SessionPayload {
  userId: number;
  email: string;
  role: UserRole;
}

export const SESSION_COOKIE_NAME = "sr_session";

const SECRET_KEY =
  process.env.AUTH_SECRET ?? "sistema-reservas-secret-key-2026-institucional";

function toBase64Url(str: string): string {
  return Buffer.from(str, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(base64url: string): string {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "===".slice((base64.length + 3) % 4);
  return Buffer.from(padded, "base64").toString("utf-8");
}

async function computeHmacSignature(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SECRET_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(data)
  );
  return Buffer.from(signatureBuffer)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function signSessionToken(
  payload: SessionPayload
): Promise<string> {
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = await computeHmacSignature(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) {
      return null;
    }
    const [encodedPayload, signature] = parts;
    const expectedSignature = await computeHmacSignature(encodedPayload);
    if (signature !== expectedSignature) {
      return null;
    }

    const decoded = JSON.parse(fromBase64Url(encodedPayload)) as Partial<SessionPayload>;
    if (
      typeof decoded.userId !== "number" ||
      typeof decoded.email !== "string" ||
      (decoded.role !== "Administrador" && decoded.role !== "Estudiante")
    ) {
      return null;
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

export async function createSessionCookie(payload: SessionPayload) {
  const value = await signSessionToken(payload);
  return {
    name: SESSION_COOKIE_NAME,
    value,
    options: {
      httpOnly: true,
      path: "/",
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 12, // 12 horas
    },
  };
}

export async function getSessionFromRequest(
  request: NextRequest
): Promise<SessionPayload | null> {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (!cookie?.value) {
    return null;
  }
  return verifySessionToken(cookie.value);
}

export async function requireAuth(
  request: NextRequest
): Promise<
  | { session: SessionPayload; errorResponse?: never }
  | { session?: never; errorResponse: NextResponse<{ error: string }> }
> {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return {
      errorResponse: NextResponse.json(
        { error: "No autenticado: Debe iniciar sesión para realizar esta acción." },
        { status: 401 }
      ),
    };
  }
  return { session };
}

export async function requireAdmin(
  request: NextRequest
): Promise<
  | { session: SessionPayload; errorResponse?: never }
  | { session?: never; errorResponse: NextResponse<{ error: string }> }
> {
  const authResult = await requireAuth(request);
  if (authResult.errorResponse) {
    return authResult;
  }

  if (authResult.session.role !== "Administrador") {
    return {
      errorResponse: NextResponse.json(
        {
          error:
            "Acceso denegado: Se requiere rol Administrador para realizar esta acción.",
        },
        { status: 403 }
      ),
    };
  }

  return { session: authResult.session };
}
