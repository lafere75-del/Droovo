"use client";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useMemo, useState } from "react";

function CardForm({ onCancel, onSaved, syncSetup }) {
  const stripe = useStripe();
  const elements = useElements();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (!stripe || !elements || saving) return;
    setSaving(true);
    setError("");

    const result = await stripe.confirmSetup({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/paiements`,
      },
    });

    if (result.error) {
      setError(result.error.message || "La carte n’a pas pu être enregistrée.");
      setSaving(false);
      return;
    }

    try {
      await syncSetup(result.setupIntent.id);
      await onSaved();
    } catch (syncError) {
      setError(syncError.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>
      {error ? <p className="mt-3 text-sm font-bold text-red-600">{error}</p> : null}
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={!stripe || saving}
          className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? "Enregistrement…" : "Enregistrer cette carte"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-full bg-slate-100 px-5 py-3 text-sm font-black text-slate-700 disabled:opacity-60"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

export default function EmbeddedCardSetup({ clientSecret, publishableKey, onCancel, onSaved, syncSetup }) {
  const stripePromise = useMemo(() => loadStripe(publishableKey), [publishableKey]);

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        locale: "fr",
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#059669",
            borderRadius: "12px",
            fontFamily: "inherit",
          },
        },
      }}
    >
      <CardForm onCancel={onCancel} onSaved={onSaved} syncSetup={syncSetup} />
    </Elements>
  );
}
