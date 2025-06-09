// src/app/(private)/secretaria/professor/home/page.tsx
// NOVA PÁGINA PRINCIPAL - LIMPA E ORGANIZADA

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
    console.log('✅ Professor processado com sucesso!');
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
        className="fixed left-0 top-0 z-40"
      />
      
      {/* ===== CONTEÚDO PRINCIPAL ===== */}
      <main className="flex-1 ml-64 p-8" role="main">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* ===== HEADER ===== */}
          <Header 
            title="Gerenciamento de Professores"
            subtitle="Bem-vindo(a),"
            secretariaData={secretariaData}
            user={user}
            onSignOut={handleSignOut}
          />

          {/* ===== COMPONENTE PRINCIPAL ===== */}
          <CadastroProfessor 
            onSuccess={handleProfessorSuccess}
          />
          
        </div>
      </main>
    </div>
  );
}