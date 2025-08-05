'use client';

import { useState } from 'react';

export default function Home() {
  const [sessionLink, setSessionLink] = useState('');

  const generateLink = async () => {
    const res = await fetch('/api/session', { method: 'POST' });
    const data = await res.json();
    const link = `${window.location.origin}/meet/${data.id}`; // <- use data.id
    setSessionLink(link);
  };  

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition">
      <div className="max-w-xl w-full text-center space-y-6">
        <h1 className="text-4xl font-bold">Schedule the Smart Way 🧠</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Click below to generate a private scheduling link and invite your team.
        </p>

        <button
          onClick={generateLink}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg transition"
        >
          Generate Link
        </button>

        {sessionLink && (
          <div className="pt-6">
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              Share this link with your team:
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded break-words">
              <a
                className="text-blue-500 hover:underline"
                href={sessionLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {sessionLink}
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
