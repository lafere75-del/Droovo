"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function PaiementsPage() {
  const [senderBookings, setSenderBookings] = useState([]);
  const [driverBookings, setDriverBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stripeLoading, setStripeLoading] = useState(false);

  const [cardNumber, setCardNumber] = useState("");
  const [cardSaved, setCardSaved] = useState(false);

  const [paymentSettings, setPaymentSettings] = useState(null);

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    async function syncStripeReturn() {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");
      if (!sessionId) return;

      try {
        if (params.get("setup") === "success") {
          await callStripe("/api/stripe/setup/sync", { sessionId });
        } else if (params.get("payment") === "success") {
          await callStripe("/api/stripe/sync", { sessionId });
        } else {
          return;
        }
        await loadPayments();
        window.history.replaceState({}, "", "/dashboard/paiements");
      } catch (error) {
        alert(error.message);
      }
    }

    syncStripeReturn();
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

    const { data: paymentData } = await supabase
      .from("payment_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (paymentData) {
      setPaymentSettings(paymentData);

      if (paymentData.card_last4) {
        setCardSaved(true);
        setCardNumber(`****${paymentData.card_last4}`);
      }

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

  async function callStripe(path, body = {}) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Vous devez être connecté.");
    const response = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Action Stripe impossible.");
    return result;
  }

  async function startCardSetup() {
    setStripeLoading(true);
    try {
      const { url } = await callStripe("/api/stripe/setup");
      window.location.assign(url);
    } catch (error) {
      alert(error.message);
      setStripeLoading(false);
    }
  }

  async function startConnectOnboarding() {
    setStripeLoading(true);
    try {
      const { url } = await callStripe("/api/stripe/connect/onboarding");
      window.location.assign(url);
    } catch (error) {
      alert(error.message);
      setStripeLoading(false);
    }
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
      <div className="mx-auto mb-6 max-w-7xl">
        <button
          onClick={() => window.history.back()}
          className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
        >
          ← Retour
        </button>
      </div>

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
              Le paiement sera saisi directement dans l’interface sécurisée de
              Stripe. Droovo ne demandera jamais votre numéro de carte ici.
            </p>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              {cardSaved ? (
                <>
                  <p className="font-black text-slate-900">
                    Carte enregistrée
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Carte terminant par {cardNumber.slice(-4)}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-black text-slate-900">
                    Aucune carte enregistrée
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    La carte sera gérée par Stripe. Droovo ne stocke pas les
                    numéros de carte.
                  </p>
                </>
              )}
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-600">
              En enregistrant une carte, vous autorisez Droovo à préautoriser le
              prix lorsque vous choisissez un transporteur, puis à le débiter
              uniquement après validation de la livraison. Les données bancaires
              restent chez Stripe.
            </p>
            <button
              onClick={startCardSetup}
              disabled={stripeLoading}
              className="mt-6 rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {stripeLoading
                ? "Ouverture de Stripe…"
                : cardSaved
                  ? "Modifier ma carte"
                  : "Enregistrer ma carte et autoriser les paiements"}
            </button>
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-emerald-100">
            <h2 className="text-2xl font-black text-slate-950">
              Compte bancaire livreur
            </h2>

            <p className="mt-2 text-slate-600">
              Stripe Connect vérifiera le transporteur et recueillera ses
              coordonnées bancaires dans son interface sécurisée.
            </p>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <p className="font-black text-slate-900">
                {paymentSettings?.stripe_connect_account_id
                  ? "Compte transporteur créé"
                  : "Versements non configurés"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Stripe recueille directement votre identité et votre IBAN. Droovo
                ne stocke pas vos coordonnées bancaires complètes.
              </p>
            </div>
            <button
              onClick={startConnectOnboarding}
              disabled={stripeLoading}
              className="mt-6 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-60"
            >
              {stripeLoading ? "Ouverture de Stripe…" : "Configurer mes versements"}
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

function PaymentCard({ booking, mode }) {
  const price = Number(booking.packages?.price || 0);
  const platformFee = Number(booking.platform_fee || price * 0.25).toFixed(2);
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
            Gain transporteur estimé : {driverAmount} €
          </p>
        </div>

        <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700">
          {paymentStatusLabel(booking.payment_status)}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/dashboard/suivi/${booking.id}`}
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800"
        >
          Suivre la livraison
        </Link>

      </div>

      {mode === "sender" && booking.payment_status === "authorized" && (
        <p className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
          Montant préautorisé. Votre carte sera débitée uniquement lorsque vous
          confirmerez la livraison.
        </p>
      )}

      {mode === "driver" && (
        <p className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-600">
          Le gain sera disponible après paiement de l’expéditeur et validation de
          la livraison. Les frais de paiement par carte seront déduits du gain final.
        </p>
      )}
    </div>
  );
}

function paymentStatusLabel(status) {
  return {
    pending: "En attente",
    authorized: "Préautorisé",
    paid: "Payé",
  }[status] || status || "En attente";
}

function EmptyCard({ text }) {
  return (
    <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-emerald-100">
      <p className="text-lg font-bold text-slate-700">{text}</p>
    </div>
  );
}
