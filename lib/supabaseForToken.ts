import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Create a Supabase client that acts as the authenticated user by setting the
 * user's access token on the client. This allows RLS policies to apply.
 */
export function getSupabaseClientForAccessToken(token: string | null): SupabaseClient {
  if (!token) {
    // fallback to anon client
    return createClient(url, anonKey, { auth: { persistSession: false } });
  }
  const client = createClient(url, anonKey, { auth: { persistSession: false } });
  // setAuth is available on the auth client in supabase-js v2 to attach the
  // access token for subsequent requests (so RLS policies see auth.uid()).
  // We call it here to ensure the client uses the request's token.
  // @ts-ignore - setAuth exists at runtime
  client.auth.setAuth(token);
  return client;
}
