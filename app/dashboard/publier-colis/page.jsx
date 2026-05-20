"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function PublierColisPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [weight, setWeight] = useState(3);
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
      laposteRates.find((rate) => weight <= rate.maxWeight)?.price || 39.59;

    const droovoPrice = Math.max(4.9, laposte * 0.75);
    const commission = droovoPrice * 0.22;
    const driverGain = droovoPrice - commission;
    const saving = laposte - droovoPrice;

    return {
      laposte: laposte.toFixed(2),
      droovoPrice: droovoPrice.toFixed(2),
      commission: commission.toFixed(2),
      driverGain: driverGain.toFixed(2),
      saving: saving.toFixed(2),
    };
  }, [weight]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Vous devez être connecté.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("packages").insert({
      user_id: user.id,
      title,
      description,

      departure_city: fromCity,
      arrival_city: toCity,

      weight,
      price: pricing.droovoPrice,
      status: "active",
    });

    setLoading(false);

    if (error) {
      alert("Erreur : " + error.message);
      return;
    }

    alert("Colis publié avec succès.");
    router.push("/dashboard");
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
              Publier un colis
            </h1>
            <p className="mt-2 text-slate-600">
              Renseignez votre colis. Droovo calcule automatiquement le prix.
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
              <input
                required
                type="text"
                placeholder="Titre du colis"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-2xl border border-emerald-100 px-5 py-4 outline-none focus:border-emerald-600"
              />

              <textarea
                placeholder="Description du colis"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px] rounded-2xl border border-emerald-100 px-5 py-4 outline-none focus:border-emerald-600"
              />

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
                  placeholder="Ville d'arrivée"
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value)}
                  className="rounded-2xl border border-emerald-100 px-5 py-4 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  Poids du colis : {weight} kg
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-4 rounded-2xl bg-emerald-600 px-5 py-4 font-black text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {loading
                  ? "Publication..."
                  : `Publier à ${pricing.droovoPrice} €`}
              </button>
            </form>
          </div>

          <aside className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-300">
              Prix Droovo
            </p>

            <div className="mt-6 grid gap-4">
              <PriceLine
                label="Prix La Poste estimé"
                value={`${pricing.laposte} €`}
              />
              <PriceLine
                label="Prix Droovo client"
                value={`${pricing.droovoPrice} €`}
                highlight
              />
              <PriceLine
                label="Économie client"
                value={`${pricing.saving} €`}
              />
              <PriceLine
                label="Gain livreur"
                value={`${pricing.driverGain} €`}
                highlight
              />
              <PriceLine
                label="Commission Droovo"
                value={`${pricing.commission} €`}
              />
            </div>

            <p className="mt-6 text-sm leading-6 text-white/50">
              Le prix est calculé automatiquement à partir du poids du colis,
              avec un positionnement inférieur au tarif Colissimo indicatif.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

function PriceLine({ label, value, highlight }) {
  return (
    <div
      className={`rounded-2xl p-4 ${
        highlight ? "bg-emerald-400/15" : "bg-white/10"
      }`}
    >
      <p className="text-sm text-white/55">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
  );
}
