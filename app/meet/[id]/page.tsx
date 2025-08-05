import { notFound } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AuthControls } from '@/components/AuthControls';
import { getCalendarEvents } from '@/lib/getCalendarEvents';

interface MeetPageProps {
  params: {
    id: string;
  };
}

async function fetchMeetingSession(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/session/${id}`, {
      cache: 'no-store',
    });

    if (!res.ok) return null;

    return await res.json();
  } catch (e) {
    console.error('Error fetching meeting session:', e);
    return null;
  }
}

export default async function MeetPage({ params }: MeetPageProps) {
  const id = params.id;

  if (!id || typeof id !== 'string' || !/^[a-zA-Z0-9-_]{6,}$/.test(id)) {
    notFound();
  }

  const session = await fetchMeetingSession(id);
  if (!session) notFound();

  // ✅ Call directly instead of hitting /api/calendar
  const events = await getCalendarEvents();

  return (
    <main className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition px-6 py-10 flex flex-col items-center justify-center relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Auth Controls */}
      <div className="absolute top-4 left-4">
        <AuthControls />
      </div>

      {/* Session Info */}
      <div className="max-w-xl w-full text-center space-y-6">
        <h1 className="text-4xl font-bold">Welcome to the meeting 👋</h1>
        <p className="text-lg">
          <span className="font-semibold">Session ID:</span>{' '}
          <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
            {session.id}
          </code>
        </p>
        <p className="text-base text-gray-700 dark:text-gray-300">
          This is your shared scheduling space. Soon, you'll be able to connect
          calendars and view availability in real-time.
        </p>
      </div>

      {/* Participants */}
      {session.users?.length > 0 && (
        <div className="mt-10 max-w-xl w-full">
          <h2 className="text-2xl font-semibold mb-4 text-center">Participants</h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {session.users.map((u: any) => (
              <li
                key={u.user.id}
                className="flex items-center space-x-4 bg-gray-100 dark:bg-gray-800 p-4 rounded shadow"
              >
                <img
                  src={u.user.image || '/default-avatar.png'}
                  alt={u.user.name || 'User'}
                  className="w-10 h-10 rounded-full"
                />
                <span className="font-medium">{u.user.name || u.user.email}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Calendar Events */}
      <div className="mt-12 max-w-xl w-full text-center">
        <h2 className="text-xl font-semibold mb-2">Calendar Availability</h2>
        {events.length > 0 ? (
          <ul className="space-y-3 text-left">
            {events.map((event: any) => (
              <li key={event.id} className="p-4 rounded bg-gray-100 dark:bg-gray-800 shadow">
                <div className="font-medium">{event.summary || 'No Title'}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {event.start?.dateTime
                    ? new Date(event.start.dateTime).toLocaleString()
                    : event.start?.date || 'No start time'}
                  {' → '}
                  {event.end?.dateTime
                    ? new Date(event.end.dateTime).toLocaleString()
                    : event.end?.date || 'No end time'}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            No calendar events found or access not granted.
          </p>
        )}
      </div>
    </main>
  );
}
