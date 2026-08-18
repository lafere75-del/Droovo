import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://ftejnioyumhoqnnrrbzr.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_noEUfSKIxTTAMEsAu7wipA_VSTMwOrw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
