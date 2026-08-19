import { requireApiUser } from "../../../../../lib/apiAuth";
import { getSupabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { getStripe, stripeError } from "../../../../../lib/stripeServer";
import { legalNamesMatch } from "../../../../../lib/identityName";

export async function POST(request) {
  const auth = await requireApiUser(request);
  if (auth.response) return auth.response;

  try {
    const { setupIntentId } = await request.json();
    if (!setupIntentId?.startsWith("seti_")) {
      return Response.json({ error: "Enregistrement Stripe invalide." }, { status: 400 });
    }

    const stripe = getStripe();
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId, {
      expand: ["payment_method"],
    });
    if (setupIntent.status !== "succeeded") {
      return Response.json({ error: "Enregistrement de la carte non confirmé." }, { status: 409 });
    }
    if (setupIntent.metadata?.user_id !== auth.user.id) {
      return Response.json({ error: "Opération non autorisée." }, { status: 403 });
    }

    const paymentMethod = setupIntent.payment_method;
    if (!paymentMethod || typeof paymentMethod !== "object") {
      throw new Error("PAYMENT_METHOD_MISSING");
    }

    const admin = getSupabaseAdmin();
    const { data: profile } = await auth.client
      .from("profiles")
      .select("fullname,identity_status")
      .eq("id", auth.user.id)
      .maybeSingle();
    if (
      !legalNamesMatch(paymentMethod.billing_details?.name, profile?.fullname)
    ) {
      await getStripe().paymentMethods.detach(paymentMethod.id).catch(() => {});
      return Response.json(
        { error: "Le nom associé à la carte doit correspondre au nom légal du compte." },
        { status: 409 }
      );
    }
    const { error } = await admin.from("payment_settings").upsert(
      {
        user_id: auth.user.id,
        stripe_customer_id: typeof setupIntent.customer === "string" ? setupIntent.customer : setupIntent.customer?.id,
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
