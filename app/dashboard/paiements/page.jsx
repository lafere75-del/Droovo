"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function PaiementsPage() {
  const [senderBookings, setSenderBookings] = useState([]);
  const [driverBookings, setDriverBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCardForm, setShowCardForm] = useState(false);
  const [showRibForm, setShowRibForm] = useState(false);

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardSaved, setCardSaved] = useState(false);

  const [iban, setIban] = useState("");
  const [ribName, setRibName] = useState("");
  const [ribSaved, setRibSaved] = useState(false);

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

  function saveCard() {
    if (!cardName.trim() || !cardNumber.trim() || !cardExpiry.trim()) {
      alert("Complète les informations de la carte.");
      return;
    }

    setCardSaved(true);
    setShowCardForm(false);
  }

  function saveRib() {
    if (!ribName.trim() || !iban.trim()) {
      alert("Complète le titulaire et l’IBAN.");
      return;
    }

    setRibSaved(true);
    setShowRibForm(false);
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
              Ajoutez une carte bancaire pour payer vos livraisons.
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
                    La carte sera gérée par Stripe. Droovo ne stocke pas les numéros de carte.
                  </p>
                </>
              )}
            </div>

            {showCardForm && (
              <div className="mt-5 space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <input
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Nom sur la carte"
                  className="w-full rounded-xl border border-emerald-100 px-4 py-3 text-sm outline-none"
                />

                <input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="Numéro de carte"
                  className="w-full rounded-xl border border-emerald-100 px-4 py-3 text-sm outline-none"
                />

                <input
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="Expiration MM/AA"
                  className="w-full rounded-xl border border-emerald-100 px-4 py-3 text-sm outline-none"
                />

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={saveCard}
                    className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700"
                  >
                    Enregistrer la carte
                  </button>

                  <button
                    onClick={() => setShowCardForm(false)}
                    className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-700"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {!showCardForm && (
              <button
                onClick={() => setShowCardForm(true)}
                className="mt-6 rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700"
              >
                {cardSaved ? "Modifier la carte" : "Ajouter une carte bancaire"}
              </button>
            )}
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-emerald-100">
            <h2 className="text-2xl font-black text-slate-950">
              Compte bancaire livreur
            </h2>

            <p className="mt-2 text-slate-600">
              Renseignez votre RIB pour recevoir vos encaissements.
            </p>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              {ribSaved ? (
                <>
                  <p className="font-black text-slate-900">
                    RIB enregistré
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    IBAN terminant par {iban.slice(-4)}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-black text-slate-900">
                    Aucun RIB enregistré
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Les versements seront ensuite sécurisés avec Stripe Connect.
                  </p>
                </>
              )}
            </div>

            {showRibForm && (
              <div className="mt-5 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <input
                  value={ribName}
                  onChange={(e) => setRibName(e.target.value)}
                  placeholder="Titulaire du compte"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                />

                <input
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  placeholder="IBAN"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                />

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={saveRib}
                    className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800"
                  >
                    Enregistrer le RIB
                  </button>

                  <button
                    onClick={() => setShowRibForm(false)}
                    className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-700"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {!showRibForm && (
              <button
                onClick={() => setShowRibForm(true)}
                className="mt-6 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800"
              >
                {ribSaved ? "Modifier mon RIB" : "Ajouter ou modifier mon RIB"}
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
