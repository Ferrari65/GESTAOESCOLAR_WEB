'use client';

import React, { useContext, useCallback } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useSecretariaData } from '@/hooks/shared';
import UFEMSidebar from '@/components/secretaria/UFEMSidebar';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import Header from '@/components/secretaria/header';
import CadastroTurma from '@/components/secretaria/home/turma/CadastroTurma';

export default function SecretariaTurmasPage(): React.JSX.Element {
  const { user, signOut } = useContext(AuthContext);
  const { secretariaData, error } = useSecretariaData();

  const handleMenuClick = useCallback((itemId: string): void => {
    // Callback opcional para menu
  }, []);

  const handleSignOut = useCallback((): void => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      signOut();
    }
  }, [signOut]);

  const handleTurmaSuccess = useCallback(() => {
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
            title="Gerenciamento de Turmas"
            subtitle="Bem-vindo(a),"
            secretariaData={secretariaData}
            user={user}
            onSignOut={handleSignOut}
          />

          {error && (
            <ErrorMessage message={error} />
          )}

          <CadastroTurma onSuccess={handleTurmaSuccess} />
          
        </div>
      </main>
    </div>
  );
}