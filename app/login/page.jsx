"use client";

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

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert("Erreur connexion : " + error.message);
      return;
    }

    if (!data.user) {
      alert("Utilisateur introuvable.");
      return;
    }

    if (ADMIN_EMAILS.includes(email.toLowerCase())) {
      router.push("/admin");
    } else {
      router.push("/dashboard");
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
      </div>
    </main>
  );
}
