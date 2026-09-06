import { useSupabase } from '@/app/providers/SupabaseProvider';
import { SermonRecord } from '@/types/sermon';

export function useSermons() {
  const { supabase, session } = useSupabase();

  const getAuthHeader = () => {
    const token = session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  async function createSermon(payload: Partial<SermonRecord>) {
    const res = await fetch('/api/sermons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async function listSermons() {
    const res = await fetch('/api/sermons', { headers: getAuthHeader() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async function getSermon(id: string) {
    const res = await fetch(`/api/sermons/${id}`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async function updateSermon(id: string, payload: Partial<SermonRecord>) {
    const res = await fetch(`/api/sermons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async function generateMaster(rawNotes: any) {
    const res = await fetch('/api/generate-master', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ rawNotes }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  return { createSermon, listSermons, getSermon, updateSermon, generateMaster };
}
