import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Supabase client for API Route Handlers. When `accessToken` is provided the
 * client carries the caller's JWT so Postgres RLS (`owner_id = auth.uid()`)
 * applies exactly as it would for a browser session. Without a token it
 * behaves like a plain anon client — used only for `signInWithPassword`.
 */
export function createRouteClient(accessToken?: string) {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
      global: accessToken
        ? { headers: { Authorization: `Bearer ${accessToken}` } }
        : undefined,
    },
  );
}
