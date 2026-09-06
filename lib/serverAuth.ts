import { getServiceSupabaseClient } from '@/lib/supabaseClient';

export async function requireUserFromRequest(req: Request) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.split(' ')[1];
  if (!token) return { error: 'missing token' };

  const supabase = getServiceSupabaseClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error) return { error: error.message };
  if (!data.user) return { error: 'no user' };
  return { user: data.user };
}
