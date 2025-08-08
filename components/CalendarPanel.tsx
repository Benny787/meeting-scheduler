'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';

type BusyRange = { start: string; end: string };

export default function CalendarPanel() {
  const { data: session, status } = useSession();
  const [busy, setBusy] = useState<BusyRange[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Define a default 7‑day window (now -> +7d). You can adjust from/to via UI later.
  const { fromISO, toISO } = useMemo(() => {
    const from = new Date();
    const to = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return { fromISO: from.toISOString(), toISO: to.toISOString() };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch('/api/calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: fromISO, to: toISO }),
        });
        if (!res.ok) {
          // If we’re authenticated but get a 401, access token might be missing/expired.
          if (res.status === 401) {
            // Safety fallback: force a consented sign‑in to guarantee calendar connection.
            await signIn('google', { prompt: 'consent', callbackUrl: window.location.href });
            return;
          }
          throw new Error(await res.text());
        }
        const data = await res.json();
        if (!cancelled) {
          setBusy(data.busy ?? []);
        }
      } catch (e) {
        console.error('[Calendar fetch error]', e);
        if (!cancelled) setErr('Failed to load calendar availability.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (status === 'authenticated') {
      // We expect calendar to be connected on first sign‑in.
      // If accessToken is somehow missing, try a quick re-consent.
      if (!session?.accessToken) {
        signIn('google', { prompt: 'consent', callbackUrl: window.location.href });
        return;
      }
      load();
    }
    return () => {
      cancelled = true;
    };
  }, [status, session?.accessToken, fromISO, toISO]);

  if (status === 'loading') return <p className="text-gray-500">Checking your session…</p>;
  if (status === 'unauthenticated')
    return <p className="text-gray-400">Sign in to see calendar availability.</p>;

  if (loading) return <p className="text-gray-500">Loading your availability…</p>;
  if (err) return <p className="text-red-500">{err}</p>;

  if (!busy.length) return <p className="text-gray-400">No busy blocks in the next 7 days 🎉</p>;

  return (
    <div className="text-left space-y-2">
      <div className="text-sm mb-2 opacity-80">
        Busy blocks (Google FreeBusy) over the next 7 days:
      </div>
      <ul className="space-y-2">
        {busy.map((b, i) => (
          <li key={`${b.start}-${b.end}-${i}`} className="p-3 rounded bg-gray-800/40">
            <div className="font-medium">
              {new Date(b.start).toLocaleString()} → {new Date(b.end).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
