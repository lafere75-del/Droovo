import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./supabaseClient";

let adminClient;

export function getSupabaseAdmin() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_ADMIN_NOT_CONFIGURED");
  }

  adminClient ||= createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return adminClient;
}
