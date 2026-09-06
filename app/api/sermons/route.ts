import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabaseClient } from '@/lib/supabaseClient';
import { SermonRecordSchema } from '@/types/sermon';

const CreateSchema = SermonRecordSchema.pick({
  user_id: true,
  title: true,
  primary_passage: true,
  series: true,
  sermon_date: true,
  audience: true,
  raw_notes: true,
}).partial();

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const supabase = getServiceSupabaseClient();
  const insert = parsed.data;

  const { data, error } = await supabase.from('sermons').insert([insert]).select().single();
  if (error) {
    console.error('supabase insert error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sermon: data });
}

export async function GET(req: Request) {
  // list sermons for a user. Accept ?user_id= query param for now
  const url = new URL(req.url);
  const userId = url.searchParams.get('user_id');
  const supabase = getServiceSupabaseClient();

  if (!userId) {
    return NextResponse.json({ error: 'user_id required' }, { status: 400 });
  }

  const { data, error } = await supabase.from('sermons').select('*').eq('user_id', userId).order('updated_at', { ascending: false });
  if (error) {
    console.error('supabase select error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sermons: data });
}
