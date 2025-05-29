'use client';

import React from 'react';

interface WelcomeHeaderProps {
  userRole: string;
  onSignOut: () => void;
  className?: string;
}

const ROLE_TRANSLATIONS: Record<string, string> = {
  'ROLE_SECRETARIA': 'Secretário escolar',
  'ROLE_PROFESSOR': 'Professor',
  'ROLE_ALUNO': 'Aluno',
} as const;

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ 
  userRole, 
  onSignOut,
  className = ''
}) => {
  const getUserRoleDisplay = (role: string): string => {
    return ROLE_TRANSLATIONS[role] || role.replace('ROLE_', '').toLowerCase();
  };

  const handleSignOut = (): void => {
    onSignOut();
  };

  return (
    <header className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Bem vindo de volta
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            {getUserRoleDisplay(userRole)}
          </p>
        </div>

        <div className="flex-shrink-0 ml-4">
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-slate-600 rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
            aria-label="Sair do sistema"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
};

export default WelcomeHeader;