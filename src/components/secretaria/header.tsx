'use client';

import React from 'react';

interface User {
  email: string;
}

interface SecretariaData {
  nome?: string;
  email?: string;
}

interface HeaderProps {
  title?: string;
  subtitle?: string;
  secretariaData?: SecretariaData | null;
  user: User;
  onSignOut: () => void;
  showSignOutButton?: boolean;
}

export default function Header({ 
  title = "Dashboard - Secretaria",
  subtitle = "Bem-vindo(a),",
  secretariaData,
  user,
  onSignOut,
  showSignOutButton = true
}: HeaderProps) {
  return (
    <header className="w-full bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {title}
          </h1>
          <p className="text-gray-600 mt-1">
            {subtitle} <span className="font-medium text-sky-700">
              {secretariaData?.nome || 'Carregando...'}
            </span>
          </p>
          <p className="text-sm text-gray-500">
            Email: <span className="font-medium">
              {secretariaData?.email || user.email}
            </span>
          </p>
        </div>
        
        {showSignOutButton && (
          <button
            onClick={onSignOut}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Sair do sistema"
          >
            Sair
          </button>
        )}
      </div>
    </header>
  );
}
