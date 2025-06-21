
'use client';

import React, { useContext, useCallback } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useSecretariaData } from '@/hooks/shared';
import UFEMSidebar from '@/components/secretaria/UFEMSidebar';
import { CadastroAluno } from '@/components/secretaria/home/aluno/CadastroAluno';
import { LoadingSpinner } from '@/components/ui/loading/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import Header from '@/components/secretaria/header';

export default function SecretariaAlunosPage(): React.JSX.Element {
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

  const handleAlunoSuccess = useCallback(() => {
    console.log(' Aluno cadastrado com sucesso!');
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner size="lg" />
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

      <main className="flex-1 ml-64" role="main">
        <div className="p-8">
          <div className="max-w-8xl mx-auto space-y-8">
            
            <Header 
              title="Gerenciamento de Alunos"
              subtitle="Bem-vindo(a),"
              secretariaData={secretariaData}
              user={user}
              onSignOut={handleSignOut}
            />

            <CadastroAluno onSuccess={handleAlunoSuccess} />
            
          </div>
        </div>
      </main>
    </div>
  );
}