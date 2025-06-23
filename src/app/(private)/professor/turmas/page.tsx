// src/app/(private)/professor/turmas/page.tsx
'use client';

import React, { useContext, useCallback, useState, useEffect } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useProfessorData } from '@/hooks/shared';
import UFEMProfessorSidebar from '@/components/professor/UFEMProfessorSidebar';
import { LoadingSpinner } from '@/components/ui/loading/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import Header from '@/components/secretaria/header';
import { getAPIClient, handleApiError } from '@/services/api';

interface TurmaAtribuida {
  idTurma: string;
  nome: string;
  ano: string;
  turno: 'DIURNO' | 'NOTURNO';
  curso?: {
    nome: string;
    idCurso: string;
  };
  quantidadeAlunos?: number;
  disciplinas?: Array<{
    idDisciplina: string;
    nome: string;
  }>;
}

export default function ProfessorTurmasPage(): React.JSX.Element {
  const { user, signOut } = useContext(AuthContext);
  const { professorData, loading: professorLoading, error: professorError } = useProfessorData();

  const [turmas, setTurmas] = useState<TurmaAtribuida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleMenuClick = useCallback((itemId: string): void => {
    console.log('Menu clicado:', itemId);
  }, []);

  const handleSignOut = useCallback((): void => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      signOut();
    }
  }, [signOut]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Buscar turmas atribuídas ao professor
  const fetchTurmas = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 [TURMAS] Buscando turmas do professor:', user.id);
      
      const api = getAPIClient();
      const response = await api.get(`/professor/${user.id}/turmas`);
      
      console.log('✅ [TURMAS] Resposta da API:', response.data);
      
      let turmasData = response.data;

      // Normalizar dados (pode vir como array direto ou wrapped)
      if (!Array.isArray(turmasData)) {
        if (turmasData.turmas && Array.isArray(turmasData.turmas)) {
          turmasData = turmasData.turmas;
        } else if (turmasData.data && Array.isArray(turmasData.data)) {
          turmasData = turmasData.data;
        } else if (turmasData.content && Array.isArray(turmasData.content)) {
          turmasData = turmasData.content;
        } else {
          turmasData = turmasData ? [turmasData] : [];
        }
      }

      // Mapear e validar dados
      const turmasValidas: TurmaAtribuida[] = [];
      
      for (const turma of turmasData) {
        try {
          const turmaMapeada: TurmaAtribuida = {
            idTurma: turma.idTurma || turma.id || '',
            nome: turma.nome || '',
            ano: turma.ano || '',
            turno: turma.turno || 'DIURNO',
            curso: turma.curso ? {
              nome: turma.curso.nome || '',
              idCurso: turma.curso.idCurso || turma.curso.id || ''
            } : undefined,
            quantidadeAlunos: turma.quantidadeAlunos || turma.totalAlunos || 0,
            disciplinas: turma.disciplinas || []
          };

          // Validar dados essenciais
          if (turmaMapeada.idTurma && turmaMapeada.nome) {
            turmasValidas.push(turmaMapeada);
          }
        } catch (err) {
          console.warn('⚠️ [TURMAS] Erro ao mapear turma:', turma, err);
        }
      }

      console.log(`✅ [TURMAS] ${turmasValidas.length} turma(s) carregada(s)`);
      setTurmas(turmasValidas);
      
    } catch (err: unknown) {
      console.error('❌ [TURMAS] Erro ao buscar turmas:', err);
      const { message } = handleApiError(err, 'FetchTurmas');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const getTurnoIcon = (turno: string) => {
    if (turno === 'NOTURNO') {
      return (
        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    );
  };

  useEffect(() => {
    if (user?.id) {
      fetchTurmas();
    }
  }, [user?.id, fetchTurmas]);

  if (professorLoading || loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (professorError && !professorData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <ErrorMessage message={professorError} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <UFEMProfessorSidebar
        onMenuItemClick={handleMenuClick}
        className="fixed left-0 top-0 z-40 w-64 h-full"
      />

      <main className="flex-1 ml-64" role="main">
        <div className="p-8">
          <div className="max-w-8xl mx-auto space-y-8">
            
            <Header 
              title="Minhas Turmas"
              subtitle="Bem-vindo(a),"
              professorData={professorData}
              user={user}
              onSignOut={handleSignOut}
            />

            {/* Mensagem de erro */}
            {error && (
              <ErrorMessage message={error} onRetry={fetchTurmas} />
            )}

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Total de Turmas</h3>
                <div className="text-3xl font-bold text-blue-600">{turmas.length}</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-orange-100 p-6 rounded-lg border border-yellow-200">
                <h3 className="text-lg font-semibold text-orange-900 mb-2">Turmas Diurnas</h3>
                <div className="text-3xl font-bold text-orange-600">
                  {turmas.filter(t => t.turno === 'DIURNO').length}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-indigo-100 p-6 rounded-lg border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">Turmas Noturnas</h3>
                <div className="text-3xl font-bold text-purple-600">
                  {turmas.filter(t => t.turno === 'NOTURNO').length}
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Total de Alunos</h3>
                <div className="text-3xl font-bold text-green-600">
                  {turmas.reduce((acc, turma) => acc + (turma.quantidadeAlunos || 0), 0)}
                </div>
              </div>
            </div>

            {/* Lista de Turmas */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Turmas Atribuídas
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Lista de todas as turmas que você leciona
                    </p>
                  </div>
                  
                  <button
                    onClick={fetchTurmas}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Atualizar
                  </button>
                </div>
              </div>

              <div className="p-6">
                {turmas.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12.75c1.63 0 3.07.39 4.24.9c1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73c1.17-.52 2.61-.91 4.24-.91z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma turma atribuída</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Você ainda não possui turmas atribuídas ou elas não foram carregadas.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={fetchTurmas}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Tentar novamente
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {turmas.map((turma) => (
                      <div key={turma.idTurma} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        {/* Header da Turma */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {turma.nome}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Ano: {turma.ano}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {getTurnoIcon(turma.turno)}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              turma.turno === 'DIURNO' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-indigo-100 text-indigo-800'
                            }`}>
                              {turma.turno}
                            </span>
                          </div>
                        </div>

                        {/* Informações do Curso */}
                        {turma.curso && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Curso</h4>
                            <p className="text-sm text-gray-900">{turma.curso.nome}</p>
                          </div>
                        )}

                        {/* Estatísticas da Turma */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                              {turma.quantidadeAlunos || 0}
                            </div>
                            <div className="text-xs text-blue-600">Alunos</div>
                          </div>
                          
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {turma.disciplinas?.length || 0}
                            </div>
                            <div className="text-xs text-green-600">Disciplinas</div>
                          </div>
                        </div>

                        {/* Disciplinas */}
                        {turma.disciplinas && turma.disciplinas.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Disciplinas</h4>
                            <div className="space-y-1">
                              {turma.disciplinas.slice(0, 3).map((disciplina) => (
                                <div key={disciplina.idDisciplina} className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                  {disciplina.nome}
                                </div>
                              ))}
                              {turma.disciplinas.length > 3 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  +{turma.disciplinas.length - 3} disciplina(s) a mais
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Ações */}
                        <div className="flex space-x-2">
                          <button className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Ver Detalhes
                          </button>
                          
                          <button className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Gerenciar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}