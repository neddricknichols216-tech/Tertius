"use client";

import React, { useState } from 'react';
import { useSermons } from '@/lib/useSermons';
import { useSupabase } from '@/app/providers/SupabaseProvider';
import SermonPreview from '@/components/SermonPreview';

export default function NewSermonPage() {
  const { createSermon, generateMaster, updateSermon } = useSermons();
  const { user } = useSupabase();

  const [title, setTitle] = useState('');
  const [passage, setPassage] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [master, setMaster] = useState<any | null>(null);
  const [sermonId, setSermonId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateAndGenerate = async () => {
    setError(null);
    if (!user) return setError('You must be signed in to save.');
    setLoading(true);
    try {
      // Create sermon
      const createResp = await createSermon({
        title,
        primary_passage: passage,
        raw_notes: { text: notes },
      });
      const id = createResp.sermon.id;
      setSermonId(id);

      // Call generation
      const genResp = await generateMaster({ title, passage, notes });
      const masterSermon = genResp.master;
      setMaster(masterSermon);

      // Save master_sermon back to sermon
      await updateSermon(id, { master_sermon: masterSermon });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <h2>New Sermon</h2>
      <div style={{ display: 'grid', gap: 8 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sermon title" />
        <input value={passage} onChange={(e) => setPassage(e.target.value)} placeholder="Primary passage" />
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Pastor notes (raw)" rows={6} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleCreateAndGenerate} disabled={loading}>
            {loading ? 'Working…' : 'Create & Generate Master Sermon'}
          </button>
          {sermonId && <span>Saved (id: {sermonId})</span>}
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {master && (
          <div>
            <h3>Generated Master Sermon</h3>
            <SermonPreview master={master} />
          </div>
        )}
      </div>
    </div>
  );
}
