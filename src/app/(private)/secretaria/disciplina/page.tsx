'use client';

import React, { useContext, useCallback } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useSecretariaData } from '@/hooks/shared/index';
import UFEMSidebar from '@/components/secretaria/UFEMSidebar';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import Header from '@/components/secretaria/header';
import CadastroDisciplina from '@/components/secretaria/home/disciplina/CadastrarDisciplina';

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

  const handleDisciplinaSuccess = useCallback(() => {
  
  }, []);


  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
  
      <UFEMSidebar 
        onMenuItemClick={handleMenuClick}
        className="fixed left-0 top-0 z-40 w-64 h-full"
      />
      
      {/* Conteúdo principal */}
      <main className="flex-1 ml-64" role="main">
        <div className="p-8">
          <div className="max-w-8xl mx-auto space-y-8">
            
            <Header 
              title="Gerenciamento de Disciplinas"
              subtitle="Bem-vindo(a),"
              secretariaData={secretariaData}
              user={user}
              onSignOut={handleSignOut}
            />

            {/* Card do Cadastro */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Cadastro de Disciplina
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Adicione novas disciplinas ao sistema acadêmico
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-gray-600">Online</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <CadastroDisciplina onSuccess={handleDisciplinaSuccess} />
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}