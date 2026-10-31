import { NextRequest, NextResponse } from "next/server";
import { Prisma, Reservation } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const OPERATING_START_MINUTES = 6 * 60; // 06:00 (360 min)
const OPERATING_END_MINUTES = 22 * 60; // 22:00 (1320 min)

type ReservationWithRelations = Prisma.ReservationGetPayload<{
  include: {
    user: true;
    space: true;
  };
}>;

interface CreateReservationBody {
  userId?: number | string;
  email?: string;
  spaceId?: number | string;
  date?: string; // Opcional: "YYYY-MM-DD" si startTime y endTime se envían como "HH:mm"
  startTime?: string; // ISO string "YYYY-MM-DDTHH:mm" o "HH:mm"
  endTime?: string; // ISO string "YYYY-MM-DDTHH:mm" o "HH:mm"
}

/**
 * Extrae los minutos desde medianoche (0 - 1439) y construye el objeto Date
 * preservando la hora nominal enviada por el cliente.
 */
function parseDateTimeAndMinutes(
  rawTime: string,
  fallbackDate?: string
): { dateObj: Date; totalMinutes: number; datePart: string } | null {
  const trimmed = rawTime.trim();

  // Caso 1: Formato "HH:mm" acompañado de `date` ("YYYY-MM-DD")
  const timeOnlyMatch = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(trimmed);
  if (timeOnlyMatch) {
    if (!fallbackDate || !/^\d{4}-\d{2}-\d{2}$/.test(fallbackDate.trim())) {
      return null;
    }
    const hours = Number(timeOnlyMatch[1]);
    const minutes = Number(timeOnlyMatch[2]);
    const seconds = Number(timeOnlyMatch[3] ?? "0");
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null;
    }
    const isoString = `${fallbackDate.trim()}T${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.000Z`;
    const dateObj = new Date(isoString);
    if (Number.isNaN(dateObj.getTime())) {
      return null;
    }
    return {
      dateObj,
      totalMinutes: hours * 60 + minutes,
      datePart: fallbackDate.trim(),
    };
  }

  // Caso 2: Cadena ISO "YYYY-MM-DDTHH:mm..."
  const isoMatch = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/.exec(
    trimmed
  );
  if (isoMatch) {
    const datePart = isoMatch[1];
    const hours = Number(isoMatch[2]);
    const minutes = Number(isoMatch[3]);
    const seconds = Number(isoMatch[4] ?? "0");
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null;
    }
    // Normalizamos a UTC con la hora nominal para comparaciones consistentes en BD
    const normalizedIso = `${datePart}T${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.000Z`;
    const dateObj = new Date(normalizedIso);
    if (Number.isNaN(dateObj.getTime())) {
      return null;
    }
    return {
      dateObj,
      totalMinutes: hours * 60 + minutes,
      datePart,
    };
  }

  // Caso 3: Otro formato compatible con Date
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  const hours = parsed.getHours();
  const minutes = parsed.getMinutes();
  const datePart = parsed.toISOString().slice(0, 10);
  return {
    dateObj: parsed,
    totalMinutes: hours * 60 + minutes,
    datePart,
  };
}

/**
 * Valida que el rango esté dentro del horario operativo institucional (06:00 a 22:00).
 */
function isWithinOperatingHours(
  startMinutes: number,
  endMinutes: number,
  startDatePart: string,
  endDatePart: string
): boolean {
  if (startDatePart !== endDatePart) {
    return false;
  }
  if (
    startMinutes < OPERATING_START_MINUTES ||
    startMinutes >= OPERATING_END_MINUTES
  ) {
    return false;
  }
  if (
    endMinutes <= OPERATING_START_MINUTES ||
    endMinutes > OPERATING_END_MINUTES
  ) {
    return false;
  }
  return true;
}

// GET /api/reservations - Listar todas las reservas
export async function GET(): Promise<
  NextResponse<ReservationWithRelations[] | { error: string }>
> {
  try {
    const reservations: ReservationWithRelations[] =
      await prisma.reservation.findMany({
        include: {
          user: true,
          space: true,
        },
        orderBy: {
          startTime: "asc",
        },
      });

    return NextResponse.json(reservations, { status: 200 });
  } catch (error) {
    console.error("Error al listar reservas:", error);
    return NextResponse.json(
      { error: "Error interno al obtener las reservas." },
      { status: 500 }
    );
  }
}

// POST /api/reservations - Crear una solicitud de reserva con validación de horario y solapamiento
export async function POST(
  request: NextRequest
): Promise<NextResponse<Reservation | { error: string }>> {
  try {
    const body = (await request.json()) as CreateReservationBody;
    const { userId, email, spaceId, date, startTime, endTime } = body;

    // 1. Validar presencia de campos obligatorios
    const parsedSpaceId = Number(spaceId);
    if (!Number.isInteger(parsedSpaceId) || parsedSpaceId <= 0) {
      return NextResponse.json(
        { error: "Debe seleccionar un espacio académico válido (spaceId)." },
        { status: 400 }
      );
    }

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: "La hora de inicio (startTime) y hora de fin (endTime) son obligatorias." },
        { status: 400 }
      );
    }

    const parsedStart = parseDateTimeAndMinutes(startTime, date);
    const parsedEnd = parseDateTimeAndMinutes(endTime, date);

    if (!parsedStart || !parsedEnd) {
      return NextResponse.json(
        { error: "Formato de fecha u hora inválido." },
        { status: 400 }
      );
    }

    // 2. Validar que la hora de fin sea posterior a la hora de inicio
    if (parsedStart.dateObj >= parsedEnd.dateObj) {
      return NextResponse.json(
        { error: "La hora de fin debe ser posterior a la hora de inicio." },
        { status: 400 }
      );
    }

    // 3. Validar horario operativo de la institución (06:00 a 22:00)
    if (
      !isWithinOperatingHours(
        parsedStart.totalMinutes,
        parsedEnd.totalMinutes,
        parsedStart.datePart,
        parsedEnd.datePart
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Fuera de horario operativo: Las reservas solo están permitidas entre las 06:00 y las 22:00 del mismo día.",
        },
        { status: 400 }
      );
    }

    // 4. Verificar que el espacio exista y esté activo ("Disponible")
    const space = await prisma.space.findUnique({
      where: { id: parsedSpaceId },
    });

    if (!space) {
      return NextResponse.json(
        { error: "El espacio académico solicitado no existe." },
        { status: 404 }
      );
    }

    if (!space.isActive) {
      return NextResponse.json(
        { error: "El espacio seleccionado no se encuentra activo para reservas." },
        { status: 400 }
      );
    }

    // 5. Consultar Prisma para evitar solapamientos (overlapping) en el mismo espacio
    // Dos intervalos [startA, endA) y [startB, endB) se solapan si:
    // existing.startTime < nuevo.endTime AND existing.endTime > nuevo.startTime
    const overlappingReservation = await prisma.reservation.findFirst({
      where: {
        spaceId: parsedSpaceId,
        status: {
          in: ["Pendiente", "Aprobado"],
        },
        AND: [
          { startTime: { lt: parsedEnd.dateObj } },
          { endTime: { gt: parsedStart.dateObj } },
        ],
      },
    });

    if (overlappingReservation) {
      return NextResponse.json(
        {
          error:
            "Conflicto de horario: El espacio ya tiene una reserva pendiente o aprobada que se superpone con el horario solicitado.",
        },
        { status: 409 }
      );
    }

    // 6. Resolver o registrar el usuario solicitante (por userId o email institucional)
    let resolvedUserId: number;

    if (email && typeof email === "string" && email.trim().length > 0) {
      const normalizedEmail = email.trim().toLowerCase();
      const user = await prisma.user.upsert({
        where: { email: normalizedEmail },
        update: {},
        create: {
          email: normalizedEmail,
          role: "Estudiante",
        },
      });
      resolvedUserId = user.id;
    } else if (userId !== undefined && Number.isInteger(Number(userId)) && Number(userId) > 0) {
      const numericUserId = Number(userId);
      const existingUser = await prisma.user.findUnique({
        where: { id: numericUserId },
      });

      if (!existingUser) {
        return NextResponse.json(
          { error: `No existe un usuario con el id ${numericUserId}.` },
          { status: 404 }
        );
      }
      resolvedUserId = existingUser.id;
    } else {
      return NextResponse.json(
        { error: "Debe proporcionar el userId o el correo institucional (email) del solicitante." },
        { status: 400 }
      );
    }

    // 7. Crear la solicitud de reserva con estado "Pendiente"
    const reservationData: Prisma.ReservationUncheckedCreateInput = {
      userId: resolvedUserId,
      spaceId: parsedSpaceId,
      startTime: parsedStart.dateObj,
      endTime: parsedEnd.dateObj,
      status: "Pendiente",
    };

    const newReservation: Reservation = await prisma.reservation.create({
      data: reservationData,
    });

    return NextResponse.json(newReservation, { status: 201 });
  } catch (error) {
    console.error("Error al procesar la solicitud de reserva:", error);
    return NextResponse.json(
      { error: "Error interno al procesar la solicitud de reserva." },
      { status: 500 }
    );
  }
}
