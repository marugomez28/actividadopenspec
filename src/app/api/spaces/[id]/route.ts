import { NextRequest, NextResponse } from "next/server";
import { Prisma, Space } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PATCH /api/spaces/[id] - Modificar un espacio existente (Exclusivo rol Administrador)
export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<Space | { error: string }>> {
  try {
    const auth = await requireAdmin(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const { id } = await context.params;
    const spaceId = Number(id);

    if (!Number.isInteger(spaceId) || spaceId <= 0) {
      return NextResponse.json(
        { error: "ID de espacio inválido." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, capacity, isActive } = body as {
      name?: string;
      capacity?: number | string;
      isActive?: boolean;
    };

    const updateData: Prisma.SpaceUpdateInput = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "El nombre del espacio no puede estar vacío." },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (capacity !== undefined) {
      const parsedCapacity = Number(capacity);
      if (!Number.isInteger(parsedCapacity) || parsedCapacity <= 0) {
        return NextResponse.json(
          { error: "La capacidad debe ser un número entero mayor a 0." },
          { status: 400 }
        );
      }
      updateData.capacity = parsedCapacity;
    }

    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }

    const updatedSpace: Space = await prisma.space.update({
      where: { id: spaceId },
      data: updateData,
    });

    return NextResponse.json(updatedSpace, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar espacio:", error);
    return NextResponse.json(
      { error: "Error al actualizar el espacio académico." },
      { status: 500 }
    );
  }
}

// DELETE /api/spaces/[id] - Eliminar un espacio (Exclusivo rol Administrador)
export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    const auth = await requireAdmin(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const { id } = await context.params;
    const spaceId = Number(id);

    if (!Number.isInteger(spaceId) || spaceId <= 0) {
      return NextResponse.json(
        { error: "ID de espacio inválido." },
        { status: 400 }
      );
    }

    await prisma.space.delete({
      where: { id: spaceId },
    });

    return NextResponse.json(
      { message: "Espacio eliminado correctamente." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar espacio:", error);
    return NextResponse.json(
      { error: "Error al eliminar el espacio académico." },
      { status: 500 }
    );
  }
}
