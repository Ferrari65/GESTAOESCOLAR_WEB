'use client';

import React, { useContext, useCallback } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useSecretariaData } from '@/hooks/secretaria/SecretariaData';
import UFEMSidebar from '@/components/secretaria/home/UFEMSidebar';
import Header from '@/components/secretaria/header';
import CadastroCurso from '@/components/secretaria/curso/CadastroCurso';
import { LoadingSpinner } from '@/components/LoadingSpinner';

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
    alert('Curso cadastrado!');
  }, []);

  // Loading state
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar fixo à esquerda */}
      <UFEMSidebar 
        onMenuItemClick={handleMenuClick}
        className="fixed left-0 top-0 z-40"
      />

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Gerenciamento de Turmas"
          subtitle="Bem-vindo(a),"
          secretariaData={secretariaData}
          user={user}
          onSignOut={handleSignOut}
        />

        {/* Área Principal - Cadastro de Curso */}
        <div className="flex-1 p-6 bg-gray-50 overflow-auto">
           <div className="p-6">
             <CadastroCurso onSuccess={handleCursoSuccess} />
            </div>
        </div>
      </div>
    </div>
  );
}