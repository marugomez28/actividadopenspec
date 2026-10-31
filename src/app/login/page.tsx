"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type UserRole = "Administrador" | "Estudiante";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("juan@universidad.edu");
  const [role, setRole] = useState<UserRole>("Estudiante");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const performLogin = async (loginEmail: string, loginRole: UserRole) => {
    setErrorMsg(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          role: loginRole,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMsg(result.error || "Error al iniciar sesión.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error(error);
      setErrorMsg("Error de red al intentar iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await performLogin(email, role);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="text-center mb-6">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 mb-2">
            Acceso Institucional
          </span>
          <h1 className="text-2xl font-bold text-slate-900">
            Sistema de Reservas Académicas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Inicia sesión con tu correo institucional para continuar
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Correo institucional
            </label>
            <input
              id="login-email"
              type="email"
              required
              placeholder="usuario@universidad.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="login-role"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Rol de acceso
            </label>
            <select
              id="login-role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            >
              <option value="Estudiante">
                Estudiante (Solo solicitar y cancelar reservas)
              </option>
              <option value="Administrador">
                Administrador (Crear espacios y aprobar reservas)
              </option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider text-center mb-3">
            Acceso rápido de demostración
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setEmail("admin@universidad.edu");
                setRole("Administrador");
                performLogin("admin@universidad.edu", "Administrador");
              }}
              className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer"
            >
              Entrar como Administrador
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setEmail("juan@universidad.edu");
                setRole("Estudiante");
                performLogin("juan@universidad.edu", "Estudiante");
              }}
              className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer"
            >
              Entrar como Estudiante
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
