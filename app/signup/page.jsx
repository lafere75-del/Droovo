"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
export default function SignupPage() {
  const router = useRouter();

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);

    if (!fullname || !email || !password) {
      alert("Veuillez remplir tous les champs.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;

    if (userId) {
      await supabase.from("profiles").insert({
        id: userId,
        fullname,
        email,
        role: "user",
        identity_status: "pending",
      });
    }

    alert("Compte créé. Vérifiez votre e-mail si Supabase demande une confirmation.");
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F7F5] px-6">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-emerald-100">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">
          Inscription
        </p>

        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
          Créer un compte
        </h1>

        <p className="mt-3 text-slate-600">
          Créez votre compte Droovo. La vérification d’identité sera demandée ensuite.
        </p>

        <form onSubmit={handleSignup} className="mt-8 grid gap-4">
          <input
            required
            type="text"
            placeholder="Nom complet"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            className="rounded-2xl border border-emerald-100 px-5 py-4 outline-none focus:border-emerald-600"
          />

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
            {loading ? "Création en cours..." : "Créer mon compte"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Déjà un compte ?
          <a href="/login" className="ml-1 font-black text-emerald-700">
            Se connecter
          </a>
        </p>
      </div>
    </main>
  );
}
