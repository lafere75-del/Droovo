"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function DemandesPage() {
  const [driverRequests, setDriverRequests] = useState([]);
  const [senderRequests, setSenderRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // DEMANDES RECUES EN TANT QUE LIVREUR
    const { data: driverData } = await supabase
      .from("bookings")
      .select(`
        *,
        packages (*),
        trips (*)
      `)
      .eq("driver_id", user.id)
      .order("created_at", { ascending: false });

    // DEMANDES RECUES EN TANT QU'EXPEDITEUR
    const { data: senderData } = await supabase
      .from("bookings")
      .select(`
        *,
        packages (*),
        trips (*)
      `)
      .eq("sender_id", user.id)
      .order("created_at", { ascending: false });

    setDriverRequests(driverData || []);
    setSenderRequests(senderData || []);

    setLoading(false);
  }

  async function updateBookingStatus(booking, status) {
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", booking.id);

      if (error) {
        throw error;
      }

      // MAJ COLIS
      if (status === "accepted") {
        await supabase
          .from("packages")
          .update({ status: "accepted" })
          .eq("id", booking.package_id);
      }

      if (status === "rejected") {
        await supabase
          .from("packages")
          .update({ status: "active" })
          .eq("id", booking.package_id);
      }

      alert(
        status === "accepted"
          ? "Demande acceptée."
          : "Demande refusée."
      );

      await loadRequests();

    } catch (error) {
      alert("Erreur : " + error.message);
    }

    setActionLoading(false);
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

        <div className="mb-10">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">
            Demandes
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
            Centre des demandes Droovo
          </h1>

          <p className="mt-2 text-slate-600">
            Gérez vos demandes de transport et vos propositions reçues.
          </p>
        </div>

        {/* LIVREUR */}

        <section className="mb-12">
          <div className="mb-5">
            <h2 className="text-2xl font-black text-slate-950">
              Demandes reçues comme livreur
            </h2>

            <p className="mt-1 text-slate-600">
              Des expéditeurs souhaitent réserver vos trajets.
            </p>
          </div>

          <div className="grid gap-5">

            {driverRequests.length === 0 && (
              <EmptyCard text="Aucune demande reçue comme livreur." />
            )}

            {driverRequests.map((request) => (
              <BookingCard
                key={request.id}
                booking={request}
                actionLoading={actionLoading}
                onAccept={() =>
                  updateBookingStatus(request, "accepted")
                }
                onReject={() =>
                  updateBookingStatus(request, "rejected")
                }
              />
            ))}

          </div>
        </section>

        {/* EXPEDITEUR */}

        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-black text-slate-950">
              Transporteurs intéressés par mes colis
            </h2>

            <p className="mt-1 text-slate-600">
              Des livreurs souhaitent transporter vos colis.
            </p>
          </div>

          <div className="grid gap-5">

            {senderRequests.length === 0 && (
              <EmptyCard text="Aucune proposition reçue pour vos colis." />
            )}

            {senderRequests.map((request) => (
              <BookingCard
                key={request.id}
                booking={request}
                actionLoading={actionLoading}
                onAccept={() =>
                  updateBookingStatus(request, "accepted")
                }
                onReject={() =>
                  updateBookingStatus(request, "rejected")
                }
              />
            ))}

          </div>
        </section>

      </div>
    </main>
  );
}

function BookingCard({
  booking,
  actionLoading,
  onAccept,
  onReject,
}) {
  return (
    <div className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-emerald-100">

      <div className="flex flex-wrap items-start justify-between gap-4">

        <div>

          <h2 className="text-2xl font-black text-slate-950">
            {booking.packages?.title || "Colis"}
          </h2>

          <p className="mt-2 text-slate-600">
            Colis :
            {" "}
            {booking.packages?.departure_city}
            {" → "}
            {booking.packages?.arrival_city}
          </p>

          <p className="mt-2 text-slate-500">
            Trajet :
            {" "}
            {booking.trips?.departure_city}
            {" → "}
            {booking.trips?.arrival_city}
          </p>

          <p className="mt-2 text-slate-500">
            Date :
            {" "}
            {booking.trips?.trip_date
              ? new Date(
                  booking.trips.trip_date
                ).toLocaleDateString("fr-FR")
              : "Non renseignée"}
          </p>

          <p className="mt-2 text-slate-500">
            {booking.packages?.weight} kg
            {" • "}
            {booking.packages?.price} €
          </p>

        </div>

        <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700">
          {booking.status}
        </div>

      </div>

      {booking.status === "pending" && (
        <div className="mt-6 flex flex-wrap gap-3">

          <button
            disabled={actionLoading}
            onClick={onAccept}
            className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {actionLoading ? "Traitement..." : "Accepter"}
          </button>

          <button
            disabled={actionLoading}
            onClick={onReject}
            className="rounded-full border border-red-200 bg-white px-5 py-3 text-sm font-black text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            Refuser
          </button>

        </div>
      )}

    </div>
  );
}

function EmptyCard({ text }) {
  return (
    <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-emerald-100">
      <p className="text-lg font-bold text-slate-700">
        {text}
      </p>
    </div>
  );
}
