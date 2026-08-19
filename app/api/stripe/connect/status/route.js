import { requireApiUser } from "../../../../../lib/apiAuth";
import { getSupabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { getStripe, stripeError } from "../../../../../lib/stripeServer";
import { getStripeIdentityName, legalNamesMatch } from "../../../../../lib/identityName";

export async function POST(request) {
  const auth = await requireApiUser(request);
  if (auth.response) return auth.response;

  try {
    const admin = getSupabaseAdmin();
    const { data: settings } = await admin.from("payment_settings")
      .select("stripe_connect_account_id")
      .eq("user_id", auth.user.id)
      .maybeSingle();
    if (!settings?.stripe_connect_account_id) {
      return Response.json({ status: "not_started" });
    }

    const account = await getStripe().v2.core.accounts.retrieve(
      settings.stripe_connect_account_id,
      { include: ["configuration.recipient", "requirements"] }
    );
    const { data: profile } = await admin.from("profiles")
      .select("fullname,identity_status")
      .eq("id", auth.user.id)
      .maybeSingle();
    if (profile?.identity_status !== "verified") {
      await admin.from("payment_settings")
        .update({ connect_onboarding_status: "identity_pending" })
        .eq("user_id", auth.user.id);
      return Response.json({ status: "identity_pending" });
    }
    if (!legalNamesMatch(getStripeIdentityName(account), profile?.fullname)) {
      await admin.from("payment_settings")
        .update({ connect_onboarding_status: "identity_mismatch" })
        .eq("user_id", auth.user.id);
      return Response.json({ status: "identity_mismatch" });
    }
    const transferStatus = account.configuration?.recipient
      ?.capabilities?.stripe_balance?.stripe_transfers?.status;
    const status = transferStatus === "active"
      ? "active"
      : ["restricted", "inactive"].includes(transferStatus)
        ? "restricted"
        : "pending";

    await admin.from("payment_settings").update({ connect_onboarding_status: status })
      .eq("user_id", auth.user.id);
    return Response.json({ status });
  } catch (error) {
    return stripeError(error);
  }
}
