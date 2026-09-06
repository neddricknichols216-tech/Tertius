import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseClientForAccessToken } from '@/lib/supabaseForToken';
import { SermonRecordSchema } from '@/types/sermon';

const CreateSchema = SermonRecordSchema.pick({
  title: true,
  primary_passage: true,
  series: true,
  sermon_date: true,
  audience: true,
  raw_notes: true,
}).partial();

async function requireUserFromRequest(req: Request) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.split(' ')[1] || null;
  if (!token) return { error: 'missing token' };
  const supabase = getSupabaseClientForAccessToken(token);
  const { data, error } = await supabase.auth.getUser();
  if (error) return { error: error.message };
  if (!data.user) return { error: 'no user' };
  return { user: data.user, supabase };
}

export async function POST(req: Request) {
  const authCheck = await requireUserFromRequest(req);
  if ('error' in authCheck) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { user, supabase } = authCheck;

  const body = await req.json().catch(() => ({}));
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const insert = { ...parsed.data, user_id: user.id };

  const { data, error } = await supabase.from('sermons').insert([insert]).select().single();
  if (error) {
    console.error('supabase insert error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sermon: data });
}

export async function GET(req: Request) {
  const authCheck = await requireUserFromRequest(req);
  if ('error' in authCheck) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { user, supabase } = authCheck;

  const { data, error } = await supabase.from('sermons').select('*').eq('user_id', user.id).order('updated_at', { ascending: false });
  if (error) {
    console.error('supabase select error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sermons: data });
}
