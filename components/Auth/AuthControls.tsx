import React from 'react';
import SignIn from '@/components/Auth/SignIn';
import SignOut from '@/components/Auth/SignOut';
import { useSupabase } from '@/app/providers/SupabaseProvider';

export default function AuthControls() {
  const { user } = useSupabase();
  return <div>{user ? <SignOut /> : <SignIn />}</div>;
}
