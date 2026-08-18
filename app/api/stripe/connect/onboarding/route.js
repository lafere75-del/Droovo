import { requireApiUser } from "../../../../../lib/apiAuth";
import { getSupabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { getAppUrl, getStripe, stripeError } from "../../../../../lib/stripeServer";

export async function POST(request) {
  const auth = await requireApiUser(request);
  if (auth.response) return auth.response;

  try {
    const stripe = getStripe();
    const admin = getSupabaseAdmin();
    const { data: profile } = await auth.client
      .from("profiles")
      .select("fullname,first_name,last_name,email")
      .eq("id", auth.user.id)
      .maybeSingle();
    const { data: settings } = await auth.client
      .from("payment_settings")
      .select("stripe_connect_account_id")
      .eq("user_id", auth.user.id)
      .maybeSingle();

    let accountId = settings?.stripe_connect_account_id;
    if (!accountId) {
      const account = await stripe.v2.core.accounts.create({
        contact_email: auth.user.email,
        display_name: profile?.fullname || [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Transporteur Droovo",
        identity: { country: "fr", entity_type: "individual" },
        dashboard: "express",
        defaults: {
          responsibilities: {
            fees_collector: "application",
            losses_collector: "application",
          },
        },
        configuration: {
          recipient: {
            capabilities: {
              stripe_balance: { stripe_transfers: { requested: true } },
            },
          },
        },
      });
      accountId = account.id;
      const { error } = await admin.from("payment_settings").upsert({
        user_id: auth.user.id,
        stripe_connect_account_id: accountId,
        connect_onboarding_status: "pending",
      }, { onConflict: "user_id" });
      if (error) throw error;
    }

    const appUrl = getAppUrl(request);
    const accountLink = await stripe.v2.core.accountLinks.create({
      account: accountId,
      use_case: {
        type: "account_onboarding",
        account_onboarding: {
          configurations: ["recipient"],
          refresh_url: `${appUrl}/dashboard/paiements?connect=refresh`,
          return_url: `${appUrl}/dashboard/paiements?connect=returned`,
        },
      },
    });

    return Response.json({ url: accountLink.url });
  } catch (error) {
    return stripeError(error);
  }
}
