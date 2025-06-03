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
    <header className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {title}
          </h1>
          <p className="text-gray-600 mt-1">
            {subtitle} <span className="font-medium">
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
            className="relative px-6 py-2 text-slate-600 font-medium transition-colors duration-300 group focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-md"
            aria-label="Sair do sistema"
          >
            <span className="relative z-10">Sair</span>
            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-slate-600 transition-all duration-300 group-hover:w-full"></div>
          </button>
        )}
      </div>
    </header>
  );
}