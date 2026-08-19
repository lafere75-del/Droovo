import { requireApiUser } from "../../../../lib/apiAuth";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";
import { getStripe, stripeError } from "../../../../lib/stripeServer";
import { legalNamesMatch } from "../../../../lib/identityName";

export async function POST(request) {
  const auth = await requireApiUser(request);
  if (auth.response) return auth.response;

  try {
    const { bookingId } = await request.json();
    if (!bookingId) {
      return Response.json({ error: "Réservation manquante." }, { status: 400 });
    }

    const { data: booking, error: bookingError } = await auth.client
      .from("bookings")
      .select("id,package_id,sender_id,driver_id,created_by,status,payment_status,packages(title,price)")
      .eq("id", bookingId)
      .maybeSingle();
    if (bookingError || !booking || ![booking.sender_id, booking.driver_id].includes(auth.user.id)) {
      return Response.json({ error: "Réservation introuvable." }, { status: 404 });
    }
    if (booking.status === "pending" && booking.created_by === auth.user.id) {
      return Response.json({ error: "La demande doit être acceptée par l’autre participant." }, { status: 403 });
    }
    if (!["pending", "accepted"].includes(booking.status)) {
      return Response.json({ error: "Cette demande ne peut plus être acceptée." }, { status: 409 });
    }
    if (["authorized", "paid"].includes(booking.payment_status)) {
      return Response.json({ status: booking.payment_status });
    }

    const admin = getSupabaseAdmin();
    const { data: settings } = await admin
      .from("payment_settings")
      .select("stripe_customer_id,stripe_payment_method_id,card_consent_at")
      .eq("user_id", booking.sender_id)
      .maybeSingle();
    if (!settings?.stripe_customer_id || !settings?.stripe_payment_method_id || !settings?.card_consent_at) {
      return Response.json(
        { error: "L’expéditeur doit enregistrer sa carte et autoriser les paiements avant de choisir un transporteur." },
        { status: 409 }
      );
    }

    const { data: senderProfile } = await admin.from("profiles")
      .select("fullname,identity_status")
      .eq("id", booking.sender_id)
      .maybeSingle();
    if (senderProfile?.identity_status !== "verified") {
      return Response.json(
        { error: "L’identité de l’expéditeur doit être validée avant toute préautorisation." },
        { status: 409 }
      );
    }

    const stripe = getStripe();
    const savedPaymentMethod = await stripe.paymentMethods.retrieve(settings.stripe_payment_method_id);
    if (!legalNamesMatch(savedPaymentMethod.billing_details?.name, senderProfile.fullname)) {
      return Response.json(
        { error: "Le titulaire de la carte ne correspond pas à l’identité vérifiée." },
        { status: 409 }
      );
    }

    const amountCents = Math.round(Number(booking.packages?.price || 0) * 100);
    if (!Number.isInteger(amountCents) || amountCents < 50) {
      return Response.json({ error: "Montant invalide." }, { status: 400 });
    }
    const commissionCents = Math.round(amountCents * 0.25);
    const intent = await stripe.paymentIntents.create(
      {
        amount: amountCents,
        currency: "eur",
        customer: settings.stripe_customer_id,
        payment_method: settings.stripe_payment_method_id,
        confirm: true,
        off_session: false,
        capture_method: "manual",
        description: `Transport Droovo — ${booking.packages?.title || "Colis"}`,
        metadata: {
          booking_id: booking.id,
          sender_id: booking.sender_id,
          driver_id: booking.driver_id,
          commission_cents: String(commissionCents),
        },
      },
      { idempotencyKey: `authorize-${booking.id}` }
    );

    if (!["requires_capture", "requires_action"].includes(intent.status)) {
      return Response.json(
        { error: "La banque n’a pas confirmé la préautorisation. L’expéditeur doit vérifier son moyen de paiement." },
        { status: 409 }
      );
    }

    const { error: saveError } = await admin.from("payments").upsert(
      {
        booking_id: booking.id,
        package_id: booking.package_id,
        sender_id: booking.sender_id,
        driver_id: booking.driver_id,
        amount: amountCents / 100,
        droovo_commission: commissionCents / 100,
        driver_gain: (amountCents - commissionCents) / 100,
        amount_cents: amountCents,
        commission_cents: commissionCents,
        currency: "eur",
        payment_status: intent.status === "requires_capture" ? "authorized" : "requires_action",
        payout_status: "blocked_until_delivery",
        stripe_payment_id: intent.id,
      },
      { onConflict: "booking_id" }
    );
    if (saveError) throw saveError;

    if (intent.status === "requires_capture") {
      const { error: rpcError } = await admin.rpc("stripe_mark_booking_authorized", {
        p_booking_id: booking.id,
        p_platform_fee: commissionCents / 100,
        p_driver_amount: (amountCents - commissionCents) / 100,
      });
      if (rpcError) throw rpcError;
    }

    return Response.json({
      status: intent.status === "requires_capture" ? "authorized" : "requires_action",
      senderActionRequired: intent.status === "requires_action",
    });
  } catch (error) {
    if (error?.code === "authentication_required" || error?.code === "card_declined") {
      return Response.json(
        { error: "La banque demande une nouvelle validation de la carte par l’expéditeur." },
        { status: 409 }
      );
    }
    return stripeError(error);
  }
}
