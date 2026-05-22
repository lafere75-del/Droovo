"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleUpdatePassword(e) {
    e.preventDefault();

    setError("");

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }

    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F7F5] px-6 py-10">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-emerald-100">
        <h1 className="text-4xl font-black text-slate-950">
          Nouveau mot de passe
        </h1>

        <p className="mt-3 text-sm text-slate-500">
          Choisissez un nouveau mot de passe pour votre compte Droovo.
        </p>

        {success ? (
          <div className="mt-8 rounded-2xl bg-emerald-50 p-5 text-center">
            <p className="font-black text-emerald-700">
              Mot de passe modifié
            </p>

            <Link
              href="/login"
              className="mt-5 inline-block rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white"
            >
              Se connecter
            </Link>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="mt-8 space-y-5">
            <input
              type="password"
              required
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm outline-none focus:border-emerald-500"
            />

            <input
              type="password"
              required
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm outline-none focus:border-emerald-500"
            />

            {error && (
              <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? "Modification..." : "Modifier le mot de passe"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
