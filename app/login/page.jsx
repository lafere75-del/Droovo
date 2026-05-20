"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert("Erreur connexion : " + error.message);
        return;
      }

      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F7F5] px-6">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-emerald-100">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">
          Connexion
        </p>

        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
          Se connecter
        </h1>

        <p className="mt-3 text-slate-600">
          Connectez-vous pour accéder à votre espace Droovo.
        </p>

        <form onSubmit={handleLogin} className="mt-8 grid gap-4">
          <input
            required
            type="email"
            placeholder="Adresse e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-2xl border border-emerald-100 px-5 py-4 outline-none focus:border-emerald-600"
          />

          <input
            required
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-2xl border border-emerald-100 px-5 py-4 outline-none focus:border-emerald-600"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-emerald-600 px-5 py-4 font-black text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Pas encore de compte ?
          <a href="/signup" className="ml-1 font-black text-emerald-700">
            Créer un compte
          </a>
        </p>
      </div>
    </main>
  );
}
