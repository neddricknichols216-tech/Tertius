"use client";

import React from 'react';
import { useSupabase } from '@/app/providers/SupabaseProvider';

export default function SignOut() {
  const { supabase, user } = useSupabase();

  const handleSignOut = async () => {
    try {
      await supabase!.auth.signOut();
    } catch (err) {
      console.error('sign out error', err);
    }
  };

  if (!user) return null;

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <span>{user.email}</span>
      <button onClick={handleSignOut}>Sign out</button>
    </div>
  );
}
