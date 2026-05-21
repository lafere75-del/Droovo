"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function PaiementsPage() {
  const [senderBookings, setSenderBookings] = useState([]);
  const [driverBookings, setDriverBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: senderData } = await supabase
      .from("bookings")
      .select(`
        *,
        packages (*),
        trips (*)
      `)
      .eq("sender_id", user.id)
      .order("created_at", { ascending: false });

    const { data: driverData } = await supabase
      .from("bookings")
      .select(`
        *,
        packages (*),
        trips (*)
      `)
      .eq("driver_id", user.id)
      .order("created_at", { ascending: false });

    setSenderBookings(senderData || []);
    setDriverBookings(driverData || []);
    setLoading(false);
  }

  async function simulatePayment(booking) {
    const price = Number(booking.packages?.price || 0);
    const platformFee = Number((price * 0.22).toFixed(2));
    const driverAmount = Number((price - platformFee).toFixed(2));

    const { error } = await supabase
      .from("bookings")
      .update({
        payment_status: "paid",
        platform_fee: platformFee,
        driver_amount: driverAmount,
      })
      .eq("id", booking.id);

    if (error) {
      alert("Erreur paiement : " + error.message);
      return;
    }

    alert("Paiement simulé avec succès.");
    loadPayments();
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
            Paiements
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
            Paiements et encaissements
          </h1>

          <p className="mt-2 text-slate-600">
            Suivez les paiements côté expéditeur et les gains côté transporteur.
          </p>
        </div>

        <section className="mb-12 grid gap-5 md:grid-cols-2">
          <div className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-emerald-100">
            <h2 className="text-2xl font-black text-slate-950">
              Moyen de paiement
            </h2>

            <p className="mt-2 text-slate-600">
              Ajoutez une carte bancaire pour payer vos livraisons.
            </p>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <p className="font-black text-slate-900">
                Aucune carte enregistrée
              </p>

              <p className="mt-1 text-sm text-slate-500">
                La carte sera gérée par Stripe. Droovo ne stocke pas les numéros
                de carte.
              </p>
            </div>

            <button className="mt-6 rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700">
              Ajouter une carte bancaire
            </button>
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-emerald-100">
            <h2 className="text-2xl font-black text-slate-950">
              Compte bancaire livreur
            </h2>

            <p className="mt-2 text-slate-600">
              Renseignez votre RIB pour recevoir vos encaissements.
            </p>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <p className="font-black text-slate-900">
                RIB transporteur
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Les versements seront ensuite sécurisés avec Stripe Connect.
              </p>
            </div>

            <button className="mt-6 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800">
              Ajouter ou modifier mon RIB
            </button>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-black text-slate-950">
            Mes paiements à effectuer
          </h2>

          <div className="mt-5 grid gap-5">
            {senderBookings.length === 0 && (
              <EmptyCard text="Aucun paiement à afficher." />
            )}

            {senderBookings.map((booking) => (
              <PaymentCard
                key={booking.id}
                booking={booking}
                mode="sender"
                onPay={() => simulatePayment(booking)}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black text-slate-950">
            Mes encaissements livreur
          </h2>

          <div className="mt-5 grid gap-5">
            {driverBookings.length === 0 && (
              <EmptyCard text="Aucun encaissement à afficher." />
            )}

            {driverBookings.map((booking) => (
              <PaymentCard
                key={booking.id}
                booking={booking}
                mode="driver"
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function PaymentCard({ booking, mode, onPay }) {
  const price = Number(booking.packages?.price || 0);
  const platformFee = Number(booking.platform_fee || price * 0.22).toFixed(2);
  const driverAmount = Number(
    booking.driver_amount || price - platformFee
  ).toFixed(2);

  return (
    <div className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-emerald-100">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-950">
            {booking.packages?.title || "Colis"}
          </h3>

          <p className="mt-2 text-slate-600">
            {booking.packages?.departure_city} →{" "}
            {booking.packages?.arrival_city}
          </p>

          <p className="mt-2 text-slate-500">
            Prix client : {price.toFixed(2)} €
          </p>

          <p className="mt-2 text-slate-500">
            Commission Droovo : {platformFee} €
          </p>

          <p className="mt-2 text-slate-500">
            Gain livreur : {driverAmount} €
          </p>
        </div>

        <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700">
          {booking.payment_status || "pending"}
        </span>
      </div>

      {mode === "sender" &&
        booking.status === "accepted" &&
        booking.payment_status !== "paid" && (
          <button
            onClick={onPay}
            className="mt-6 rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700"
          >
            Payer maintenant
          </button>
        )}

      {mode === "driver" && (
        <p className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-600">
          Le gain sera disponible après paiement de l’expéditeur et validation de
          la livraison.
        </p>
      )}
    </div>
  );
}

function EmptyCard({ text }) {
  return (
    <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-emerald-100">
      <p className="text-lg font-bold text-slate-700">{text}</p>
    </div>
  );
}
