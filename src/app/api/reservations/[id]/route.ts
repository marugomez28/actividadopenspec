import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

type ReservationStatus = "Pendiente" | "Aprobado" | "Rechazado" | "Cancelado";

type ReservationWithRelations = Prisma.ReservationGetPayload<{
  include: {
    user: true;
    space: true;
  };
}>;

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface UpdateReservationStatusBody {
  status?: ReservationStatus;
}

// PATCH /api/reservations/[id] - Aprobar/Rechazar (Administrador) o Cancelar (Usuario autenticado)
export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ReservationWithRelations | { error: string }>> {
  try {
    const auth = await requireAuth(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const { id } = await context.params;
    const reservationId = Number(id);

    if (!Number.isInteger(reservationId) || reservationId <= 0) {
      return NextResponse.json(
        { error: "ID de reserva inválido." },
        { status: 400 }
      );
    }

    const body = (await request.json()) as UpdateReservationStatusBody;
    const { status } = body;

    if (
      !status ||
      !["Aprobado", "Rechazado", "Cancelado"].includes(status)
    ) {
      return NextResponse.json(
        {
          error:
            "Estado inválido. Los valores permitidos son 'Aprobado', 'Rechazado' o 'Cancelado'.",
        },
        { status: 400 }
      );
    }

    // Regla RBAC: Solo el rol "Administrador" puede aprobar o rechazar reservas
    if (
      (status === "Aprobado" || status === "Rechazado") &&
      auth.session.role !== "Administrador"
    ) {
      return NextResponse.json(
        {
          error:
            "Acceso denegado: Se requiere rol Administrador para aprobar o rechazar solicitudes de reserva.",
        },
        { status: 403 }
      );
    }

    const existingReservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!existingReservation) {
      return NextResponse.json(
        { error: "La reserva solicitada no existe." },
        { status: 404 }
      );
    }

    // Validar transiciones para Aprobación / Rechazo
    if (status === "Aprobado" || status === "Rechazado") {
      if (existingReservation.status !== "Pendiente") {
        return NextResponse.json(
          {
            error: `Solo se pueden aprobar o rechazar reservas en estado 'Pendiente' (estado actual: '${existingReservation.status}').`,
          },
          { status: 400 }
        );
      }

      if (status === "Aprobado") {
        const overlapping = await prisma.reservation.findFirst({
          where: {
            id: { not: reservationId },
            spaceId: existingReservation.spaceId,
            status: { in: ["Pendiente", "Aprobado"] },
            AND: [
              { startTime: { lt: existingReservation.endTime } },
              { endTime: { gt: existingReservation.startTime } },
            ],
          },
        });

        if (overlapping) {
          return NextResponse.json(
            {
              error:
                "Conflicto de horario: No se puede aprobar porque existe otra reserva superpuesta para este espacio.",
            },
            { status: 409 }
          );
        }
      }
    }

    // Validar transiciones para Cancelación
    if (status === "Cancelado") {
      if (
        existingReservation.status === "Cancelado" ||
        existingReservation.status === "Rechazado"
      ) {
        return NextResponse.json(
          {
            error: `No se puede cancelar una reserva cuyo estado actual es '${existingReservation.status}'.`,
          },
          { status: 400 }
        );
      }
    }

    const updatedReservation: ReservationWithRelations =
      await prisma.reservation.update({
        where: { id: reservationId },
        data: { status },
        include: {
          user: true,
          space: true,
        },
      });

    return NextResponse.json(updatedReservation, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar el estado de la reserva:", error);
    return NextResponse.json(
      { error: "Error interno al actualizar el estado de la reserva." },
      { status: 500 }
    );
  }
}
