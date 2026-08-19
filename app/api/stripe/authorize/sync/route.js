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
      .select("id,sender_id,packages(price)")
      .eq("id", bookingId)
      .eq("sender_id", auth.user.id)
      .maybeSingle();
    if (!booking) return Response.json({ error: "Paiement introuvable." }, { status: 404 });

    const admin = getSupabaseAdmin();
    const { data: payment } = await admin.from("payments").select("*")
      .eq("booking_id", booking.id).maybeSingle();
    if (!payment?.stripe_payment_id) {
      return Response.json({ error: "Préautorisation introuvable." }, { status: 404 });
    }

    const intent = await getStripe().paymentIntents.retrieve(payment.stripe_payment_id);
    if (intent.metadata?.sender_id !== auth.user.id || intent.status !== "requires_capture") {
      return Response.json({ error: "La validation bancaire n’est pas terminée." }, { status: 409 });
    }

    const commissionCents = Number(payment.commission_cents || intent.metadata?.commission_cents || 0);
    const amountCents = Number(payment.amount_cents || intent.amount || 0);
    await admin.from("payments").update({ payment_status: "authorized" })
      .eq("booking_id", booking.id);
    const { error } = await admin.rpc("stripe_mark_booking_authorized", {
      p_booking_id: booking.id,
      p_platform_fee: commissionCents / 100,
      p_driver_amount: (amountCents - commissionCents) / 100,
    });
    if (error) throw error;

    return Response.json({ status: "authorized" });
  } catch (error) {
    return stripeError(error);
  }
}
