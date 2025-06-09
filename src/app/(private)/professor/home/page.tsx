'use client';

import React from 'react';

export default function ProfessorHomePage(): React.JSX.Element {
  const handleLogout = (): void => {
    localStorage.removeItem('nextauth.token');

    document.cookie = 'nextauth.token=; Max-Age=0; path=/';

    window.location.href = '/login';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">
        Você está na role de Professor
      </h1>

      <button
        onClick={handleLogout}
        className="px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        Logout
      </button>
    </div>
  );
}
