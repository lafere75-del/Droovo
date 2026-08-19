"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import EmbeddedCardSetup from "../../../components/EmbeddedCardSetup";
import EmbeddedConnectOnboarding from "../../../components/EmbeddedConnectOnboarding";
import StripeBankAuthentication from "../../../components/StripeBankAuthentication";

export default function PaiementsPage() {
  const [senderBookings, setSenderBookings] = useState([]);
  const [driverBookings, setDriverBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [cardSetup, setCardSetup] = useState(null);
  const [connectSetup, setConnectSetup] = useState(null);
  const [connectStatus, setConnectStatus] = useState("not_started");
  const [bankAction, setBankAction] = useState(null);

  const [cardNumber, setCardNumber] = useState("");
  const [cardSaved, setCardSaved] = useState(false);

  const [paymentSettings, setPaymentSettings] = useState(null);

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    async function syncStripeReturn() {
      const params = new URLSearchParams(window.location.search);
      const setupIntentId = params.get("setup_intent");
      if (!setupIntentId) return;

      try {
        await callStripe("/api/stripe/setup/sync", { setupIntentId });
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
        trips (*),
        payments (payment_status)
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
    if (paymentData?.stripe_connect_account_id) {
      try {
        const result = await callStripe("/api/stripe/connect/status");
        setConnectStatus(result.status);
      } catch {
        setConnectStatus(paymentData.connect_onboarding_status || "pending");
      }
    } else {
      setConnectStatus("not_started");
    }
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
      const setup = await callStripe("/api/stripe/setup");
      setCardSetup(setup);
    } catch (error) {
      alert(error.message);
    } finally {
      setStripeLoading(false);
    }
  }

  async function startConnectOnboarding() {
    setStripeLoading(true);
    try {
      const setup = await callStripe("/api/stripe/connect/onboarding");
      setConnectSetup(setup);
    } catch (error) {
      alert(error.message);
    } finally {
      setStripeLoading(false);
    }
  }

  const fetchConnectClientSecret = useCallback(async () => {
    const setup = await callStripe("/api/stripe/connect/onboarding");
    return setup.clientSecret;
  }, []);

  async function syncCardSetup(setupIntentId) {
    await callStripe("/api/stripe/setup/sync", { setupIntentId });
  }

  async function finishCardSetup() {
    setCardSetup(null);
    await loadPayments();
  }

  async function finishConnectSetup() {
    setConnectSetup(null);
    await loadPayments();
  }

  async function startBankAuthentication(bookingId) {
    setStripeLoading(true);
    try {
      const setup = await callStripe("/api/stripe/authorize/action", { bookingId });
      setBankAction({ bookingId, ...setup });
    } catch (error) {
      alert(error.message);
    } finally {
      setStripeLoading(false);
    }
  }

  async function finishBankAuthentication() {
    await callStripe("/api/stripe/authorize/sync", { bookingId: bankAction.bookingId });
    setBankAction(null);
    await loadPayments();
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
              Saisissez votre carte sans quitter Droovo. Le formulaire sécurisé
              est géré par Stripe et Droovo ne voit jamais le numéro complet.
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
              restent chez Stripe. Aucun paiement n’est possible avant validation
              de votre identité.
            </p>
            {cardSetup ? (
              <EmbeddedCardSetup
                clientSecret={cardSetup.clientSecret}
                publishableKey={cardSetup.publishableKey}
                cardholderName={cardSetup.cardholderName}
                syncSetup={syncCardSetup}
                onSaved={finishCardSetup}
                onCancel={() => setCardSetup(null)}
              />
            ) : (
              <button
                onClick={startCardSetup}
                disabled={stripeLoading}
                className="mt-6 rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {stripeLoading
                  ? "Chargement…"
                  : cardSaved
                    ? "Modifier ma carte"
                    : "Enregistrer ma carte et autoriser les paiements"}
              </button>
            )}
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-emerald-100">
            <h2 className="text-2xl font-black text-slate-950">
              Compte bancaire livreur
            </h2>

            <p className="mt-2 text-slate-600">
              Renseignez votre RIB sans quitter Droovo. Le titulaire doit être le
              même que celui de la pièce d’identité validée.
            </p>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <p className="font-black text-slate-900">
                {connectStatus === "active"
                  ? "Compte vérifié — versements activés"
                  : connectStatus === "identity_pending"
                    ? "RIB enregistré — identité à valider"
                  : connectStatus === "identity_mismatch"
                    ? "Identité bancaire à corriger"
                  : connectStatus === "restricted"
                    ? "Informations complémentaires requises"
                    : connectStatus === "pending"
                      ? "Vérification Stripe en cours"
                      : "Versements non configurés"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Stripe recueille directement votre identité et votre IBAN. Droovo
                ne stocke pas vos coordonnées bancaires complètes.
              </p>
            </div>
            {connectSetup ? (
              <EmbeddedConnectOnboarding
                initialClientSecret={connectSetup.clientSecret}
                publishableKey={connectSetup.publishableKey}
                fetchClientSecret={fetchConnectClientSecret}
                onExit={finishConnectSetup}
              />
            ) : (
              <button
                onClick={startConnectOnboarding}
                disabled={stripeLoading}
                className="mt-6 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-60"
              >
                {stripeLoading ? "Chargement…" : "Configurer mes versements"}
              </button>
            )}
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
                stripeLoading={stripeLoading}
                onBankAuthentication={startBankAuthentication}
                bankAction={bankAction}
                onBankConfirmed={finishBankAuthentication}
                onBankCancel={() => setBankAction(null)}
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

function PaymentCard({ booking, mode, stripeLoading, onBankAuthentication, bankAction, onBankConfirmed, onBankCancel }) {
  const price = Number(booking.packages?.price || 0);
  const platformFee = Number(booking.platform_fee || price * 0.25).toFixed(2);
  const driverAmount = Number(
    booking.driver_amount || price - platformFee
  ).toFixed(2);

  const relatedPayment = Array.isArray(booking.payments) ? booking.payments[0] : booking.payments;
  const effectivePaymentStatus = relatedPayment?.payment_status || booking.payment_status;

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
            {mode === "driver"
              ? `Gain transporteur estimé : ${driverAmount} €`
              : `Prix à payer : ${price.toFixed(2)} €`}
          </p>
        </div>

        <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700">
          {paymentStatusLabel(effectivePaymentStatus)}
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

      {mode === "sender" && effectivePaymentStatus === "requires_action" && (
        bankAction?.bookingId === booking.id ? (
          <StripeBankAuthentication
            clientSecret={bankAction.clientSecret}
            publishableKey={bankAction.publishableKey}
            onConfirmed={onBankConfirmed}
            onCancel={onBankCancel}
          />
        ) : (
          <button
            onClick={() => onBankAuthentication(booking.id)}
            disabled={stripeLoading}
            className="mt-6 rounded-full bg-amber-500 px-5 py-3 text-sm font-black text-white disabled:opacity-60"
          >
            {stripeLoading ? "Chargement…" : "Valider avec ma banque"}
          </button>
        )
      )}

      {mode === "sender" && effectivePaymentStatus === "authorized" && (
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
    requires_action: "Validation bancaire requise",
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
