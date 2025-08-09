'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useParams } from 'next/navigation';
import AvailabilityGrid from './AvailabilityGrid';

type BusyRange = { start: string; end: string };
type AggSlot = { start: string; end: string; count: number };

export default function CalendarPanel() {
  const { data: session, status } = useSession();
  const { id: sessionId } = useParams<{ id: string }>(); // meeting id from /meet/[id]

  const [busy, setBusy] = useState<BusyRange[]>([]);                 // aggregated busy (all users)
  const [participants, setParticipants] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Window: today 00:00 -> +7 days (ISO)
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
        // 1) Fetch *my* FreeBusy from Google
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
        const me = await res.json(); // { busy: BusyRange[] }

        // 2) Post my busy ranges to the session cache
        if (sessionId) {
          await fetch(`/api/availability/${sessionId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: fromISO, to: toISO, busy: me.busy ?? [] }),
          });
        }

        // 3) Get aggregated availability for everyone in this session
        let combinedBusy: BusyRange[] = [];
        if (sessionId) {
          const agg = await fetch(
            `/api/availability/${sessionId}?from=${encodeURIComponent(fromISO)}&to=${encodeURIComponent(toISO)}`
          ).then(r => r.json() as Promise<{ slots: AggSlot[]; participants: number }>);

          // Convert slots with count>0 into busy ranges (one per slot; simple & safe)
          combinedBusy = (agg.slots ?? [])
            .filter(s => s.count > 0)
            .map(s => ({ start: s.start, end: s.end }));

          if (!cancelled) setParticipants(agg.participants ?? 0);
        } else {
          // Fallback: just show my busy if no session id (shouldn't happen on /meet/[id])
          combinedBusy = me.busy ?? [];
        }

        if (!cancelled) setBusy(combinedBusy);
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
    return () => { cancelled = true; };
  }, [status, session?.accessToken, fromISO, toISO, sessionId]);

  if (status === 'loading') return <p className="text-gray-500">Checking your session…</p>;
  if (status === 'unauthenticated') return <p className="text-gray-400">Sign in to see availability.</p>;
  if (loading) return <p className="text-gray-500">Loading your availability…</p>;
  if (err) return <p className="text-red-500">{err}</p>;

  return (
    <div className="w-full space-y-2">
      {participants > 0 && (
        <div className="text-sm opacity-80">
          Availability for <strong>{participants}</strong> participant{participants === 1 ? '' : 's'}
        </div>
      )}
      <AvailabilityGrid busy={busy} fromISO={fromISO} toISO={toISO} />
    </div>
  );
}
