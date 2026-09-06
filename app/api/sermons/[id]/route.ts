import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabaseClient } from '@/lib/supabaseClient';
import { SermonRecordSchema } from '@/types/sermon';
import { requireUserFromRequest } from '@/lib/serverAuth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const authCheck = await requireUserFromRequest(req);
  if ('error' in authCheck) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const user = authCheck.user;

  const supabase = getServiceSupabaseClient();
  const id = params.id;
  const { data, error } = await supabase.from('sermons').select('*').eq('id', id).maybeSingle();
  if (error) {
    console.error('supabase select error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (data.user_id !== user.id) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  return NextResponse.json({ sermon: data });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const authCheck = await requireUserFromRequest(req);
  if ('error' in authCheck) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const user = authCheck.user;

  const body = await req.json().catch(() => ({}));
  const parsed = SermonRecordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const supabase = getServiceSupabaseClient();
  const id = params.id;

  // Fetch existing sermon to optionally create a revision
  const { data: existing } = await supabase.from('sermons').select('*').eq('id', id).maybeSingle();
  if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (existing.user_id !== user.id) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const updates = parsed.data as any;
  updates.updated_at = new Date().toISOString();

  // If master_sermon changed, create a revision
  if (updates.master_sermon && JSON.stringify(updates.master_sermon) !== JSON.stringify(existing.master_sermon)) {
    await supabase.from('sermon_revisions').insert([{ sermon_id: id, user_id: user.id, master_sermon: existing.master_sermon, summary: 'auto-revision' }]);
  }

  const { data, error } = await supabase.from('sermons').update(updates).eq('id', id).select().maybeSingle();
  if (error) {
    console.error('supabase update error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sermon: data });
}
