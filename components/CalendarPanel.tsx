'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

type GEvent = {
  id?: string;
  summary?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
};

export default function CalendarPanel() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<GEvent[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') return;
    // If we don’t have an access token yet, don’t fetch calendar
    if (!session?.accessToken) return;

    let cancelled = false;
    setLoading(true);
    setErr(null);

    fetch('/api/calendar')
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then((items: GEvent[]) => {
        if (!cancelled) setEvents(items ?? []);
      })
      .catch((e) => {
        if (!cancelled) setErr('Failed to load calendar.');
        console.error('[Calendar fetch error]', e);
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [status, session?.accessToken]);

  if (status === 'loading') {
    return <p className="text-gray-500">Checking your session…</p>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="space-y-3">
        <p className="text-gray-400">You’re not signed in.</p>
        <button
          className="px-3 py-2 rounded bg-blue-600 text-white"
          onClick={() => signIn('google')}
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  // Authenticated but missing token -> force a consented sign-in
  if (!session?.accessToken) {
    return (
      <div className="space-y-3">
        <p className="text-gray-400">Google Calendar is not connected.</p>
        <button
          className="px-3 py-2 rounded bg-blue-600 text-white"
          onClick={() =>
            signIn('google', {
              // ensures Google shows the consent screen again
              prompt: 'consent',
              // keep same scope as your provider configuration (redundant but explicit)
              // NOTE: next-auth will merge/override with provider’s default scope
              callbackUrl: window.location.href,
            })
          }
        >
          Connect Google Calendar
        </button>
        <button
          className="px-3 py-2 rounded bg-gray-700 text-white"
          onClick={() => signOut()}
        >
          Sign out
        </button>
      </div>
    );
  }

  if (loading) return <p className="text-gray-500">Loading your events…</p>;
  if (err) return <p className="text-red-500">{err}</p>;
  if (!events || events.length === 0)
    return <p className="text-gray-400">No events found.</p>;

  return (
    <ul className="text-left space-y-2">
      {events.map((e) => {
        const start =
          e.start?.dateTime ?? e.start?.date ?? '(no start time provided)';
        return (
          <li key={e.id ?? Math.random()} className="p-3 rounded bg-gray-800/40">
            <div className="font-medium">{e.summary ?? '(no title)'}</div>
            <div className="text-sm opacity-80">{start}</div>
          </li>
        );
      })}
    </ul>
  );
}
