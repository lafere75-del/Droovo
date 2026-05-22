"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const ADMIN_EMAILS = ["droovo@mosolar.fr"];

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    setLoading(false);

    if (error) {
      alert("Erreur connexion : " + error.message);
      return;
    }

    if (ADMIN_EMAILS.includes(cleanEmail)) {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F7F5] px-6 py-10">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-emerald-100">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black tracking-tight text-slate-950">
            Se connecter
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Accédez à votre compte Droovo.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-black text-slate-700">
              Adresse email
            </label>

            <input
              required
              type="email"
              placeholder="Adresse e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-emerald-100 bg-slate-50 px-5 py-4 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-slate-700">
              Mot de passe
            </label>

            <input
              required
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-emerald-100 bg-slate-50 px-5 py-4 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm font-black text-emerald-700 hover:text-emerald-800"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-600 px-5 py-4 font-black text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Pas encore de compte ?
          </p>

          <Link
            href="/signup"
            className="mt-2 inline-block text-sm font-black text-emerald-700 hover:text-emerald-800"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </main>
  );
}
