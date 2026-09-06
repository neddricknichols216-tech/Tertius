"use client";

import React, { useState } from 'react';
import { useSupabase } from '@/app/providers/SupabaseProvider';

export default function SignIn() {
  const { supabase } = useSupabase();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase!.auth.signInWithOtp({ email });
      if (error) throw error;
      setMessage('Check your email for the magic link to sign in.');
    } catch (err: any) {
      console.error(err);
      setMessage(err?.message || 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Sending…' : 'Sign in'}
      </button>
      {message && <div style={{ marginLeft: 8 }}>{message}</div>}
    </form>
  );
}
