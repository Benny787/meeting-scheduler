'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useParams } from 'next/navigation';

export function AuthControls() {
  const { data: session, status } = useSession();
  const { id } = useParams<{ id: string }>();

  // Not signed in → single Google sign-in that also connects Calendar.
  if (status !== 'authenticated') {
    return (
      <button
        onClick={() =>
          signIn('google', {
            // NextAuth provider already includes calendar scope + offline tokens
            // Just make sure we land back in the same room:
            callbackUrl: `/meet/${id}`,
          })
        }
      >
        Sign in with Google
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <img src={session.user?.image || ''} className="w-8 h-8 rounded-full" alt="" />
      <span>{session.user?.name || session.user?.email}</span>
      <button onClick={() => signOut({ callbackUrl: `/meet/${id}` })}>Sign out</button>
    </div>
  );
}
