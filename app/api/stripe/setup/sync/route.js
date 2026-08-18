import { requireApiUser } from "../../../../../lib/apiAuth";
import { getSupabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { getStripe, stripeError } from "../../../../../lib/stripeServer";

export async function POST(request) {
  const auth = await requireApiUser(request);
  if (auth.response) return auth.response;

  try {
    const { sessionId } = await request.json();
    if (!sessionId?.startsWith("cs_")) {
      return Response.json({ error: "Session Stripe invalide." }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["setup_intent.payment_method"],
    });
    if (session.mode !== "setup" || session.status !== "complete") {
      return Response.json({ error: "Enregistrement de la carte non confirmé." }, { status: 409 });
    }
    if (session.metadata?.user_id !== auth.user.id) {
      return Response.json({ error: "Opération non autorisée." }, { status: 403 });
    }

    const setupIntent = session.setup_intent;
    const paymentMethod = typeof setupIntent === "object" ? setupIntent.payment_method : null;
    if (!paymentMethod || typeof paymentMethod !== "object") {
      throw new Error("PAYMENT_METHOD_MISSING");
    }

    const admin = getSupabaseAdmin();
    const { error } = await admin.from("payment_settings").upsert(
      {
        user_id: auth.user.id,
        stripe_customer_id: typeof session.customer === "string" ? session.customer : session.customer?.id,
        stripe_payment_method_id: paymentMethod.id,
        card_brand: paymentMethod.card?.brand || paymentMethod.type,
        card_last4: paymentMethod.card?.last4 || null,
        card_consent_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    if (error) throw error;

    return Response.json({ status: "saved", last4: paymentMethod.card?.last4 || null });
  } catch (error) {
    return stripeError(error);
  }
}
