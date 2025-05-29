'use client';

import React, { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import UFEMSidebar from '@/components/login/secretaria/home/UFEMSidebar';

// Componente principal
export default function SecretariaHomePage(): React.JSX.Element {
  const { user, signOut } = useContext(AuthContext);

  // // Handler para cliques no menu do sidebar
  // const handleMenuClick = (itemId: string): void => {
  //   console.log('Menu clicado:', itemId);
  //   // Aqui você pode adicionar lógica de navegação
  //   // Ex: router.push(`/secretaria/${itemId}`);
  // };

  // Handler para logout
  const handleSignOut = (): void => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      signOut();
    }
  };

  // Early return se não há usuário
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Carregando...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar fixo à esquerda */}
      <UFEMSidebar 
        // onMenuItemClick={handleMenuClick}
        className="fixed left-0 top-0 z-40"
      />
      
      {/* Conteúdo principal */}
      <main className="flex-1 ml-64 p-8" role="main">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <header className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Dashboard - Secretaria
                </h1>
                <p className="text-gray-600 mt-1">
                  Bem-vindo(a), <span className="font-medium">{user.email}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Perfil: <span className="font-medium capitalize">{user.role}</span>
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Sair do sistema"
              >
                Sair
              </button>
            </div>
          </header>

          {/* Status Section */}
          <section className="bg-white rounded-lg shadow-lg p-6 mb-8" aria-labelledby="status-heading">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h2 id="status-heading" className="font-semibold text-blue-900 mb-2">
                🎉 Sistema Funcionando!
              </h2>
              <p className="text-blue-700">
                Você está logado como <span className="font-medium">{user.role}</span>
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}