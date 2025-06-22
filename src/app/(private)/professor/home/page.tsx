// src/app/(private)/professor/home/page.tsx
// EXATAMENTE O MESMO PADRÃO DAS PÁGINAS DA SECRETARIA

'use client';

import React, { useContext, useCallback } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useProfessorData } from '@/hooks/shared';
import UFEMProfessorSidebar from '@/components/professor/UFEMProfessorSidebar';
import { LoadingSpinner } from '@/components/ui/loading/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import Header from '@/components/secretaria/header';

export default function ProfessorHomePage(): React.JSX.Element {
  const { user, signOut } = useContext(AuthContext);
  const { professorData, loading, error } = useProfessorData();

  const handleMenuClick = useCallback((itemId: string): void => {
    console.log('Menu clicado:', itemId);
  }, []);

  const handleSignOut = useCallback((): void => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      signOut();
    }
  }, [signOut]);

  // ⚠️ EXATAMENTE IGUAL AS PÁGINAS DA SECRETARIA
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // ⚠️ EXATAMENTE IGUAL AS PÁGINAS DA SECRETARIA
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ⚠️ SIDEBAR - IGUAL A SECRETARIA */}
      <UFEMProfessorSidebar
        onMenuItemClick={handleMenuClick}
        className="fixed left-0 top-0 z-40 w-64 h-full"
      />

      {/* ⚠️ MAIN CONTENT - IGUAL A SECRETARIA */}
      <main className="flex-1 ml-64" role="main">
        <div className="p-8">
          <div className="max-w-8xl mx-auto space-y-8">
            
            {/* ⚠️ HEADER - IGUAL A SECRETARIA */}
            <Header 
              title="Gerenciamento de Turmas"
              subtitle="Bem-vindo(a),"
              professorData={professorData}  // ⚠️ USAR professorData (não secretariaData)
              user={user}
              onSignOut={handleSignOut}
            />

            {/* ⚠️ CONTEÚDO PRINCIPAL */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Painel do Professor
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Gerencie suas turmas e atividades acadêmicas
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-gray-600">Online</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Turmas</h3>
                    <p className="text-blue-700 text-sm mb-4">Suas turmas ativas</p>
                    <div className="text-3xl font-bold text-blue-600">0</div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-lg border border-green-200">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">Atividades</h3>
                    <p className="text-green-700 text-sm mb-4">Pendentes</p>
                    <div className="text-3xl font-bold text-green-600">0</div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-6 rounded-lg border border-purple-200">
                    <h3 className="text-lg font-semibold text-purple-900 mb-2">Alunos</h3>
                    <p className="text-purple-700 text-sm mb-4">Total</p>
                    <div className="text-3xl font-bold text-purple-600">0</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}