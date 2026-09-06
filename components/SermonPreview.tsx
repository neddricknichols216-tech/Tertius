"use client";

import React from 'react';

export default function SermonPreview({ master }: { master: any }) {
  return (
    <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6 }}>
      <h4>{master.title}</h4>
      <p><strong>Big idea:</strong> {master.bigIdea}</p>
      <p><strong>Desired response:</strong> {master.desiredResponse}</p>
      <div>
        {Array.isArray(master.movements) && master.movements.map((m: any, i: number) => (
          <div key={i} style={{ padding: 8, borderTop: '1px solid #eee' }}>
            <strong>{m.title}</strong>
            <div>{m.content}</div>
            <small>Priority: {m.priority} — Locked: {m.locked ? 'yes' : 'no'}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
