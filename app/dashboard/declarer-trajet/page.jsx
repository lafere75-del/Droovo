"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function DeclarerTrajetPage() {
  const router = useRouter();

  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [date, setDate] = useState("");
  const [availableWeight, setAvailableWeight] = useState(5);

  const [loading, setLoading] = useState(false);

  const estimatedGain = useMemo(() => {
    return (availableWeight * 2.2).toFixed(2);
  }, [availableWeight]);

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Vous devez être connecté.");
        return;
      }

      const { error } = await supabase.from("trips").insert({
        user_id: user.id,
        from_city: fromCity,
        to_city: toCity,
        trip_date: date,
        available_weight: availableWeight,
        estimated_gain: estimatedGain,
        status: "active",
      });

      if (error) {
        throw error;
      }

      alert("Trajet publié avec succès.");

      router.push("/dashboard");

    } catch (error) {
      alert(error.message);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#F4F7F5] px-6 py-10">
      <div className="mx-auto max-w-5xl">

        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">
              Espace utilisateur
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
              Déclarer un trajet
            </h1>

            <p className="mt-2 text-slate-600">
              Indiquez votre trajet et transportez des colis compatibles.
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-2xl border border-emerald-100 bg-white px-5 py-3 font-black text-slate-900"
          >
            Retour dashboard
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">

          <div className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-emerald-100">

            <form onSubmit={handleSubmit} className="grid gap-5">

              <div className="grid gap-5 md:grid-cols-2">

                <input
                  required
                  type="text"
                  placeholder="Ville de départ"
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value)}
                  className="rounded-2xl border border-emerald-100 px-5 py-4 outline-none focus:border-emerald-600"
                />

                <input
                  required
                  type="text"
                  placeholder="Ville d’arrivée"
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value)}
                  className="rounded-2xl border border-emerald-100 px-5 py-4 outline-none focus:border-emerald-600"
                />

              </div>

              <input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-2xl border border-emerald-100 px-5 py-4 outline-none focus:border-emerald-600"
              />

              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  Capacité disponible : {availableWeight} kg
                </label>

                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={availableWeight}
                  onChange={(e) =>
                    setAvailableWeight(Number(e.target.value))
                  }
                  className="w-full accent-emerald-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-emerald-600 px-5 py-4 font-black text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {loading
                  ? "Publication..."
                  : "Publier mon trajet"}
              </button>

            </form>
          </div>

          <aside className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl">

            <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-300">
              Revenus estimés
            </p>

            <div className="mt-6 rounded-2xl bg-emerald-400/15 p-5">
              <p className="text-sm text-white/60">
                Gain potentiel estimé
              </p>

              <p className="mt-2 text-4xl font-black">
                {estimatedGain} €
              </p>
            </div>

            <p className="mt-6 text-sm leading-6 text-white/60">
              Les revenus varient selon le nombre de colis transportés,
              le trajet et le poids disponible.
            </p>

          </aside>

        </div>
      </div>
    </main>
  );
}
