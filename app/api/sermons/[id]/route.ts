import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabaseClient } from '@/lib/supabaseClient';
import { SermonRecordSchema } from '@/types/sermon';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = getServiceSupabaseClient();
  const id = params.id;
  const { data, error } = await supabase.from('sermons').select('*').eq('id', id).maybeSingle();
  if (error) {
    console.error('supabase select error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ sermon: data });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const parsed = SermonRecordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const supabase = getServiceSupabaseClient();
  const id = params.id;

  const updates = parsed.data;
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase.from('sermons').update(updates).eq('id', id).select().maybeSingle();
  if (error) {
    console.error('supabase update error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sermon: data });
}
