import { notFound } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';

interface MeetPageProps {
  params: {
    id: string;
  };
}

async function fetchSession(id: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/session/${id}`,
      { cache: 'no-store' }
    );

    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('Error fetching session:', e);
    return null;
  }
}

export default async function MeetPage({ params }: MeetPageProps) {
  const id = params.id;

  if (!id || typeof id !== 'string' || !/^[a-zA-Z0-9-_]{6,}$/.test(id)) {
    notFound();
  }

  const session = await fetchSession(id);
  if (!session) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition px-6 py-10 flex flex-col items-center justify-center relative">
      {/* Toggle Theme Button */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
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
    </main>
  );
}
