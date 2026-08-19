import { requireApiUser } from "../../../../lib/apiAuth";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";
import { getStripe, stripeError } from "../../../../lib/stripeServer";
import { getStripeIdentityName, legalNamesMatch } from "../../../../lib/identityName";

export async function POST(request) {
  const auth = await requireApiUser(request);
  if (auth.response) return auth.response;

  try {
    const { bookingId } = await request.json();
    const { data: booking } = await auth.client
      .from("bookings")
      .select("id,sender_id,driver_id,status,tracking_status,payment_status")
      .eq("id", bookingId)
      .eq("sender_id", auth.user.id)
      .maybeSingle();
    if (!booking) return Response.json({ error: "Livraison introuvable." }, { status: 404 });
    if (booking.tracking_status !== "delivered") return Response.json({ error: "Le transporteur doit d’abord déclarer le colis livré." }, { status: 409 });
    if (!["authorized", "paid"].includes(booking.payment_status)) {
      return Response.json({ error: "Aucune préautorisation valide n’est disponible." }, { status: 409 });
    }

    const admin = getSupabaseAdmin();
    const { data: payment } = await admin.from("payments").select("*").eq("booking_id", booking.id).maybeSingle();
    if (!payment) return Response.json({ error: "Paiement introuvable." }, { status: 404 });
    if (payment.stripe_transfer_id) return Response.json({ status: "already_released" });

    const { data: settings } = await admin.from("payment_settings")
      .select("stripe_connect_account_id")
      .eq("user_id", booking.driver_id).maybeSingle();
    if (!settings?.stripe_connect_account_id) {
      return Response.json({ error: "Le transporteur doit terminer son inscription Stripe." }, { status: 409 });
    }

    const stripe = getStripe();
    const account = await stripe.v2.core.accounts.retrieve(settings.stripe_connect_account_id, {
      include: ["configuration.recipient"],
    });
    const { data: driverProfile } = await admin.from("profiles")
      .select("fullname,identity_status")
      .eq("id", booking.driver_id)
      .maybeSingle();
    if (
      driverProfile?.identity_status !== "verified" ||
      !legalNamesMatch(getStripeIdentityName(account), driverProfile?.fullname)
    ) {
      return Response.json(
        { error: "Le titulaire du compte de versement ne correspond pas à l’identité vérifiée." },
        { status: 409 }
      );
    }
    const recipient = account.configuration?.recipient;
    if (recipient?.capabilities?.stripe_balance?.stripe_transfers?.status !== "active") {
      return Response.json({ error: "Le compte de versement du transporteur n’est pas encore actif." }, { status: 409 });
    }

    if (["authorized", "paid"].includes(payment.payment_status)) {
      if (!payment.stripe_payment_id) throw new Error("PAYMENT_INTENT_MISSING");
      const currentIntent = await stripe.paymentIntents.retrieve(payment.stripe_payment_id);
      if (currentIntent.status === "requires_capture") {
        await stripe.paymentIntents.capture(
          payment.stripe_payment_id,
          {},
          { idempotencyKey: `capture-delivery-${booking.id}` }
        );
      } else if (currentIntent.status !== "succeeded") {
        return Response.json(
          { error: "La préautorisation bancaire n’est plus valide." },
          { status: 409 }
        );
      }
      const capturedIntent = await stripe.paymentIntents.retrieve(payment.stripe_payment_id, {
        expand: ["latest_charge.balance_transaction"],
      });
      const charge = capturedIntent.latest_charge;
      const balanceTransaction = typeof charge === "object" && charge
        ? charge.balance_transaction
        : null;
      const processingFeeCents = typeof balanceTransaction === "object" && balanceTransaction
        ? Number(balanceTransaction.fee || 0)
        : 0;

      const { error: paidError } = await admin.from("payments").update({
        payment_status: "paid",
        stripe_charge_id: typeof charge === "object" && charge ? charge.id : null,
        stripe_balance_transaction_id: typeof balanceTransaction === "object" && balanceTransaction
          ? balanceTransaction.id
          : null,
        processing_fee_cents: processingFeeCents,
        paid_at: new Date().toISOString(),
      }).eq("booking_id", booking.id);
      if (paidError) throw paidError;
      payment.payment_status = "paid";
      payment.processing_fee_cents = processingFeeCents;
    }

    const amountCents = Number(payment.amount_cents);
    const commissionCents = Number(payment.commission_cents);
    const processingFeeCents = Number(payment.processing_fee_cents || 0);
    const transferCents = amountCents - commissionCents - processingFeeCents;
    if (!Number.isInteger(transferCents) || transferCents <= 0) throw new Error("INVALID_TRANSFER_AMOUNT");

    const transfer = await stripe.transfers.create({
      amount: transferCents,
      currency: payment.currency || "eur",
      destination: settings.stripe_connect_account_id,
      transfer_group: `booking_${booking.id}`,
      metadata: { booking_id: booking.id },
    }, { idempotencyKey: `delivery-${booking.id}` });

    await admin.from("payments").update({
      driver_gain: transferCents / 100,
      driver_amount_cents: transferCents,
      payout_status: "transferred",
      stripe_transfer_id: transfer.id,
      released_at: new Date().toISOString(),
    }).eq("booking_id", booking.id);
    const { error: bookingError } = await admin.rpc("stripe_complete_booking", {
      p_booking_id: booking.id,
      p_platform_fee: commissionCents / 100,
      p_driver_amount: transferCents / 100,
    });
    if (bookingError) throw bookingError;

    return Response.json({ status: "released", amount: transferCents / 100 });
  } catch (error) {
    return stripeError(error);
  }
}
