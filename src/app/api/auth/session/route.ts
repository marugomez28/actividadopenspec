import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, SessionPayload } from "@/lib/auth";

// GET /api/auth/session - Obtener el usuario autenticado actual
export async function GET(
  request: NextRequest
): Promise<NextResponse<{ user: SessionPayload | null }>> {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user: session }, { status: 200 });
}
