'use client';

import { useMemo } from 'react';

type BusyRange = { start: string; end: string };

type Props = {
  busy: BusyRange[];
  fromISO: string;
  toISO: string;
};

function overlaps(slotStart: Date, slotEnd: Date, busy: BusyRange[]) {
  const s = slotStart.getTime();
  const e = slotEnd.getTime();
  for (const b of busy) {
    const bs = new Date(b.start).getTime();
    const be = new Date(b.end).getTime();
    if (s < be && bs < e) return true;
  }
  return false;
}

export default function AvailabilityGrid({ busy, fromISO, toISO }: Props) {
  const { days, times } = useMemo(() => {
    const start = new Date(fromISO);
    start.setSeconds(0, 0);
    const dayList: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dayList.push(d);
    }

    const timeList: { label: string; minutesFrom0800: number }[] = [];
    for (let m = 0; m < 12 * 60; m += 30) {
      const totalMin = 8 * 60 + m;
      const hh = Math.floor(totalMin / 60);
      const mm = totalMin % 60;
      const label =
        (hh % 12 === 0 ? 12 : hh % 12) +
        ':' +
        (mm === 0 ? '00' : '30') +
        (hh < 12 ? ' AM' : ' PM');
      timeList.push({ label, minutesFrom0800: m });
    }

    return { days: dayList, times: timeList };
  }, [fromISO, toISO]);

  return (
    <div className="w-full overflow-x-auto">
      {/* Header */}
      <div className="grid" style={{ gridTemplateColumns: `120px repeat(7, 1fr)` }}>
        <div />
        {days.map((d, i) => (
          <div
            key={i}
            className="px-2 py-2 text-center font-medium sticky top-0 bg-white dark:bg-gray-900 z-10"
          >
            {d.toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-300 dark:divide-gray-700 border-t border-gray-300 dark:border-gray-700">
        {times.map((t, rIdx) => (
          <div
            key={rIdx}
            className="grid"
            style={{ gridTemplateColumns: `120px repeat(7, 1fr)` }}
          >
            <div className="px-2 py-2 text-sm text-right pr-3 text-gray-600 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-900">
              {t.label}
            </div>
            {days.map((day, cIdx) => {
              const slotStart = new Date(day);
              slotStart.setHours(8, 0, 0, 0);
              slotStart.setMinutes(slotStart.getMinutes() + t.minutesFrom0800);

              const slotEnd = new Date(slotStart);
              slotEnd.setMinutes(slotEnd.getMinutes() + 30);

              const isBusy = overlaps(slotStart, slotEnd, busy);

              return (
                <div
                  key={cIdx}
                  className={`h-10 flex items-center justify-center border-l border-gray-300 dark:border-gray-700 text-xs font-medium ${
                    isBusy
                      ? 'bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      : 'bg-green-200/70 dark:bg-green-900/40 text-green-900 dark:text-green-200'
                  } hover:opacity-90 transition`}
                  title={`${slotStart.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })} – ${slotEnd.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`}
                >
                  {isBusy ? 'Busy' : 'Free'}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
