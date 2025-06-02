'use client';

import React, { useContext, useCallback } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useSecretariaData } from '@/hooks/secretaria/SecretariaData';
import UFEMSidebar from '@/components/login/secretaria/home/UFEMSidebar';
import CadastroProfessor from '@/components/professor/CadastroProfessor';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export default function SecretariaHomePage(): React.JSX.Element {
  const { user, signOut } = useContext(AuthContext);
  const { secretariaData, loading, error } = useSecretariaData();

  const handleMenuClick = useCallback((itemId: string): void => {
    console.log('Menu clicado:', itemId);
  }, []);

  const handleSignOut = useCallback((): void => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      signOut();
    }
  }, [signOut]);

  const handleProfessorSuccess = useCallback(() => {
    // Feedback visual de sucesso
    console.log('Professor cadastrado com sucesso!');
  }, []);

  // Loading state
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar fixo à esquerda */}
      <UFEMSidebar 
        onMenuItemClick={handleMenuClick}
        className="fixed left-0 top-0 z-40"
      />
      
      {/* Conteúdo principal */}
      <main className="flex-1 ml-64 p-8" role="main">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header Section */}
          <header className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Dashboard - Secretaria
                </h1>
                <p className="text-gray-600 mt-1">
                  Bem-vindo(a), <span className="font-medium">
                    {secretariaData?.nome || 'Carregando...'}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  Email: <span className="font-medium">
                    {secretariaData?.email || user.email}
                  </span>
                </p>
              </div>
              
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Sair do sistema"
              >
                Sair
              </button>
            </div>
          </header>

          {/* Área Principal - Cadastro de Professor */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Cadastro de Professores
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Adicione novos professores ao sistema acadêmico
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">Online</span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <CadastroProfessor onSuccess={handleProfessorSuccess} />
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}