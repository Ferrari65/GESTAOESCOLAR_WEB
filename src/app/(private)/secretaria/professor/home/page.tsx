// src/app/(private)/secretaria/professor/home/page.tsx - VERSÃO COMPLETA

'use client';

import React, { useContext, useCallback, useState } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useSecretariaData } from '@/hooks/shared';
import UFEMSidebar from '@/components/secretaria/UFEMSidebar';
import CadastroProfessorCompleto from '@/components/secretaria/home/professor/CadastroProfessor';
import ListaProfessorCompleta from '@/components/secretaria/home/professor/ListaProfessorCompleta';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import Header from '@/components/secretaria/header';
import type { ProfessorResponse } from '@/hooks/secretaria/professor';

export default function SecretariaProfessorPageCompleta(): React.JSX.Element {
  const { user, signOut } = useContext(AuthContext);
  const { secretariaData, error } = useSecretariaData();

  // Estados para controlar a interface
  const [professorEditando, setProfessorEditando] = useState<ProfessorResponse | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(true);
  const [abaSelecionada, setAbaSelecionada] = useState<'cadastro' | 'lista'>('cadastro');

  const handleMenuClick = useCallback((itemId: string): void => {
    // Callback opcional para menu
  }, []);

  const handleSignOut = useCallback((): void => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      signOut();
    }
  }, [signOut]);

  const handleProfessorSuccess = useCallback(() => {
    // Após sucesso, limpar edição e mostrar lista
    setProfessorEditando(null);
    setAbaSelecionada('lista');
    
    // Pequeno delay para dar feedback visual
    setTimeout(() => {
      setMostrarFormulario(false);
    }, 2000);
  }, []);

  const handleEditarProfessor = useCallback((professor: ProfessorResponse) => {
    setProfessorEditando(professor);
    setAbaSelecionada('cadastro');
    setMostrarFormulario(true);
  }, []);

  const handleCancelarEdicao = useCallback(() => {
    setProfessorEditando(null);
    setMostrarFormulario(false);
  }, []);

  const handleNovoContato = useCallback(() => {
    setProfessorEditando(null);
    setMostrarFormulario(true);
    setAbaSelecionada('cadastro');
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
        <div className="max-w-7xl mx-auto space-y-8">
          
          <Header 
            title="Gerenciamento de Professores"
            subtitle="Bem-vindo(a),"
            secretariaData={secretariaData}
            user={user}
            onSignOut={handleSignOut}
          />

          {error && (
            <ErrorMessage message={error} />
          )}

          {/* Navegação por Abas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                <button
                  onClick={() => {
                    setAbaSelecionada('cadastro');
                    setMostrarFormulario(true);
                  }}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    abaSelecionada === 'cadastro'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {professorEditando ? 'Editar Professor' : 'Cadastrar Professor'}
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    setAbaSelecionada('lista');
                    setMostrarFormulario(false);
                    setProfessorEditando(null);
                  }}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    abaSelecionada === 'lista'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Lista de Professores
                  </div>
                </button>
              </nav>
            </div>

            {/* Conteúdo das Abas */}
            <div className="p-6">
              {abaSelecionada === 'cadastro' && mostrarFormulario && (
                <div className="space-y-6">
                  {/* Botão para alternar entre cadastro e lista */}
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {professorEditando ? 'Editar Professor' : 'Cadastro de Professores'}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {professorEditando 
                          ? `Editando: ${professorEditando.nome}`
                          : 'Adicione novos professores ao sistema acadêmico'
                        }
                      </p>
                    </div>
                    
                    <div className="flex space-x-3">
                      {professorEditando && (
                        <button
                          onClick={handleCancelarEdicao}
                          className="px-4 py-2 text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Cancelar Edição
                        </button>
                      )}
                      
                      <button
                        onClick={() => setAbaSelecionada('lista')}
                        className="px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Ver Lista de Professores
                      </button>
                    </div>
                  </div>

                  {/* Formulário de Cadastro/Edição */}
                  <CadastroProfessorCompleto 
                    onSuccess={handleProfessorSuccess}
                    onCancel={handleCancelarEdicao}
                    professorParaEditar={professorEditando}
                    modoEdicao={!!professorEditando}
                  />
                </div>
              )}

              {abaSelecionada === 'lista' && (
                <div className="space-y-6">
                  {/* Cabeçalho da Lista */}
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Professores Cadastrados
                      </h2>
                      <p className="text-gray-600 mt-1">
                        Lista de todos os professores no sistema
                      </p>
                    </div>
                    
                    <button
                      onClick={handleNovoContato}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Novo Professor
                    </button>
                  </div>

                  {/* Lista de Professores */}
                  <ListaProfessorCompleta 
                    onEditarProfessor={handleEditarProfessor}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Seção: Ações Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Cadastrar</h3>
                  <p className="text-sm text-gray-600">Adicionar novo professor</p>
                </div>
              </div>
              <button
                onClick={handleNovoContato}
                className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Cadastrar Professor
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Gerenciar</h3>
                  <p className="text-sm text-gray-600">Ver e editar professores</p>
                </div>
              </div>
              <button
                onClick={() => setAbaSelecionada('lista')}
                className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Ver Lista
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Relatórios</h3>
                  <p className="text-sm text-gray-600">Estatísticas e dados</p>
                </div>
              </div>
              <button
                className="mt-4 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                onClick={() => {
                  // Funcionalidade futura
                  alert('Relatórios em desenvolvimento!');
                }}
              >
                Ver Relatórios
              </button>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}