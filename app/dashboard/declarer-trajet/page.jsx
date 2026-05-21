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

  const pricing = useMemo(() => {
    const laposteRates = [
      { maxWeight: 0.5, price: 7.59 },
      { maxWeight: 1, price: 9.59 },
      { maxWeight: 2, price: 11.19 },
      { maxWeight: 5, price: 17.39 },
      { maxWeight: 10, price: 25.29 },
      { maxWeight: 15, price: 31.99 },
      { maxWeight: 30, price: 39.59 },
    ];

    const laposte =
      laposteRates.find((rate) => availableWeight <= rate.maxWeight)?.price ||
      39.59;

    const droovoPrice = Math.max(4.9, laposte * 0.75);
    const driverGain = droovoPrice * 0.78;
    const commission = droovoPrice * 0.22;

    return {
      laposte: laposte.toFixed(2),
      droovoPrice: droovoPrice.toFixed(2),
      driverGain: driverGain.toFixed(2),
      commission: commission.toFixed(2),
    };
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

        departure_city: fromCity,
        arrival_city: toCity,

        trip_date: date,
        available_weight: availableWeight,
        estimated_gain: pricing.driverGain,
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
                  Capacité maximale pour un colis compatible : {availableWeight} kg
                </label>

                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={availableWeight}
                  onChange={(e) => setAvailableWeight(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />

                <p className="mt-2 text-sm text-slate-500">
                  Cette capacité sert à estimer le gain pour un colis compatible.
                  Le revenu total dépendra du nombre de colis acceptés.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-emerald-600 px-5 py-4 font-black text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {loading ? "Publication..." : "Publier mon trajet"}
              </button>
            </form>
          </div>

          <aside className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-300">
              Revenus estimés
            </p>

            <div className="mt-6 rounded-2xl bg-emerald-400/15 p-5">
              <p className="text-sm text-white/60">
                Gain estimé par colis compatible
              </p>

              <p className="mt-2 text-4xl font-black">
                {pricing.driverGain} €
              </p>
            </div>

            <div className="mt-4 grid gap-3">
              <PriceLine
                label="Prix Droovo client"
                value={`${pricing.droovoPrice} €`}
              />

              <PriceLine
                label="Prix La Poste estimé"
                value={`${pricing.laposte} €`}
              />

              <PriceLine
                label="Commission Droovo"
                value={`${pricing.commission} €`}
              />
            </div>

            <p className="mt-6 text-sm leading-6 text-white/60">
              Le gain affiché correspond à un colis compatible avec la capacité
              indiquée. Le revenu total dépendra du nombre de colis acceptés sur
              votre trajet.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

function PriceLine({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="text-sm text-white/55">{label}</p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}
