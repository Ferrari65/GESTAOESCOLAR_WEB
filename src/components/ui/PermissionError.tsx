'use client';

import React from 'react';
import Link from 'next/link';

interface PermissionErrorProps {
  userRole?: string;
  redirectPath?: string;
  message?: string;
}

export const PermissionError: React.FC<PermissionErrorProps> = ({
  userRole,
  redirectPath,
  message = "Você não tem permissão para acessar esta área."
}) => {
  const getDashboardPath = (role: string) => {
    const dashboardRoutes = {
      'ROLE_SECRETARIA': '/secretaria/alunos',
      'ROLE_PROFESSOR': '/professor/home',
      'ROLE_ALUNO': '/aluno/home',
    };
    return dashboardRoutes[role as keyof typeof dashboardRoutes] || '/login';
  };

  const defaultRedirectPath = userRole ? getDashboardPath(userRole) : '/login';
  const finalRedirectPath = redirectPath || defaultRedirectPath;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg 
              className="w-8 h-8 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Acesso Negado
          </h1>
          
          <p className="text-gray-600 mb-6">
            {message}
          </p>
        </div>

        <div className="space-y-3">
          <Link 
            href={finalRedirectPath}
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Ir para Dashboard
          </Link>
          
          <Link 
            href="/login"
            className="block w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Fazer Login
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Se você acredita que isso é um erro, entre em contato com o administrador do sistema.
          </p>
        </div>
      </div>
    </div>
  );
};