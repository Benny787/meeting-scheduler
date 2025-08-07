// components/AuthControls.tsx
'use client';
import { useSession, signIn, signOut } from 'next-auth/react';

export function AuthControls() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <button
        onClick={() =>
          signIn('google', {
            prompt: 'consent',          // force the consent screen
            access_type: 'offline',     // dev: ensures refresh token the first time
          })
        }
      >
        Sign in with Google
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <img src={session.user?.image || ''} className="w-8 h-8 rounded-full" />
      <span>{session.user?.name || session.user?.email}</span>
      <button onClick={() => signOut({ callbackUrl: window.location.href })}>Sign out</button>
      {/* Handy “fix it” button if token ever gets weird */}
      <button
        onClick={() =>
          signIn('google', { prompt: 'consent', access_type: 'offline' })
        }
      >
        Reconnect Calendar
      </button>
    </div>
  );
}
