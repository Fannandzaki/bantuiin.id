import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Stateless Supabase client for public read-only operations.
 * Does not read or write cookies, enabling high-performance ISR static caching.
 */
export function createPublicClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-id.supabase.co";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
