import { NextRequest, NextResponse } from "next/server";
import { Prisma, Space } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// GET /api/spaces - Listar todos los espacios académicos
export async function GET(): Promise<NextResponse<Space[] | { error: string }>> {
  try {
    const spaces: Space[] = await prisma.space.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json(spaces, { status: 200 });
  } catch (error) {
    console.error("Error al obtener espacios:", error);
    return NextResponse.json(
      { error: "Error interno al listar los espacios académicos." },
      { status: 500 }
    );
  }
}

// POST /api/spaces - Crear un nuevo espacio académico (Exclusivo rol Administrador)
export async function POST(
  request: NextRequest
): Promise<NextResponse<Space | { error: string }>> {
  try {
    const auth = await requireAdmin(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const body = await request.json();
    const { name, capacity, isActive } = body as {
      name?: string;
      capacity?: number | string;
      isActive?: boolean;
    };

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "El nombre del espacio es obligatorio." },
        { status: 400 }
      );
    }

    const parsedCapacity = Number(capacity);
    if (!Number.isInteger(parsedCapacity) || parsedCapacity <= 0) {
      return NextResponse.json(
        { error: "La capacidad debe ser un número entero mayor a 0." },
        { status: 400 }
      );
    }

    const data: Prisma.SpaceCreateInput = {
      name: name.trim(),
      capacity: parsedCapacity,
      isActive: typeof isActive === "boolean" ? isActive : true,
    };

    const newSpace: Space = await prisma.space.create({ data });

    return NextResponse.json(newSpace, { status: 201 });
  } catch (error) {
    console.error("Error al crear espacio:", error);
    return NextResponse.json(
      { error: "Error interno al crear el espacio académico." },
      { status: 500 }
    );
  }
}
