import "server-only";
import Stripe from "stripe";

let stripeClient;

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_NOT_CONFIGURED");
  }

  stripeClient ||= new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-07-29.dahlia",
    appInfo: { name: "Droovo", version: "1.0.0" },
  });

  return stripeClient;
}

export function stripeError(error) {
  if (error?.message === "STRIPE_NOT_CONFIGURED") {
    return Response.json(
      { error: "Stripe doit encore être configuré sur le serveur." },
      { status: 503 }
    );
  }

  console.error("Stripe error", error);
  return Response.json(
    { error: "Le service de paiement est temporairement indisponible." },
    { status: 502 }
  );
}
