'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setAuthenticated(data.authenticated));
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setAuthenticated(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      {authenticated === null ? (
        <p>Loading...</p>
      ) : authenticated ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-green-600 text-xl font-bold">✅ Logged in</p>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Log out
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <p className="text-red-600 text-xl font-bold">❌ Not logged in</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Go to Login
          </button>
        </div>
      )}
    </div>
  );
}