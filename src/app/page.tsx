"use client";

import React, { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Space, Reservation, User } from "@prisma/client";

type UserRole = "Administrador" | "Estudiante";
type ReservationStatus = "Pendiente" | "Aprobado" | "Rechazado" | "Cancelado";

interface SessionUser {
  userId: number;
  email: string;
  role: UserRole;
}

type ReservationWithDetails = Reservation & {
  user?: User;
  space?: Space;
};

export default function SpacesManagementPage() {
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [reservations, setReservations] = useState<ReservationWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Estado del formulario de creación de espacios (Exclusivo Administrador)
  const [name, setName] = useState<string>("");
  const [capacity, setCapacity] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Estado del formulario de solicitud de reserva
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>("");
  const [reservationDate, setReservationDate] = useState<string>("2026-11-05");
  const [startTime, setStartTime] = useState<string>("08:00");
  const [endTime, setEndTime] = useState<string>("10:00");
  const [submittingReservation, setSubmittingReservation] =
    useState<boolean>(false);
  const [reservationError, setReservationError] = useState<string | null>(null);
  const [reservationSuccess, setReservationSuccess] = useState<string | null>(
    null
  );

  // Estado de actualización de reservas (Aprobación, Rechazo y Cancelación)
  const [updatingReservationId, setUpdatingReservationId] = useState<
    number | null
  >(null);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const sessionRes = await fetch("/api/auth/session");
      if (!sessionRes.ok) {
        router.push("/login");
        return;
      }
      const sessionData = (await sessionRes.json()) as {
        user: SessionUser | null;
      };
      if (!sessionData.user) {
        router.push("/login");
        return;
      }
      setSessionUser(sessionData.user);

      const [spacesRes, reservationsRes] = await Promise.all([
        fetch("/api/spaces"),
        fetch("/api/reservations"),
      ]);

      if (spacesRes.ok) {
        const spacesData: Space[] = await spacesRes.json();
        setSpaces(spacesData);
        const firstActive = spacesData.find((s) => s.isActive);
        if (firstActive && !selectedSpaceId) {
          setSelectedSpaceId(String(firstActive.id));
        }
      }

      if (reservationsRes.ok) {
        const reservationsData: ReservationWithDetails[] =
          await reservationsRes.json();
        setReservations(reservationsData);
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("Error al cargar los datos del sistema.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const handleCreateSpace = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/spaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          capacity: Number(capacity),
          isActive,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMsg(result.error || "Error al crear el espacio.");
        return;
      }

      const createdSpace: Space = result;
      setSpaces((prev) => [...prev, createdSpace]);
      if (!selectedSpaceId && createdSpace.isActive) {
        setSelectedSpaceId(String(createdSpace.id));
      }
      setName("");
      setCapacity("");
      setIsActive(true);
      setSuccessMsg(
        `Espacio "${createdSpace.name}" registrado exitosamente como ${
          createdSpace.isActive ? "Disponible" : "Inactivo"
        }.`
      );
    } catch (error) {
      console.error(error);
      setErrorMsg("Error de red al registrar el espacio.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (space: Space) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch(`/api/spaces/${space.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !space.isActive,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMsg(result.error || "No se pudo actualizar el espacio.");
        return;
      }

      const updatedSpace: Space = result;
      setSpaces((prev) =>
        prev.map((item) => (item.id === updatedSpace.id ? updatedSpace : item))
      );
    } catch (error) {
      console.error(error);
      setErrorMsg("Error al cambiar el estado del espacio.");
    }
  };

  const handleDeleteSpace = async (id: number) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch(`/api/spaces/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMsg(result.error || "No se pudo eliminar el espacio.");
        return;
      }

      setSpaces((prev) => prev.filter((item) => item.id !== id));
      setSuccessMsg("Espacio eliminado correctamente.");
    } catch (error) {
      console.error(error);
      setErrorMsg("Error al eliminar el espacio.");
    }
  };

  const handleCreateReservation = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setReservationError(null);
    setReservationSuccess(null);
    setActionMessage(null);
    setSubmittingReservation(true);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          spaceId: Number(selectedSpaceId),
          date: reservationDate,
          startTime: `${reservationDate}T${startTime}:00`,
          endTime: `${reservationDate}T${endTime}:00`,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setReservationError(
          result.error || "No se pudo registrar la reserva."
        );
        return;
      }

      setReservationSuccess(
        "Solicitud de reserva creada exitosamente con estado 'Pendiente'."
      );
      await fetchDashboardData();
    } catch (error) {
      console.error(error);
      setReservationError(
        "Error de red al procesar la solicitud de reserva."
      );
    } finally {
      setSubmittingReservation(false);
    }
  };

  const handleUpdateReservationStatus = async (
    reservationId: number,
    newStatus: ReservationStatus
  ) => {
    setActionMessage(null);
    setUpdatingReservationId(reservationId);

    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setActionMessage({
          type: "error",
          text: result.error || "No se pudo cambiar el estado de la reserva.",
        });
        return;
      }

      const updated: ReservationWithDetails = result;
      setReservations((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );

      setActionMessage({
        type: "success",
        text: `La reserva #${updated.id} ha cambiado su estado a "${updated.status}".`,
      });
    } catch (error) {
      console.error(error);
      setActionMessage({
        type: "error",
        text: "Error de red al actualizar la reserva.",
      });
    } finally {
      setUpdatingReservationId(null);
    }
  };

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case "Aprobado":
        return "bg-emerald-100 text-emerald-800";
      case "Rechazado":
        return "bg-red-100 text-red-800";
      case "Cancelado":
        return "bg-slate-200 text-slate-700";
      case "Pendiente":
      default:
        return "bg-amber-100 text-amber-800";
    }
  };

  const isAdmin = sessionUser?.role === "Administrador";
  const pendingReservations = reservations.filter(
    (r) => r.status === "Pendiente"
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Encabezado con usuario autenticado y cierre de sesión */}
      <header className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Sistema de Reservas Académicas
            </h1>
            <p className="text-sm text-slate-600">
              Gestión de Espacios, Solicitudes, Aprobaciones y Cancelaciones
            </p>
          </div>

          {sessionUser && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">
                  {sessionUser.email}
                </p>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    isAdmin
                      ? "bg-blue-100 text-blue-800"
                      : "bg-indigo-100 text-indigo-800"
                  }`}
                >
                  Rol: {sessionUser.role}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Sección 1: Gestión y Catálogo de Espacios */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">
                Registrar Nuevo Espacio
              </h2>
              <p className="text-xs text-slate-500 mb-5">
                Exclusivo para usuarios autenticados con rol Administrador.
              </p>

              {!isAdmin ? (
                <div className="rounded-lg bg-slate-100 border border-slate-200 p-4 text-xs text-slate-600">
                  Has iniciado sesión como <strong>Estudiante</strong>. Solo el rol{" "}
                  <strong>Administrador</strong> tiene permisos para crear o modificar espacios académicos.
                </div>
              ) : (
                <>
                  {errorMsg && (
                    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                      {errorMsg}
                    </div>
                  )}

                  {successMsg && (
                    <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
                      {successMsg}
                    </div>
                  )}

                  <form onSubmit={handleCreateSpace} className="space-y-4">
                    <div>
                      <label
                        htmlFor="space-name"
                        className="block text-sm font-medium text-slate-700 mb-1"
                      >
                        Nombre del espacio
                      </label>
                      <input
                        id="space-name"
                        type="text"
                        required
                        placeholder="Ej. Laboratorio de Física"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="space-capacity"
                        className="block text-sm font-medium text-slate-700 mb-1"
                      >
                        Capacidad (personas)
                      </label>
                      <input
                        id="space-capacity"
                        type="number"
                        min={1}
                        required
                        placeholder="Ej. 30"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        id="space-active"
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="space-active"
                        className="text-sm text-slate-700"
                      >
                        Marcar como Disponible (Activo)
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {submitting ? "Guardando..." : "Guardar Espacio"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </section>

          <section className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Catálogo de Espacios Académicos
                  </h2>
                  <p className="text-xs text-slate-500">
                    Laboratorios, auditorios y salas de cómputo registrados
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  Total: {spaces.length}
                </span>
              </div>

              {loading ? (
                <div className="py-12 text-center text-sm text-slate-500">
                  Cargando espacios académicos...
                </div>
              ) : spaces.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    No hay espacios registrados todavía
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                        <th className="py-3 px-3 font-semibold">ID</th>
                        <th className="py-3 px-3 font-semibold">Nombre</th>
                        <th className="py-3 px-3 font-semibold">Capacidad</th>
                        <th className="py-3 px-3 font-semibold">Estado</th>
                        {isAdmin && (
                          <th className="py-3 px-3 font-semibold text-right">
                            Acciones
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-sm">
                      {spaces.map((space) => (
                        <tr key={space.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-mono text-xs text-slate-500">
                            #{space.id}
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-900">
                            {space.name}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            {space.capacity} personas
                          </td>
                          <td className="py-3 px-3">
                            {space.isActive ? (
                              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                                Disponible
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                                Inactivo
                              </span>
                            )}
                          </td>
                          {isAdmin && (
                            <td className="py-3 px-3 text-right space-x-2">
                              <button
                                type="button"
                                onClick={() => handleToggleActive(space)}
                                className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                              >
                                {space.isActive ? "Desactivar" : "Activar"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSpace(space.id)}
                                className="text-xs font-medium text-red-600 hover:text-red-800 cursor-pointer"
                              >
                                Eliminar
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sección 2: Solicitud de Reservas y Panel de Aprobación / Cancelación */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">
                Solicitar Reserva de Espacio
              </h2>
              <p className="text-xs text-slate-500 mb-5">
                Horario operativo: 06:00 a 22:00. Máximo 4 horas consecutivas.
              </p>

              {reservationError && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  {reservationError}
                </div>
              )}

              {reservationSuccess && (
                <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
                  {reservationSuccess}
                </div>
              )}

              <form onSubmit={handleCreateReservation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Usuario solicitante
                  </label>
                  <input
                    type="email"
                    disabled
                    value={sessionUser?.email ?? ""}
                    className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="reservation-space"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Espacio académico
                  </label>
                  <select
                    id="reservation-space"
                    required
                    value={selectedSpaceId}
                    onChange={(e) => setSelectedSpaceId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="">Seleccione un espacio...</option>
                    {spaces.map((space) => (
                      <option key={space.id} value={space.id}>
                        {space.name} ({space.capacity} pers.) —{" "}
                        {space.isActive ? "Disponible" : "Inactivo"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="reservation-date"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Fecha
                  </label>
                  <input
                    id="reservation-date"
                    type="date"
                    required
                    value={reservationDate}
                    onChange={(e) => setReservationDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="reservation-start"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Hora inicio
                    </label>
                    <input
                      id="reservation-start"
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="reservation-end"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Hora fin
                    </label>
                    <input
                      id="reservation-end"
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingReservation || spaces.length === 0}
                  className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {submittingReservation
                    ? "Validando disponibilidad..."
                    : "Solicitar Reserva"}
                </button>
              </form>
            </div>
          </section>

          <section className="lg:col-span-2 space-y-6">
            {/* Panel de Administración: Aprobación de Solicitudes */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Panel de Administración: Aprobación de Solicitudes
                  </h2>
                  <p className="text-xs text-slate-500">
                    Gestión de solicitudes en estado Pendiente (Aprobar / Rechazar)
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                  Pendientes: {pendingReservations.length}
                </span>
              </div>

              {!isAdmin ? (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
                  Acceso restringido: Tu sesión tiene el rol{" "}
                  <strong>Estudiante</strong>. Solo los usuarios autenticados como{" "}
                  <strong>Administrador</strong> pueden aprobar o rechazar solicitudes de reserva.
                </div>
              ) : pendingReservations.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 py-8 text-center">
                  <p className="text-sm text-slate-600">
                    No hay solicitudes pendientes de aprobación en este momento.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                        <th className="py-2.5 px-3 font-semibold">ID</th>
                        <th className="py-2.5 px-3 font-semibold">Espacio</th>
                        <th className="py-2.5 px-3 font-semibold">
                          Solicitante
                        </th>
                        <th className="py-2.5 px-3 font-semibold">Horario</th>
                        <th className="py-2.5 px-3 font-semibold text-right">
                          Decisión Administrador
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-sm">
                      {pendingReservations.map((res) => (
                        <tr key={res.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-mono text-xs text-slate-500">
                            #{res.id}
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-900">
                            {res.space?.name ?? `Espacio #${res.spaceId}`}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            {res.user?.email ?? `Usuario #${res.userId}`}
                          </td>
                          <td className="py-3 px-3 text-slate-600 font-mono text-xs">
                            {new Date(res.startTime)
                              .toISOString()
                              .replace("T", " ")
                              .slice(0, 16)}{" "}
                            →{" "}
                            {new Date(res.endTime)
                              .toISOString()
                              .slice(11, 16)}
                          </td>
                          <td className="py-3 px-3 text-right space-x-2">
                            <button
                              type="button"
                              disabled={updatingReservationId === res.id}
                              onClick={() =>
                                handleUpdateReservationStatus(
                                  res.id,
                                  "Aprobado"
                                )
                              }
                              className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                            >
                              Aprobar
                            </button>
                            <button
                              type="button"
                              disabled={updatingReservationId === res.id}
                              onClick={() =>
                                handleUpdateReservationStatus(
                                  res.id,
                                  "Rechazado"
                                )
                              }
                              className="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                            >
                              Rechazar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Historial General y Opción de Cancelación para el Usuario */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Historial de Reservas y Cancelación de Usuario
                  </h2>
                  <p className="text-xs text-slate-500">
                    Registro histórico inmutable. El usuario puede cancelar reservas activas para liberar el espacio.
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  Total: {reservations.length}
                </span>
              </div>

              {actionMessage && (
                <div
                  className={`mb-4 rounded-lg border p-3 text-sm ${
                    actionMessage.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  {actionMessage.text}
                </div>
              )}

              {reservations.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 py-10 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    No hay reservas registradas en el historial
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                        <th className="py-3 px-3 font-semibold">ID</th>
                        <th className="py-3 px-3 font-semibold">Espacio</th>
                        <th className="py-3 px-3 font-semibold">
                          Solicitante
                        </th>
                        <th className="py-3 px-3 font-semibold">Inicio</th>
                        <th className="py-3 px-3 font-semibold">Fin</th>
                        <th className="py-3 px-3 font-semibold">Estado</th>
                        <th className="py-3 px-3 font-semibold text-right">
                          Acción Usuario
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-sm">
                      {reservations.map((res) => {
                        const canCancel =
                          res.status === "Pendiente" ||
                          res.status === "Aprobado";

                        return (
                          <tr key={res.id} className="hover:bg-slate-50">
                            <td className="py-3 px-3 font-mono text-xs text-slate-500">
                              #{res.id}
                            </td>
                            <td className="py-3 px-3 font-medium text-slate-900">
                              {res.space?.name ?? `Espacio #${res.spaceId}`}
                            </td>
                            <td className="py-3 px-3 text-slate-600">
                              {res.user?.email ?? `Usuario #${res.userId}`}
                            </td>
                            <td className="py-3 px-3 text-slate-600 font-mono text-xs">
                              {new Date(res.startTime)
                                .toISOString()
                                .replace("T", " ")
                                .slice(0, 16)}
                            </td>
                            <td className="py-3 px-3 text-slate-600 font-mono text-xs">
                              {new Date(res.endTime)
                                .toISOString()
                                .replace("T", " ")
                                .slice(0, 16)}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClasses(
                                  res.status
                                )}`}
                              >
                                {res.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              {canCancel ? (
                                <button
                                  type="button"
                                  disabled={updatingReservationId === res.id}
                                  onClick={() =>
                                    handleUpdateReservationStatus(
                                      res.id,
                                      "Cancelado"
                                    )
                                  }
                                  className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
                                >
                                  Cancelar reserva
                                </button>
                              ) : (
                                <span className="text-xs text-slate-400">
                                  Sin acciones
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
