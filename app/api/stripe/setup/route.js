import { requireApiUser } from "../../../../lib/apiAuth";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";
import { getStripe, stripeError } from "../../../../lib/stripeServer";

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

    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) throw new Error("STRIPE_PUBLISHABLE_KEY_MISSING");

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      metadata: { user_id: auth.user.id },
      usage: "off_session",
    });

    return Response.json({
      clientSecret: setupIntent.client_secret,
      publishableKey,
    });
  } catch (error) {
    return stripeError(error);
  }
}
