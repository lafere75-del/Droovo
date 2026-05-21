"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function MesTrajetsPage() {
  const [trips, setTrips] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: myTrips } = await supabase
      .from("trips")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const { data: activePackages } = await supabase
      .from("packages")
      .select("*")
      .eq("status", "active")
      .neq("user_id", user.id);

    setTrips(myTrips || []);
    setPackages(activePackages || []);
    setLoading(false);
  }

  function getCompatiblePackages(trip) {
    return packages.filter((pkg) => {
      return (
        trip.departure_city?.toLowerCase().trim() ===
          pkg.departure_city?.toLowerCase().trim() &&
        trip.arrival_city?.toLowerCase().trim() ===
          pkg.arrival_city?.toLowerCase().trim() &&
        trip.trip_date === pkg.desired_date &&
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
            Mes trajets
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
            Trajets publiés
          </h1>

          <p className="mt-2 text-slate-600">
            Retrouvez vos trajets et les colis compatibles à transporter.
          </p>
        </div>

        <div className="grid gap-6">
          {trips.length === 0 && (
            <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-emerald-100">
              <p className="text-lg font-bold text-slate-700">
                Aucun trajet publié.
              </p>
            </div>
          )}

          {trips.map((trip) => {
            const compatiblePackages = getCompatiblePackages(trip);

            return (
              <div
                key={trip.id}
                className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-emerald-100"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-slate-950">
                      {trip.departure_city} → {trip.arrival_city}
                    </h2>

                    <p className="mt-2 text-slate-600">
                      Date :{" "}
                      {trip.trip_date
                        ? new Date(trip.trip_date).toLocaleDateString("fr-FR")
                        : "Date non renseignée"}
                    </p>

                    <p className="mt-2 text-slate-500">
                      Capacité : {trip.available_weight} kg disponibles
                    </p>
                  </div>

                  <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700">
                    {compatiblePackages.length} colis compatible(s)
                  </div>
                </div>

                <div className="mt-6 grid gap-4">
                  {compatiblePackages.length === 0 && (
                    <div className="rounded-2xl bg-slate-100 p-5 text-slate-600">
                      Aucun colis compatible pour le moment.
                    </div>
                  )}

                  {compatiblePackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-100 p-5"
                    >
                      <div>
                        <p className="font-black text-slate-950">
                          {pkg.title || "Colis sans titre"}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {pkg.departure_city} → {pkg.arrival_city}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {pkg.weight} kg · {pkg.price} €
                        </p>
                      </div>

                      <button className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700">
                        Proposer de transporter
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
