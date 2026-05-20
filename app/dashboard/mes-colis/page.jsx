"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function MesColisPage() {
  const [packages, setPackages] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: userPackages } = await supabase
      .from("packages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const { data: allTrips } = await supabase
      .from("trips")
      .select("*")
      .eq("status", "active");

    setPackages(userPackages || []);
    setTrips(allTrips || []);

    setLoading(false);
  }

  function getCompatibleTrips(pkg) {
    return trips.filter((trip) => {
      return (
        trip.from_city?.toLowerCase().trim() ===
          pkg.departure_city?.toLowerCase().trim() &&
        trip.to_city?.toLowerCase().trim() ===
          pkg.arrival_city?.toLowerCase().trim() &&
        Number(trip.available_weight) >= Number(pkg.weight)
      );
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F4F7F5] p-10">
        <p className="text-xl font-black">Chargement...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F7F5] px-6 py-10">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">
            Mes colis
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
            Colis publiés
          </h1>
        </div>

        <div className="grid gap-6">

          {packages.length === 0 && (
            <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-emerald-100">
              <p className="text-lg font-bold text-slate-700">
                Aucun colis publié.
              </p>
            </div>
          )}

          {packages.map((pkg) => {
            const compatibleTrips = getCompatibleTrips(pkg);

            return (
              <div
                key={pkg.id}
                className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-emerald-100"
              >

                <div className="flex flex-wrap items-start justify-between gap-4">

                  <div>
                    <h2 className="text-2xl font-black text-slate-950">
                      {pkg.title}
                    </h2>

                    <p className="mt-2 text-slate-600">
                      {pkg.departure_city} → {pkg.arrival_city}
                    </p>

                    <p className="mt-2 text-slate-500">
                      {pkg.weight} kg • {pkg.price} €
                    </p>
                  </div>

                  <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700">
                    {compatibleTrips.length} trajet(s) compatible(s)
                  </div>

                </div>

                <div className="mt-6 grid gap-4">

                  {compatibleTrips.length === 0 && (
                    <div className="rounded-2xl bg-slate-100 p-5 text-slate-600">
                      Aucun trajet compatible pour le moment.
                    </div>
                  )}

                  {compatibleTrips.map((trip) => (
                    <div
                      key={trip.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-100 p-5"
                    >

                      <div>
                        <p className="font-black text-slate-950">
                          {trip.from_city} → {trip.to_city}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {trip.available_weight} kg disponibles
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Date :
                          {" "}
                          {trip.trip_date
                            ? new Date(trip.trip_date).toLocaleDateString("fr-FR")
                            : "Date non renseignée"}
                        </p>
                      </div>

                      <button
                        className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700"
                      >
                        Contacter
                      </button>

                    </div>
                  ))}

                </div>

              </div>
            );
          })}

        </div>
      </div>
    </main>
  );
}
