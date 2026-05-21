"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleResetPassword(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://droovo-x4zh.vercel.app/reset-password",
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
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black text-slate-950">
            Mot de passe oublié
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Entrez votre email pour recevoir un lien de réinitialisation.
          </p>
        </div>

        {success ? (
          <div className="rounded-2xl bg-emerald-50 p-5 text-center">
            <p className="font-black text-emerald-700">
              Email envoyé
            </p>

            <p className="mt-2 text-sm text-slate-600">
              Vérifiez votre boîte mail pour réinitialiser votre mot de passe.
            </p>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                Adresse email
              </label>

              <input
                type="email"
                required
                placeholder="email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm outline-none transition focus:border-emerald-500"
              />
            </div>

            {error && (
              <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading
                ? "Envoi..."
                : "Recevoir le lien"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm font-black text-emerald-700"
          >
            ← Retour connexion
          </Link>
        </div>
      </div>
    </main>
  );
}
