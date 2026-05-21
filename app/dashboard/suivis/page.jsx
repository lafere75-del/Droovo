"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function SuivisPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("bookings")
      .select(`
        *,
        packages (*),
        trips (*)
      `)
      .or(`sender_id.eq.${user.id},driver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    setBookings(data || []);
    setLoading(false);
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

        <div className="mb-6">
          <Link
            href="/dashboard"
            className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
          >
            ← Retour dashboard
          </Link>
        </div>

        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">
            Suivis
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
            Suivi des livraisons
          </h1>

          <p className="mt-2 text-slate-600">
            Retrouvez tous vos colis et transports en cours.
          </p>
        </div>

        <div className="grid gap-5">
          {bookings.length === 0 && (
            <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-emerald-100">
              <p className="text-lg font-bold text-slate-700">
                Aucun suivi disponible.
              </p>
            </div>
          )}

          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-emerald-100"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">

                <div>
                  <h2 className="text-2xl font-black text-slate-950">
                    {booking.packages?.title || "Colis"}
                  </h2>

                  <p className="mt-2 text-slate-600">
                    {booking.packages?.departure_city || "Départ"} →{" "}
                    {booking.packages?.arrival_city || "Arrivée"}
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Prix : {booking.packages?.price || 0} €
                  </p>
                </div>

                <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700">
                  {formatStatus(
                    booking.tracking_status || "booking_created"
                  )}
                </div>

              </div>

              <div className="mt-6 flex flex-wrap gap-3">

                <Link
                  href={`/dashboard/suivi/${booking.id}`}
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800"
                >
                  Voir le suivi
                </Link>

                <Link
                  href="/dashboard/messages"
                  className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  Messages
                </Link>

              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function formatStatus(status) {
  const labels = {
    booking_created: "Demande créée",
    accepted: "Acceptée",
    paid: "Payée",
    picked_up: "Colis récupéré",
    in_transit: "En cours de livraison",
    delivered: "Livré",
    cancelled: "Annulé",
    dispute: "Litige",
  };

  return labels[status] || status;
}
