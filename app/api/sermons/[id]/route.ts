import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseClientForAccessToken } from '@/lib/supabaseForToken';
import { SermonRecordSchema } from '@/types/sermon';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.split(' ')[1] || null;
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const supabase = getSupabaseClientForAccessToken(token);

  const id = params.id;
  const { data, error } = await supabase.from('sermons').select('*').eq('id', id).maybeSingle();
  if (error) {
    console.error('supabase select error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 });
  // RLS should enforce ownership, but double-check and return 403 if mismatch
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (data.user_id !== userData.user.id) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  return NextResponse.json({ sermon: data });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.split(' ')[1] || null;
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const supabase = getSupabaseClientForAccessToken(token);

  const body = await req.json().catch(() => ({}));
  const parsed = SermonRecordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const id = params.id;

  // Fetch existing sermon to optionally create a revision
  const { data: existing, error: readErr } = await supabase.from('sermons').select('*').eq('id', id).maybeSingle();
  if (readErr) {
    console.error('supabase select error', readErr);
    return NextResponse.json({ error: readErr.message }, { status: 500 });
  }
  if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });

  // Ensure ownership via RLS and/or check
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (existing.user_id !== userData.user.id) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const updates = parsed.data as any;
  updates.updated_at = new Date().toISOString();

  // If master_sermon changed, create a revision (this insert will run as the user via the token)
  if (updates.master_sermon && JSON.stringify(updates.master_sermon) !== JSON.stringify(existing.master_sermon)) {
    const { error: revErr } = await supabase.from('sermon_revisions').insert([{ sermon_id: id, user_id: userData.user.id, master_sermon: existing.master_sermon, summary: 'auto-revision' }]);
    if (revErr) console.error('revision insert error', revErr);
  }

  const { data, error } = await supabase.from('sermons').update(updates).eq('id', id).select().maybeSingle();
  if (error) {
    console.error('supabase update error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sermon: data });
}
