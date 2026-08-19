import { requireApiUser } from "../../../../../lib/apiAuth";
import { getSupabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { getStripe, stripeError } from "../../../../../lib/stripeServer";

export async function POST(request) {
  const auth = await requireApiUser(request);
  if (auth.response) return auth.response;

  try {
    const { bookingId } = await request.json();
    const { data: booking } = await auth.client
      .from("bookings")
      .select("id,sender_id")
      .eq("id", bookingId)
      .eq("sender_id", auth.user.id)
      .maybeSingle();
    if (!booking) return Response.json({ error: "Paiement introuvable." }, { status: 404 });

    const admin = getSupabaseAdmin();
    const { data: payment } = await admin
      .from("payments")
      .select("stripe_payment_id,payment_status")
      .eq("booking_id", booking.id)
      .maybeSingle();
    if (!payment?.stripe_payment_id || payment.payment_status !== "requires_action") {
      return Response.json({ error: "Aucune validation bancaire n’est requise." }, { status: 409 });
    }

    const intent = await getStripe().paymentIntents.retrieve(payment.stripe_payment_id);
    if (intent.metadata?.sender_id !== auth.user.id || intent.status !== "requires_action") {
      return Response.json({ error: "Validation bancaire non autorisée." }, { status: 403 });
    }

    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) throw new Error("STRIPE_PUBLISHABLE_KEY_MISSING");
    return Response.json({ clientSecret: intent.client_secret, publishableKey });
  } catch (error) {
    return stripeError(error);
  }
}
