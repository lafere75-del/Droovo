"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { calculatePricing } from "../../../lib/pricing";
import AddressAutocomplete, { authHeaders } from "../../../components/AddressAutocomplete";

export default function DeclarerTrajetPage() {
  const router = useRouter();

  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [fromPlace, setFromPlace] = useState(null);
  const [toPlace, setToPlace] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [date, setDate] = useState("");
  const [availableWeight, setAvailableWeight] = useState(5);

  const [loading, setLoading] = useState(false);

  const distanceKm = routeInfo ? routeInfo.distanceMeters / 1000 : null;
  const pricing = useMemo(() => calculatePricing(availableWeight, distanceKm), [availableWeight, distanceKm]);

  useEffect(() => {
    if (!fromPlace || !toPlace) { setRouteInfo(null); return; }
    let cancelled = false;
    async function calculateRoute() {
      const response = await fetch("/api/maps/route", {
        method: "POST", headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ originPlaceId: fromPlace.placeId, destinationPlaceId: toPlace.placeId }),
      });
      const data = await response.json();
      if (!cancelled) setRouteInfo(response.ok ? data : null);
    }
    calculateRoute();
    return () => { cancelled = true; };
  }, [fromPlace, toPlace]);

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

      if (!fromPlace || !toPlace || !routeInfo) {
        alert("Sélectionnez les deux adresses proposées afin de calculer la distance réelle.");
        return;
      }

      const response = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({
          originPlaceId: fromPlace.placeId,
          destinationPlaceId: toPlace.placeId,
          tripDate: date,
          availableWeight,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Publication impossible.");
      }

      alert("Trajet publié avec succès.");

      router.push("/dashboard");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
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
                <AddressAutocomplete
                  placeholder="Ville de départ"
                  value={fromCity}
                  onChange={setFromCity}
                  onSelect={setFromPlace}
                />

                <AddressAutocomplete
                  placeholder="Ville d’arrivée"
                  value={toCity}
                  onChange={setToCity}
                  onSelect={setToPlace}
                />
              </div>

              {routeInfo && <p className="rounded-2xl bg-emerald-50 px-5 py-4 text-sm font-black text-emerald-800">
                Distance réelle : {(routeInfo.distanceMeters / 1000).toFixed(0)} km · environ {Math.max(1, Math.round(routeInfo.durationSeconds / 60))} min
              </p>}

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
