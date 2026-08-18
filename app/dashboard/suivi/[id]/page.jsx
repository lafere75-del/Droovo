"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";

export default function SuiviPage({ params }) {
  const { id } = use(params);

  const [booking, setBooking] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    loadTracking();
  }, [id]);

  async function loadTracking() {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);

    const { data: bookingData, error } = await supabase
      .from("bookings")
      .select(`
        *,
        packages (*),
        trips (*)
      `)
      .eq("id", id)
      .maybeSingle();

    const { data: eventsData = [] } = await supabase
      .from("tracking_events")
      .select("*")
      .eq("booking_id", id)
      .order("created_at", { ascending: true });

    if (error || !bookingData) {
      setBooking(null);
      setEvents([]);
    } else {
      setBooking(bookingData);
      setEvents(eventsData || []);
    }

    setLoading(false);
  }

  async function updateTracking(status, message) {
    setActionLoading(true);

    const updatePayload = {
      tracking_status: status,
    };

    if (status === "picked_up") {
      updatePayload.picked_up_at = new Date().toISOString();
    }

    if (status === "delivered") {
      updatePayload.delivered_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("bookings")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      alert("Erreur mise à jour : " + error.message);
      setActionLoading(false);
      return;
    }

    await loadTracking();
    setActionLoading(false);
  }

  async function confirmDeliveryAndRelease() {
    setActionLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Vous devez être connecté.");
      const response = await fetch("/api/stripe/release", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ bookingId: id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Versement impossible.");
      alert("Réception confirmée. Le gain du transporteur a été débloqué.");
      await loadTracking();
    } catch (error) {
      alert(error.message);
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

  if (!booking) {
    return (
      <main className="min-h-screen bg-[#F4F7F5] p-8">
        <Link href="/dashboard/suivis" className="font-bold text-emerald-700">
          ← Retour aux suivis
        </Link>

        <div className="mt-8 rounded-[2rem] bg-white p-8">
          <h1 className="text-2xl font-black">Suivi introuvable</h1>
          <p className="mt-2 text-slate-600">
            Aucun suivi n’a été trouvé pour cette livraison.
          </p>
        </div>
      </main>
    );
  }

  const currentStatus = booking.tracking_status || "booking_created";
  const timeline = [
    ["booking_created", "Transporteur choisi"],
    ["authorized", "Montant préautorisé"],
    ["picked_up", "Colis remis"],
    ["in_transit", "En transport"],
    ["delivered", "Livré"],
    ["payout", "Transporteur payé"],
  ];
  const trackingIndex = timeline.findIndex(([status]) => status === currentStatus);
  const currentIndex = currentStatus === "booking_created" && booking.payment_status === "authorized"
    ? 1
    : Math.max(0, trackingIndex);

  return (
    <main className="min-h-screen bg-[#F4F7F5] px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard/suivis"
          className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
        >
          ← Retour aux suivis
        </Link>

        <section className="mt-8 rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-emerald-100">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">
            Suivi de livraison
          </p>

          <h1 className="mt-3 text-4xl font-black text-slate-950">
            {booking.packages?.title || "Colis"}
          </h1>

          <p className="mt-3 text-slate-600">
            {booking.packages?.departure_city || "Départ"} →{" "}
            {booking.packages?.arrival_city || "Arrivée"}
          </p>

          <div className="mt-6 rounded-2xl bg-emerald-50 p-5">
            <p className="text-sm font-bold text-emerald-700">
              Statut actuel
            </p>
            <p className="mt-1 text-2xl font-black text-emerald-900">
              {formatStatus(currentStatus)}
            </p>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {timeline.map(([status, label], index) => {
              const completed = index <= currentIndex;
              const unavailable = status === "payout";
              return (
                <div key={status} className={`rounded-2xl p-4 ring-1 ${completed ? "bg-emerald-50 text-emerald-900 ring-emerald-200" : "bg-slate-50 text-slate-500 ring-slate-200"}`}>
                  <p className="text-xs font-black uppercase tracking-wide">Étape {index + 1}</p>
                  <p className="mt-1 font-black">{label}</p>
                  {unavailable && <p className="mt-1 text-xs font-bold">Après confirmation de la réception</p>}
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl bg-amber-50 p-5 text-sm text-amber-950 ring-1 ring-amber-200">
            <p className="font-black">Preuve de remise et de livraison</p>
            <p className="mt-1 leading-6">
              Le transporteur déclare la remise et la livraison. L’expéditeur
              confirme ensuite la réception : Stripe débite alors la carte et
              Droovo débloque le gain du transporteur.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <Info
              label="Expéditeur"
              value={
                booking.sender_id
                  ? booking.sender_id.slice(0, 8) + "..."
                  : null
              }
            />

            <Info
              label="Transporteur"
              value={
                booking.driver_id
                  ? booking.driver_id.slice(0, 8) + "..."
                  : null
              }
            />

            <Info label="Paiement" value={booking.payment_status || "pending"} />
            <Info label="Réservation" value={booking.status || "pending"} />

            <Info
              label="Prix"
              value={
                booking.packages?.price ? `${booking.packages.price} €` : null
              }
            />

            <Info
              label="Date souhaitée"
              value={formatDate(booking.packages?.desired_date)}
            />

            <Info
              label="Récupéré le"
              value={formatDateTime(booking.picked_up_at)}
            />

            <Info
              label="Livré le"
              value={formatDateTime(booking.delivered_at)}
            />
          </div>

          {userId === booking.driver_id && booking.status === "accepted" && (
          <div className="mt-8 rounded-2xl bg-slate-50 p-5">
            <h2 className="text-xl font-black text-slate-950">
              Mettre à jour le suivi
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Ces actions permettent d’informer l’expéditeur de l’avancement de
              la livraison.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                disabled={actionLoading || currentStatus !== "booking_created" || booking.payment_status !== "authorized"}
                onClick={() =>
                  updateTracking("picked_up", "Le colis a été récupéré.")
                }
                className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                Colis récupéré
              </button>

              <button
                disabled={actionLoading || currentStatus !== "picked_up"}
                onClick={() =>
                  updateTracking(
                    "in_transit",
                    "Le colis est en cours de livraison."
                  )
                }
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:opacity-50"
              >
                En cours de livraison
              </button>

              <button
                disabled={actionLoading || currentStatus !== "in_transit"}
                onClick={() =>
                  updateTracking("delivered", "Le colis a été livré.")
                }
                className="rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Livré
              </button>
            </div>
          </div>
          )}

          {userId === booking.sender_id && currentStatus === "delivered" && booking.payment_status === "authorized" && (
            <div className="mt-8 rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-100">
              <h2 className="text-xl font-black text-slate-950">Confirmer la réception</h2>
              <p className="mt-1 text-sm text-slate-600">
                Confirmez seulement lorsque le colis a bien été remis. Cette
                action débite votre carte et débloque le gain du transporteur.
              </p>
              <button
                onClick={confirmDeliveryAndRelease}
                disabled={actionLoading}
                className="mt-5 rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {actionLoading ? "Confirmation…" : "J’ai bien reçu le colis"}
              </button>
            </div>
          )}
        </section>

        <section className="mt-8 rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-emerald-100">
          <h2 className="text-2xl font-black text-slate-950">
            Historique du suivi
          </h2>

          <div className="mt-6 space-y-4">
            {events.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-5 text-slate-600">
                Aucun événement de suivi pour le moment.
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-emerald-100 bg-slate-50 p-5"
                >
                  <p className="font-black text-slate-950">
                    {formatStatus(event.status)}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {event.message || "Mise à jour du suivi"}
                  </p>

                  <p className="mt-2 text-xs font-bold text-slate-400">
                    {formatDateTime(event.created_at)}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-black text-slate-950">
        {value || "Non renseigné"}
      </p>
    </div>
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

function formatDate(date) {
  if (!date) return "Non renseigné";
  return new Date(date).toLocaleDateString("fr-FR");
}

function formatDateTime(date) {
  if (!date) return "Non renseigné";
  return new Date(date).toLocaleString("fr-FR");
}
