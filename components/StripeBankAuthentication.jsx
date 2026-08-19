"use client";

import { loadStripe } from "@stripe/stripe-js";
import { useMemo, useState } from "react";

export default function StripeBankAuthentication({ clientSecret, publishableKey, onConfirmed, onCancel }) {
  const stripePromise = useMemo(() => loadStripe(publishableKey), [publishableKey]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function confirm() {
    setLoading(true);
    setError("");
    try {
      const stripe = await stripePromise;
      const result = await stripe.handleNextAction({ clientSecret });
      if (result.error) {
        throw new Error(result.error.message || "La banque n’a pas validé l’opération.");
      }
      await onConfirmed();
    } catch (confirmationError) {
      setError(confirmationError.message || "La validation bancaire a échoué.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
      <p className="font-black text-amber-900">Validation demandée par votre banque</p>
      <p className="mt-2 text-sm text-amber-800">
        Votre carte reste enregistrée. Confirmez simplement la préautorisation sécurisée.
      </p>
      {error ? <p className="mt-3 text-sm font-bold text-red-600">{error}</p> : null}
      <div className="mt-4 flex flex-wrap gap-3">
        <button onClick={confirm} disabled={loading} className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white disabled:opacity-60">
          {loading ? "Validation…" : "Valider avec ma banque"}
        </button>
        <button onClick={onCancel} disabled={loading} className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200 disabled:opacity-60">
          Plus tard
        </button>
      </div>
    </div>
  );
}
