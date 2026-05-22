"use client";

import { useEffect, useState } from "react";
import { Package, Truck, MapPin, Calendar } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

export default function MesColisPage() {
  const [packages, setPackages] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

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

    const { data: userPackages } = await supabase
      .from("packages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const { data: allTrips } = await supabase
      .from("trips")
      .select("*")
      .eq("status", "active")
      .neq("user_id", user.id);

    setPackages(userPackages || []);
    setTrips(allTrips || []);

    setLoading(false);
  }

  function getCompatibleTrips(pkg) {
    return trips.filter((trip) => {
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

  async function handleBookTrip(pkg, trip) {
    setBookingLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Vous devez être connecté.");
        return;
      }

      const { error } = await supabase.from("bookings").insert({
        package_id: pkg.id,
        trip_id: trip.id,
        sender_id: user.id,
        driver_id: trip.user_id,
        status: "pending",
      });

      if (error) {
        throw error;
      }

      await supabase
        .from("packages")
        .update({ status: "reserved" })
        .eq("id", pkg.id);

      alert("Demande envoyée au livreur.");

      await loadData();
    } catch (error) {
      alert("Erreur : " + error.message);
    }

    setBookingLoading(false);
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
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">
            Mes colis
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
            Colis publiés
          </h1>

          <p className="mt-2 text-slate-600">
            Retrouvez vos colis et les trajets compatibles.
          </p>
        </div>

        <div className="grid gap-8">
          {packages.length === 0 && (
            <div className="rounded-[2rem] bg-white p-10 shadow-sm ring-1 ring-emerald-100">
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
                className="overflow-hidden rounded-[2rem] bg-white shadow-xl ring-1 ring-emerald-100"
              >
                <div className="grid lg:grid-cols-[360px_1fr]">
                  <div className="relative bg-slate-100">
                    {pkg.image_url ? (
                      <img
                        src={pkg.image_url}
                        alt={pkg.title}
                        className="h-full min-h-[320px] w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full min-h-[320px] items-center justify-center">
                        <Package
                          size={70}
                          className="text-slate-300"
                        />
                      </div>
                    )}

                    <div className="absolute left-5 top-5 rounded-full bg-black/70 px-4 py-2 text-xs font-black uppercase tracking-wide text-white backdrop-blur-sm">
                      {pkg.status || "active"}
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                      <div>
                        <h2 className="text-3xl font-black text-slate-950">
                          {pkg.title}
                        </h2>

                        <p className="mt-3 max-w-2xl text-slate-600">
                          {pkg.description || "Aucune description."}
                        </p>
                      </div>

                      <div className="rounded-[1.5rem] bg-emerald-50 px-5 py-4 text-center ring-1 ring-emerald-100">
                        <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                          Prix
                        </p>

                        <p className="mt-1 text-3xl font-black text-slate-950">
                          {pkg.price} €
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                      <InfoCard
                        icon={MapPin}
                        label="Trajet"
                        value={`${pkg.departure_city} → ${pkg.arrival_city}`}
                      />

                      <InfoCard
                        icon={Calendar}
                        label="Date"
                        value={
                          pkg.desired_date
                            ? new Date(pkg.desired_date).toLocaleDateString(
                                "fr-FR"
                              )
                            : "Non renseignée"
                        }
                      />

                      <InfoCard
                        icon={Package}
                        label="Poids"
                        value={`${pkg.weight} kg`}
                      />
                    </div>

                    <div className="mt-8">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-950">
                          Trajets compatibles
                        </h3>

                        <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700">
                          {compatibleTrips.length} trouvé(s)
                        </div>
                      </div>

                      <div className="grid gap-4">
                        {compatibleTrips.length === 0 && (
                          <div className="rounded-[1.5rem] bg-slate-100 p-5 text-slate-600">
                            Aucun trajet compatible pour le moment.
                          </div>
                        )}

                        {compatibleTrips.map((trip) => (
                          <div
                            key={trip.id}
                            className="flex flex-wrap items-center justify-between gap-5 rounded-[1.5rem] border border-emerald-100 bg-white p-5"
                          >
                            <div className="flex items-start gap-4">
                              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                                <Truck size={24} />
                              </div>

                              <div>
                                <p className="font-black text-slate-950">
                                  {trip.departure_city} →{" "}
                                  {trip.arrival_city}
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                  {trip.available_weight} kg disponibles
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                  {trip.trip_date
                                    ? new Date(
                                        trip.trip_date
                                      ).toLocaleDateString("fr-FR")
                                    : "Date non renseignée"}
                                </p>
                              </div>
                            </div>

                            <button
                              disabled={bookingLoading}
                              onClick={() =>
                                handleBookTrip(pkg, trip)
                              }
                              className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-60"
                            >
                              {bookingLoading
                                ? "Réservation..."
                                : "Réserver"}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[1.5rem] bg-slate-50 p-5 ring-1 ring-slate-100">
      <Icon className="text-emerald-700" size={22} />

      <p className="mt-4 text-sm font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-black text-slate-950">
        {value}
      </p>
    </div>
  );
}
