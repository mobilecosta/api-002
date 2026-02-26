import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env, getMissingEnvVars } from "./env";

let client: SupabaseClient<any, "public", any> | null = null;

export const getSupabase = () => {
  if (client) return client;

  const missing = getMissingEnvVars();
  const hasRequiredEnv = missing.length === 0;

  client = createClient<any>(
    hasRequiredEnv ? env.SUPABASE_URL : "https://invalid.local",
    hasRequiredEnv ? env.SUPABASE_SERVICE_ROLE_KEY : "invalid",
    {
    auth: { persistSession: false }
    }
  );

  return client;
};
