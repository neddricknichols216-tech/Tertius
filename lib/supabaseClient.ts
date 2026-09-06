import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let anonClient: SupabaseClient | null = null;
let serviceClient: SupabaseClient | null = null;

export function getAnonSupabaseClient(): SupabaseClient {
  if (!anonClient) {
    anonClient = createClient(url, anonKey, {
      auth: { persistSession: false },
    });
  }
  return anonClient;
}

export function getServiceSupabaseClient(): SupabaseClient {
  if (!serviceClient) {
    if (!serviceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required on the server');
    }
    serviceClient = createClient(url, serviceRoleKey);
  }
  return serviceClient;
}
