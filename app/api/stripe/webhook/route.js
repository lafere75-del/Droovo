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
        const processingFeeCents = typeof balanceTransaction === "object" && balanceTransaction
          ? Number(balanceTransaction.fee || 0)
          : 0;
        const amountCents = Number(session.amount_total || 0);
        const commissionCents = Number(session.metadata?.commission_cents || 0);
        const driverAmountCents = Math.max(amountCents - commissionCents - processingFeeCents, 0);

        const { error: paymentError } = await admin.from("payments").update({
          payment_status: "paid",
          payout_status: "blocked_until_delivery",
          stripe_payment_id: paymentIntent.id,
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
      }
    }

    if (event.type === "checkout.session.expired") {
      await admin.from("payments").update({ payment_status: "expired" })
        .eq("stripe_checkout_session_id", event.data.object.id);
    }

    if (event.type === "payment_intent.amount_capturable_updated") {
      const intent = event.data.object;
      const bookingId = intent.metadata?.booking_id;
      if (bookingId && intent.status === "requires_capture") {
        const amountCents = Number(intent.amount || 0);
        const commissionCents = Number(intent.metadata?.commission_cents || 0);
        await admin.from("payments").update({
          payment_status: "authorized",
          stripe_payment_id: intent.id,
        }).eq("booking_id", bookingId);
        const { error } = await admin.rpc("stripe_mark_booking_authorized", {
          p_booking_id: bookingId,
          p_platform_fee: commissionCents / 100,
          p_driver_amount: (amountCents - commissionCents) / 100,
        });
        if (error) throw error;
      }
    }

    if (event.type === "payment_intent.succeeded") {
      const rawIntent = event.data.object;
      const bookingId = rawIntent.metadata?.booking_id;
      if (bookingId) {
        const intent = await getStripe().paymentIntents.retrieve(rawIntent.id, {
          expand: ["latest_charge.balance_transaction"],
        });
        const charge = typeof intent.latest_charge === "object" ? intent.latest_charge : null;
        const balanceTransaction = charge && typeof charge.balance_transaction === "object"
          ? charge.balance_transaction
          : null;
        const processingFeeCents = Number(balanceTransaction?.fee || 0);
        const amountCents = Number(intent.amount_received || intent.amount || 0);
        const commissionCents = Number(intent.metadata?.commission_cents || 0);
        const driverAmountCents = Math.max(amountCents - commissionCents - processingFeeCents, 0);

        await admin.from("payments").update({
          payment_status: "paid",
          stripe_charge_id: charge?.id || null,
          stripe_balance_transaction_id: balanceTransaction?.id || null,
          processing_fee_cents: processingFeeCents,
          driver_amount_cents: driverAmountCents,
          driver_gain: driverAmountCents / 100,
          paid_at: new Date().toISOString(),
        }).eq("booking_id", bookingId);
      }
    }

    if (event.type === "payment_intent.payment_failed" || event.type === "payment_intent.canceled") {
      const intent = event.data.object;
      if (intent.metadata?.booking_id) {
        await admin.from("payments").update({
          payment_status: event.type === "payment_intent.canceled" ? "cancelled" : "failed",
        }).eq("booking_id", intent.metadata.booking_id);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing failed", error);
    return Response.json({ error: "Traitement impossible." }, { status: 500 });
  }
}
