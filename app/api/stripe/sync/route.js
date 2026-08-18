import { requireApiUser } from "../../../../lib/apiAuth";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";
import { getStripe, stripeError } from "../../../../lib/stripeServer";

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
      expand: ["payment_intent.latest_charge.balance_transaction"],
    });
    const bookingId = session.metadata?.booking_id;
    if (!bookingId || session.metadata?.sender_id !== auth.user.id) {
      return Response.json({ error: "Paiement non autorisé." }, { status: 403 });
    }
    if (session.payment_status !== "paid") {
      return Response.json({ error: "Paiement non confirmé par Stripe." }, { status: 409 });
    }

    const paymentIntent = session.payment_intent;
    const charge = typeof paymentIntent === "object" ? paymentIntent.latest_charge : null;
    const balanceTransaction = typeof charge === "object" && charge ? charge.balance_transaction : null;
    const processingFeeCents = typeof balanceTransaction === "object" && balanceTransaction
      ? Number(balanceTransaction.fee || 0)
      : 0;
    const amountCents = Number(session.amount_total || 0);
    const commissionCents = Number(session.metadata?.commission_cents || 0);
    const driverAmountCents = Math.max(amountCents - commissionCents - processingFeeCents, 0);

    const admin = getSupabaseAdmin();
    const { error: paymentError } = await admin.from("payments").update({
      payment_status: "paid",
      payout_status: "blocked_until_delivery",
      stripe_payment_id: typeof paymentIntent === "object" ? paymentIntent.id : paymentIntent,
      stripe_charge_id: typeof charge === "object" && charge ? charge.id : null,
      stripe_balance_transaction_id: typeof balanceTransaction === "object" && balanceTransaction
        ? balanceTransaction.id
        : null,
      processing_fee_cents: processingFeeCents,
      driver_amount_cents: driverAmountCents,
      driver_gain: driverAmountCents / 100,
      paid_at: new Date().toISOString(),
    }).eq("booking_id", bookingId);
    if (paymentError) throw paymentError;

    const { error: bookingError } = await admin.rpc("stripe_mark_booking_paid", {
      p_booking_id: bookingId,
      p_platform_fee: commissionCents / 100,
      p_driver_amount: driverAmountCents / 100,
    });
    if (bookingError) throw bookingError;

    return Response.json({ status: "paid" });
  } catch (error) {
    return stripeError(error);
  }
}
