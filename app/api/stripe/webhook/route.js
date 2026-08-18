import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";
import { getStripe } from "../../../../lib/stripeServer";

export async function POST(request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: "Webhook non configuré." }, { status: 503 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      await request.text(), signature, process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return Response.json({ error: "Signature invalide." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object;
      const bookingId = session.metadata?.booking_id;
      if (bookingId && session.payment_status === "paid") {
        const paymentIntent = await getStripe().paymentIntents.retrieve(session.payment_intent, {
          expand: ["latest_charge.balance_transaction"],
        });
        const charge = paymentIntent.latest_charge;
        const balanceTransaction = charge?.balance_transaction;
        const processingFeeCents = typeof balanceTransaction === "object" ? balanceTransaction.fee : 0;

        await admin.from("payments").update({
          payment_status: "paid",
          payout_status: "blocked_until_delivery",
          stripe_payment_id: paymentIntent.id,
          stripe_charge_id: typeof charge === "object" ? charge.id : null,
          stripe_balance_transaction_id: typeof balanceTransaction === "object" ? balanceTransaction.id : null,
          processing_fee_cents: processingFeeCents,
          paid_at: new Date().toISOString(),
        }).eq("booking_id", bookingId);
        await admin.from("bookings").update({
          payment_status: "paid",
          tracking_status: "paid",
        }).eq("id", bookingId);
      }
    }

    if (event.type === "checkout.session.expired") {
      await admin.from("payments").update({ payment_status: "expired" })
        .eq("stripe_checkout_session_id", event.data.object.id);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing failed", error);
    return Response.json({ error: "Traitement impossible." }, { status: 500 });
  }
}
