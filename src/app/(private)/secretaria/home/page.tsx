'use client';

import React, { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import UFEMSidebar from '@/components/login/secretaria/home/UFEMSidebar';
import WelcomeHeader from '@/components/login/secretaria/header';

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center space-y-3">
      <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
      <h2 className="text-lg font-medium text-gray-700">Carregando...</h2>
      <p className="text-sm text-gray-500">Aguarde um momento</p>
    </div>
  </div>
);

export default function SecretariaHomePage(): React.JSX.Element {
  const { user, signOut } = useContext(AuthContext);

  const handleSignOut = (): void => {
    const confirmLogout = window.confirm('Tem certeza que deseja sair do sistema?');
    if (confirmLogout) {
      signOut();
    }
  };

  const handleMenuClick = (itemId: string): void => {
    console.log('Menu selecionado:', itemId);
  };

  if (!user) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="fixed left-0 top-0 z-40">
        <UFEMSidebar onMenuItemClick={handleMenuClick} />
      </aside>
      
      <main className="flex-1 ml-60 min-h-screen" role="main">
        <div className="h-full p-6 lg:p-8">
          <WelcomeHeader
            userRole={user.role}
            onSignOut={handleSignOut}
          />
          
          <section className="mt-8" aria-label="Conteúdo principal">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="text-center text-gray-500">
                <h3 className="text-lg font-medium mb-2">Área de Trabalho</h3>
                <p className="text-sm">Selecione uma opção no menu lateral para começar</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}