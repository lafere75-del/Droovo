import { requireApiUser } from "../../../../lib/apiAuth";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";
import { getAppUrl, getStripe, stripeError } from "../../../../lib/stripeServer";

export async function POST(request) {
  const auth = await requireApiUser(request);
  if (auth.response) return auth.response;

  try {
    const stripe = getStripe();
    const admin = getSupabaseAdmin();
    const { data: settings } = await admin
      .from("payment_settings")
      .select("stripe_customer_id")
      .eq("user_id", auth.user.id)
      .maybeSingle();

    let customerId = settings?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create(
        {
          email: auth.user.email || undefined,
          metadata: { droovo_user_id: auth.user.id },
        },
        { idempotencyKey: `droovo-customer-${auth.user.id}` }
      );
      customerId = customer.id;
      const { error } = await admin.from("payment_settings").upsert(
        { user_id: auth.user.id, stripe_customer_id: customerId },
        { onConflict: "user_id" }
      );
      if (error) throw error;
    }

    const appUrl = getAppUrl(request);
    const session = await stripe.checkout.sessions.create({
      mode: "setup",
      customer: customerId,
      metadata: { user_id: auth.user.id },
      success_url: `${appUrl}/dashboard/paiements?setup=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard/paiements?setup=cancelled`,
      integration_identifier: "droovo_setup_qmtrzvka",
    });

    return Response.json({ url: session.url });
  } catch (error) {
    return stripeError(error);
  }
}
