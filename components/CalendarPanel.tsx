'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import AvailabilityGrid from './AvailabilityGrid';

type BusyRange = { start: string; end: string };

export default function CalendarPanel() {
  const { data: session, status } = useSession();
  const [busy, setBusy] = useState<BusyRange[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Window: today -> +7 days (ISO)
  const { fromISO, toISO } = useMemo(() => {
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setDate(to.getDate() + 7);
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
          if (res.status === 401) {
            await signIn('google', { prompt: 'consent', callbackUrl: window.location.href });
            return;
          }
          throw new Error(await res.text());
        }
        const data = await res.json();
        if (!cancelled) setBusy(data.busy ?? []);
      } catch (e) {
        console.error('[Calendar fetch error]', e);
        if (!cancelled) setErr('Failed to load calendar availability.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (status === 'authenticated') {
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
  if (status === 'unauthenticated') return <p className="text-gray-400">Sign in to see availability.</p>;
  if (loading) return <p className="text-gray-500">Loading your availability…</p>;
  if (err) return <p className="text-red-500">{err}</p>;

  return (
    <div className="w-full">
      <AvailabilityGrid busy={busy} fromISO={fromISO} toISO={toISO} />
    </div>
  );
}
