'use client';

import React, { useContext, useCallback } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useSecretariaData } from '@/hooks/shared';
import UFEMSidebar from '@/components/secretaria/UFEMSidebar';
import Header from '@/components/secretaria/header';
import { CadastroProfessor } from '@/components/secretaria/home/professor/CadastroProfessor';
import { LoadingSpinner } from '@/components/ui/loading/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export default function SecretariaProfessorPage(): React.JSX.Element {
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
    console.log('Professor processado com sucesso!');
  }, []);

  // ===== LOADING STATE =====
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ===== SIDEBAR FIXO ===== */}
      <UFEMSidebar
        onMenuItemClick={handleMenuClick}
        className="fixed left-0 top-0 z-40 w-64 h-full"
      />

      {/* ===== CONTEÚDO PRINCIPAL ===== */}
      <main className="flex-1 ml-64" role="main">
        <div className="p-8">
          <div className="max-w-8xl mx-auto space-y-8">
            
            {/* ===== HEADER ===== */}
            <Header
              title="Gerenciamento de Professores"
              subtitle="Bem-vindo(a),"
              secretariaData={secretariaData}
              user={user}
              onSignOut={handleSignOut}
            />

            {/* ===== CARD DO CADASTRO ===== */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Cadastro de Professor
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Adicione novos professores ao sistema acadêmico
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                  
                  </div>
                </div>
              </div>

              <div className="p-6">
                <CadastroProfessor onSuccess={handleProfessorSuccess} />
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}