import { requireApiUser } from "../../../../lib/apiAuth";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function POST(request) {
  const auth = await requireApiUser(request);
  if (auth.response) return auth.response;

  const { token, platform } = await request.json();
  if (!token || !["ios", "android"].includes(platform)) {
    return Response.json({ error: "Appareil invalide." }, { status: 400 });
  }

  const { error } = await getSupabaseAdmin().from("mobile_devices").upsert(
    {
      user_id: auth.user.id,
      token,
      platform,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "token" }
  );
  if (error) return Response.json({ error: "Notification non enregistrée." }, { status: 500 });
  return Response.json({ status: "registered" });
}

export async function DELETE(request) {
  const auth = await requireApiUser(request);
  if (auth.response) return auth.response;
  const { token } = await request.json();
  await getSupabaseAdmin().from("mobile_devices")
    .delete().eq("user_id", auth.user.id).eq("token", token);
  return Response.json({ status: "removed" });
}
