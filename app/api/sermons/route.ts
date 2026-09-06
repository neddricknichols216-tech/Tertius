import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabaseClient } from '@/lib/supabaseClient';
import { SermonRecordSchema } from '@/types/sermon';
import { requireUserFromRequest } from '@/lib/serverAuth';

const CreateSchema = SermonRecordSchema.pick({
  title: true,
  primary_passage: true,
  series: true,
  sermon_date: true,
  audience: true,
  raw_notes: true,
}).partial();

export async function POST(req: Request) {
  const authCheck = await requireUserFromRequest(req);
  if ('error' in authCheck) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const user = authCheck.user;

  const body = await req.json().catch(() => ({}));
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const supabase = getServiceSupabaseClient();
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
  const user = authCheck.user;

  const supabase = getServiceSupabaseClient();
  const { data, error } = await supabase.from('sermons').select('*').eq('user_id', user.id).order('updated_at', { ascending: false });
  if (error) {
    console.error('supabase select error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sermons: data });
}
