'use client';

import React, { useContext, useCallback } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useSecretariaData } from '@/hooks/shared';
import UFEMSidebar from '@/components/secretaria/UFEMSidebar';
import Header from '@/components/secretaria/header';
import CadastroCurso from '@/components/secretaria/home/curso/CadastroCurso';

export default function SecretariaCursoPage(): React.JSX.Element {
  const { user, signOut } = useContext(AuthContext);
  const { secretariaData } = useSecretariaData(); 

  const handleMenuClick = useCallback((itemId: string): void => {
    // Callback opcional para menu
  }, []);

  const handleSignOut = useCallback((): void => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      signOut();
    }
  }, [signOut]);

  const handleCursoSuccess = useCallback(() => {
    // Callback de sucesso
  }, []);

  // Se não tem usuário, não renderizar
  if (!user) {
    return <div></div>;
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
            title="Gerenciamento de Cursos"
            subtitle="Bem-vindo(a),"
            secretariaData={secretariaData}
            user={user}
            onSignOut={handleSignOut}
          />

          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Cadastro de Curso
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