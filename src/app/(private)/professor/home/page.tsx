'use client';

import React, { useCallback } from 'react';
import Header from '@/components/secretaria/header';
import UFEMProfessorSidebar from '@/components/professor/UFEMProfessorSidebar';

export default function ProfessorHomePage(): React.JSX.Element {

  const secretariaData = {
    nome: "Sistema Acadêmico",

  };

  const user = {
    nome: "Professor",

  };

  const handleLogout = (): void => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      localStorage.removeItem('nextauth.token');
      document.cookie = 'nextauth.token=; Max-Age=0; path=/';
      window.location.href = '/login';
    }
  };

  const handleMenuClick = useCallback((itemId: string): void => {
    console.log('Menu clicado:', itemId);
  }, []);

  const handleSignOut = useCallback((): void => {
    handleLogout();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <UFEMProfessorSidebar
        onMenuItemClick={handleMenuClick}
        className="fixed left-0 top-0 z-40 w-64 h-full"
      />

      <main className="flex-1 ml-64" role="main">
        <div className="p-8">
          <div className="max-w-8xl mx-auto space-y-8">
            <Header
              title="Gerenciamento de Turmas"
              subtitle="Bem-vindo(a),"
              secretariaData={secretariaData}
              user={user}
              onSignOut={handleSignOut}
            />

            {/* Área Principal - Cadastro de Alunos */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Cadastro de alunos
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Adicione novos Alunos ao sistema acadêmico
                    </p>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}