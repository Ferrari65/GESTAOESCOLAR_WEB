'use client';

import React, { useContext, useCallback } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useSecretariaData } from '@/hooks/secretaria/SecretariaData';
import UFEMSidebar from '@/components/secretaria/home/UFEMSidebar';
import Header from '@/components/secretaria/header';
import CadastroCurso from '@/components/secretaria/home/curso/CadastroCurso';
import { LoadingSpinner } from '@/components/ui/loading/LoadingSpinner';

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

  const handleCursoSuccess = useCallback(() => {
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <UFEMSidebar 
        onMenuItemClick={handleMenuClick}
        className="fixed left-0 top-0 z-40"
      />
      
      <main className="flex-1 ml-64 p-8" role="main">
        <div className="max-w-5xl mx-auto space-y-8">
          <Header 
            title="Gerenciamento de Turmas"
            subtitle="Bem-vindo(a),"
            secretariaData={secretariaData}
            user={user}
            onSignOut={handleSignOut}
          />

          {/* Área Principal - Cadastro de Professor */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Cadastro de curso
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Adicione novos cursos ao sistema acadêmico
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">Online</span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <CadastroCurso onSuccess={handleCursoSuccess} />
              
            </div>
          </div>
        </div> 
      </main>
    </div>
  );
}
