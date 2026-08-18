import { requireApiUser } from "../../../../lib/apiAuth";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";
import { getAppUrl, getStripe, stripeError } from "../../../../lib/stripeServer";

export async function POST(request) {
  const auth = await requireApiUser(request);
  if (auth.response) return auth.response;

  try {
    const { bookingId } = await request.json();
    if (!bookingId) return Response.json({ error: "Réservation manquante." }, { status: 400 });

    const { data: booking, error } = await auth.client
      .from("bookings")
      .select("id,package_id,sender_id,driver_id,status,payment_status,packages(title,price)")
      .eq("id", bookingId)
      .eq("sender_id", auth.user.id)
      .maybeSingle();

    if (error || !booking) return Response.json({ error: "Réservation introuvable." }, { status: 404 });
    if (booking.status !== "accepted") return Response.json({ error: "Le transporteur doit d’abord accepter la demande." }, { status: 409 });
    if (booking.payment_status === "paid") return Response.json({ error: "Cette livraison est déjà payée." }, { status: 409 });

    const amountCents = Math.round(Number(booking.packages?.price || 0) * 100);
    if (!Number.isInteger(amountCents) || amountCents < 50) {
      return Response.json({ error: "Montant de paiement invalide." }, { status: 400 });
    }

    const commissionCents = Math.round(amountCents * 0.25);
    const stripe = getStripe();
    const appUrl = getAppUrl(request);
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        customer_email: auth.user.email || undefined,
        line_items: [{
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: amountCents,
            product_data: { name: `Transport Droovo — ${booking.packages?.title || "Colis"}` },
          },
        }],
        metadata: {
          booking_id: booking.id,
          sender_id: booking.sender_id,
          driver_id: booking.driver_id,
          commission_cents: String(commissionCents),
        },
        success_url: `${appUrl}/dashboard/paiements?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/dashboard/paiements?payment=cancelled`,
        integration_identifier: "droovo_web_qmtrzvka",
      },
      { idempotencyKey: `checkout-${booking.id}` }
    );

    const admin = getSupabaseAdmin();
    const { error: saveError } = await admin.from("payments").upsert({
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
      payment_status: "checkout_created",
      payout_status: "blocked_until_delivery",
      stripe_checkout_session_id: session.id,
    }, { onConflict: "booking_id" });

    if (saveError) throw saveError;
    return Response.json({ url: session.url });
  } catch (error) {
    return stripeError(error);
  }
}
