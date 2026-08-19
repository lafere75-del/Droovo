import { requireApiUser } from "../../../../lib/apiAuth";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";
import { getStripe } from "../../../../lib/stripeServer";

const CLOSED_BOOKING_STATUSES = ["completed", "cancelled", "rejected"];

export async function POST(request) {
  const auth = await requireApiUser(request);
  if (auth.response) return auth.response;

  const { confirmation } = await request.json();
  if (confirmation !== "SUPPRIMER") {
    return Response.json({ error: "Confirmation invalide." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { data: activeBookings, error: bookingError } = await admin
    .from("bookings")
    .select("id")
    .or(`sender_id.eq.${auth.user.id},driver_id.eq.${auth.user.id}`)
    .not("status", "in", `(${CLOSED_BOOKING_STATUSES.join(",")})`)
    .limit(1);
  if (bookingError) return Response.json({ error: "Vérification du compte impossible." }, { status: 500 });
  if (activeBookings?.length) {
    return Response.json(
      { error: "Terminez ou annulez vos livraisons en cours avant de supprimer le compte." },
      { status: 409 }
    );
  }

  const { data: settings } = await admin.from("payment_settings")
    .select("stripe_customer_id")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (settings?.stripe_customer_id) {
    try {
      await getStripe().customers.del(settings.stripe_customer_id);
    } catch {
      // La suppression du compte Droovo ne doit pas être bloquée par une indisponibilité Stripe.
    }
  }

  const { data: identityFiles } = await admin.storage.from("identity-documents")
    .list(auth.user.id, { limit: 1000 });
  if (identityFiles?.length) {
    await admin.storage.from("identity-documents")
      .remove(identityFiles.map((file) => `${auth.user.id}/${file.name}`));
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(auth.user.id);
  if (deleteError) {
    return Response.json({ error: "La suppression du compte n’a pas pu être finalisée." }, { status: 500 });
  }
  return Response.json({ status: "deleted" });
}
