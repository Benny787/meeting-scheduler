'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export function AuthControls() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return null; // Or loading indicator
  }

  return (
    <div className="space-x-2">
      {session ? (
        <button
          onClick={() => signOut()}
          className="px-4 py-2 rounded bg-red-500 text-white"
        >
          Sign out
        </button>
      ) : (
        <button
          onClick={() => signIn('google')}
          className="px-4 py-2 rounded bg-blue-500 text-white"
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
}
