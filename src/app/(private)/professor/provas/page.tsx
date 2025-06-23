// src/app/(private)/professor/provas/page.tsx
'use client';

import React, { useContext, useCallback, useState, useEffect } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useProfessorData } from '@/hooks/shared';
import UFEMProfessorSidebar from '@/components/professor/UFEMProfessorSidebar';
import { LoadingSpinner } from '@/components/ui/loading/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { SuccessMessage } from '@/components/ui/SuccessMessage';
import Header from '@/components/secretaria/header';
import { getAPIClient, handleApiError } from '@/services/api';

// ===== INTERFACES =====
interface TurmaOption {
  idTurma: string;
  nome: string;
  curso?: string;
}

interface DisciplinaOption {
  idDisciplina: string;
  nome: string;
}

interface Prova {
  idProva: string;
  nome: string;
  data: string;
  peso: number;
  turma: {
    idTurma: string;
    nome: string;
  };
  disciplina: {
    idDisciplina: string;
    nome: string;
  };
  avaliacoes?: AvaliacaoAluno[];
}

interface AvaliacaoAluno {
  idAluno: string;
  nomeAluno: string;
  nota?: number;
  concluida: boolean;
  dataAvaliacao?: string;
}

interface CriarProvaForm {
  nome: string;
  data: string;
  peso: string;
  idTurma: string;
  idDisciplina: string;
}

type AbaSelecionada = 'criar' | 'avaliar';

export default function ProfessorProvasPage(): React.JSX.Element {
  const { user, signOut } = useContext(AuthContext);
  const { professorData, loading: professorLoading, error: professorError } = useProfessorData();

  // Estados gerais
  const [abaSelecionada, setAbaSelecionada] = useState<AbaSelecionada>('criar');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Estados para criação
  const [turmasDisponiveis, setTurmasDisponiveis] = useState<TurmaOption[]>([]);
  const [disciplinasDisponiveis, setDisciplinasDisponiveis] = useState<DisciplinaOption[]>([]);
  const [formData, setFormData] = useState<CriarProvaForm>({
    nome: '',
    data: '',
    peso: '',
    idTurma: '',
    idDisciplina: ''
  });

  // Estados para avaliação
  const [provas, setProvas] = useState<Prova[]>([]);
  const [provaSelecionada, setProvaSelecionada] = useState<string>('');
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoAluno[]>([]);
  const [avaliandoAluno, setAvaliandoAluno] = useState<string | null>(null);
  const [concluindoProva, setConcluindoProva] = useState<string | null>(null);

  const handleMenuClick = useCallback((itemId: string): void => {
    console.log('Menu clicado:', itemId);
  }, []);

  const handleSignOut = useCallback((): void => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      signOut();
    }
  }, [signOut]);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  // ===== BUSCAR TURMAS DO PROFESSOR =====
  const fetchTurmas = useCallback(async () => {
    if (!user?.id) return;

    try {
      const api = getAPIClient();
      const response = await api.get(`/professor/${user.id}/turmas`);
      
      let turmasData = response.data;
      if (!Array.isArray(turmasData)) {
        turmasData = turmasData.turmas || turmasData.data || [turmasData];
      }

      const turmasFormatadas: TurmaOption[] = turmasData.map((turma: any) => ({
        idTurma: turma.idTurma || turma.id,
        nome: turma.nome,
        curso: turma.curso?.nome
      }));

      setTurmasDisponiveis(turmasFormatadas);
    } catch (err) {
      console.error('Erro ao buscar turmas:', err);
    }
  }, [user?.id]);

  // ===== BUSCAR DISCIPLINAS POR TURMA =====
  const fetchDisciplinas = useCallback(async (idTurma: string) => {
    if (!user?.id || !idTurma) return;

    try {
      const api = getAPIClient();
      const response = await api.get(`/disciplina/professor/${idTurma}/${user.id}`);
      
      let disciplinasData = response.data;
      if (!Array.isArray(disciplinasData)) {
        disciplinasData = disciplinasData.disciplinas || disciplinasData.data || [disciplinasData];
      }

      const disciplinasFormatadas: DisciplinaOption[] = disciplinasData.map((disciplina: any) => ({
        idDisciplina: disciplina.idDisciplina || disciplina.id,
        nome: disciplina.nome
      }));

      setDisciplinasDisponiveis(disciplinasFormatadas);
    } catch (err) {
      console.error('Erro ao buscar disciplinas:', err);
      setDisciplinasDisponiveis([]);
    }
  }, [user?.id]);

  // ===== CRIAR PROVA =====
  const criarProva = useCallback(async () => {
    if (!user?.id) return;

    // Validações
    if (!formData.nome.trim()) {
      setError('Nome da prova é obrigatório');
      return;
    }
    if (!formData.data) {
      setError('Data da prova é obrigatória');
      return;
    }
    if (!formData.peso || parseFloat(formData.peso) <= 0) {
      setError('Peso deve ser um número maior que zero');
      return;
    }
    if (!formData.idTurma) {
      setError('Selecione uma turma');
      return;
    }
    if (!formData.idDisciplina) {
      setError('Selecione uma disciplina');
      return;
    }

    // Validar se a data não é no passado
    const dataProva = new Date(formData.data);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (dataProva < hoje) {
      setError('A data da prova não pode ser no passado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const api = getAPIClient();
      
      const payload = {
        nome: formData.nome.trim(),
        data: formData.data,
        peso: parseFloat(formData.peso)
      };

      console.log('🚀 [PROVA] Criando prova:', payload);
      console.log('📋 [PROVA] Endpoint:', `/provas/${formData.idTurma}/${formData.idDisciplina}`);

      await api.post(`/provas/${formData.idTurma}/${formData.idDisciplina}`, payload);

      setSuccessMessage('Prova criada com sucesso!');
      
      // Limpar formulário
      setFormData({
        nome: '',
        data: '',
        peso: '',
        idTurma: '',
        idDisciplina: ''
      });
      setDisciplinasDisponiveis([]);

      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (err: unknown) {
      console.error('❌ [PROVA] Erro ao criar prova:', err);
      const { message } = handleApiError(err, 'CriarProva');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, formData]);

  // ===== BUSCAR PROVAS PARA AVALIAÇÃO =====
  const fetchProvas = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      console.log('🔍 [PROVAS] Buscando provas do professor...');
      
      const api = getAPIClient();
      
      // Buscar turmas do professor
      const turmasResponse = await api.get(`/professor/${user.id}/turmas`);
      const turmas = Array.isArray(turmasResponse.data) ? turmasResponse.data : [turmasResponse.data];
      
      const todasProvas: Prova[] = [];
      
      // Para cada turma, buscar suas disciplinas e provas
      for (const turma of turmas) {
        try {
          // Buscar disciplinas da turma
          const disciplinasResponse = await api.get(`/disciplina/professor/${turma.idTurma}/${user.id}`);
          const disciplinas = Array.isArray(disciplinasResponse.data) ? disciplinasResponse.data : [disciplinasResponse.data];
          
          // Para cada disciplina, buscar suas provas
          for (const disciplina of disciplinas) {
            try {
              // Endpoint para buscar provas (pode precisar ajustar conforme seu backend)
              const provasResponse = await api.get(`/provas/turma/${turma.idTurma}/disciplina/${disciplina.idDisciplina}`);
              const provas = Array.isArray(provasResponse.data) ? provasResponse.data : [provasResponse.data];
              
              provas.forEach((prova: any) => {
                if (prova && prova.idProva) {
                  todasProvas.push({
                    idProva: prova.idProva || prova.id,
                    nome: prova.nome,
                    data: prova.data,
                    peso: prova.peso,
                    turma: {
                      idTurma: turma.idTurma,
                      nome: turma.nome
                    },
                    disciplina: {
                      idDisciplina: disciplina.idDisciplina,
                      nome: disciplina.nome
                    }
                  });
                }
              });
            } catch (err) {
              console.warn(`Erro ao buscar provas da disciplina ${disciplina.nome}:`, err);
            }
          }
        } catch (err) {
          console.warn(`Erro ao buscar disciplinas da turma ${turma.nome}:`, err);
        }
      }
      
      console.log(`✅ [PROVAS] ${todasProvas.length} prova(s) encontrada(s)`);
      setProvas(todasProvas);
    } catch (err) {
      console.error('❌ [PROVAS] Erro ao buscar provas:', err);
      setProvas([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // ===== AVALIAR PROVA =====
  const avaliarProva = useCallback(async (idProva: string, idAluno: string, nota: number) => {
    setAvaliandoAluno(idAluno);

    try {
      console.log('📝 [AVALIACAO] Avaliando prova:', { idProva, idAluno, nota });
      
      const api = getAPIClient();
      await api.post(`/provas/avaliar/${idProva}/${idAluno}`, {
        nota: nota
      });

      // Atualizar estado local
      setAvaliacoes(prev => prev.map(avaliacao => 
        avaliacao.idAluno === idAluno 
          ? { ...avaliacao, nota, dataAvaliacao: new Date().toISOString() }
          : avaliacao
      ));

      setSuccessMessage(`Nota ${nota} atribuída com sucesso!`);
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (err: unknown) {
      console.error('❌ [AVALIACAO] Erro ao avaliar prova:', err);
      const { message } = handleApiError(err, 'AvaliarProva');
      setError(message);
    } finally {
      setAvaliandoAluno(null);
    }
  }, []);

  // ===== MARCAR PROVA COMO CONCLUÍDA =====
  const concluirProva = useCallback(async (idProva: string, idAluno: string) => {
    setConcluindoProva(idAluno);

    try {
      console.log('✅ [CONCLUSAO] Marcando prova como concluída:', { idProva, idAluno });
      
      const api = getAPIClient();
      await api.post(`/provas/concluir/${idProva}/${idAluno}`);

      // Atualizar estado local
      setAvaliacoes(prev => prev.map(avaliacao => 
        avaliacao.idAluno === idAluno 
          ? { ...avaliacao, concluida: true }
          : avaliacao
      ));

      setSuccessMessage('Prova marcada como concluída!');
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (err: unknown) {
      console.error('❌ [CONCLUSAO] Erro ao concluir prova:', err);
      const { message } = handleApiError(err, 'ConcluirProva');
      setError(message);
    } finally {
      setConcluindoProva(null);
    }
  }, []);

  // ===== EFEITOS =====
  useEffect(() => {
    if (user?.id) {
      fetchTurmas();
    }
  }, [user?.id, fetchTurmas]);

  useEffect(() => {
    if (formData.idTurma) {
      fetchDisciplinas(formData.idTurma);
    } else {
      setDisciplinasDisponiveis([]);
      setFormData(prev => ({ ...prev, idDisciplina: '' }));
    }
  }, [formData.idTurma, fetchDisciplinas]);

  useEffect(() => {
    if (abaSelecionada === 'avaliar') {
      fetchProvas();
    }
  }, [abaSelecionada, fetchProvas]);

  if (professorLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner size="lg" />
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
              title="Gestão de Provas"
              subtitle="Bem-vindo(a),"
              professorData={professorData}
              user={user}
              onSignOut={handleSignOut}
            />

            {/* Navegação por Abas */}
            <div className=" text-gray-600 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                  
                  {/* Aba Criar */}
                  <button
                    onClick={() => {
                      setAbaSelecionada('criar');
                      clearMessages();
                    }}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      abaSelecionada === 'criar'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Criar Prova
                    </div>
                  </button>
                  
                  {/* Aba Avaliar */}
                  <button
                    onClick={() => {
                      setAbaSelecionada('avaliar');
                      clearMessages();
                    }}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      abaSelecionada === 'avaliar'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Avaliar Provas
                    </div>
                  </button>
                  
                </nav>
              </div>

              <div className="p-6">
                
                {/* Mensagens */}
                {successMessage && (
                  <SuccessMessage message={successMessage} onClose={clearMessages} />
                )}
                {error && (
                  <ErrorMessage message={error} onRetry={clearMessages} />
                )}

                {/* Conteúdo da Aba Criar */}
                {abaSelecionada === 'criar' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Criar Nova Prova</h2>
                      <p className="text-gray-600 mt-1">
                        Preencha as informações para criar uma nova prova para sua turma
                      </p>
                    </div>

                    <form className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Nome da Prova */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome da Prova <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.nome}
                            onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                            placeholder="Ex: Prova Bimestral - Matemática"
                          />
                        </div>

                        {/* Turma */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Turma <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.idTurma}
                            onChange={(e) => setFormData(prev => ({ ...prev, idTurma: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                          >
                            <option value="">Selecione uma turma</option>
                            {turmasDisponiveis.map(turma => (
                              <option key={turma.idTurma} value={turma.idTurma}>
                                {turma.nome} {turma.curso && `- ${turma.curso}`}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Disciplina */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Disciplina <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.idDisciplina}
                            onChange={(e) => setFormData(prev => ({ ...prev, idDisciplina: e.target.value }))}
                            disabled={!formData.idTurma}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-100"
                          >
                            <option value="">
                              {formData.idTurma ? 'Selecione uma disciplina' : 'Primeiro selecione uma turma'}
                            </option>
                            {disciplinasDisponiveis.map(disciplina => (
                              <option key={disciplina.idDisciplina} value={disciplina.idDisciplina}>
                                {disciplina.nome}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Data da Prova */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data da Prova <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={formData.data}
                            onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">Data não pode ser no passado</p>
                        </div>

                        {/* Peso */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Peso <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="10"
                            value={formData.peso}
                            onChange={(e) => setFormData(prev => ({ ...prev, peso: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                            placeholder="Ex: 3.0"
                          />
                          <p className="text-xs text-gray-500 mt-1">Peso da prova na média final</p>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              nome: '',
                              data: '',
                              peso: '',
                              idTurma: '',
                              idDisciplina: ''
                            });
                            clearMessages();
                          }}
                          disabled={loading}
                          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                          Limpar
                        </button>
                        
                        <button
                          type="button"
                          onClick={criarProva}
                          disabled={loading}
                          className="px-6 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center min-w-[140px] justify-center"
                        >
                          {loading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Criando...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              Criar Prova
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Conteúdo da Aba Avaliar */}
                {abaSelecionada === 'avaliar' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Avaliar Provas</h2>
                      <p className="text-gray-600 mt-1">
                        Selecione uma prova para avaliar e gerenciar as notas dos alunos
                      </p>
                    </div>

                    {loading ? (
                      <div className="flex justify-center py-12">
                        <LoadingSpinner size="lg" />
                      </div>
                    ) : provas.length === 0 ? (
                      <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma prova encontrada</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Crie algumas provas primeiro para poder avaliá-las.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-6">
                        {provas.map((prova) => (
                          <div key={prova.idProva} className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                  {prova.nome}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                  <div>
                                    <span className="font-medium">Turma:</span> {prova.turma.nome}
                                  </div>
                                  <div>
                                    <span className="font-medium">Disciplina:</span> {prova.disciplina.nome}
                                  </div>
                                  <div>
                                    <span className="font-medium">Data:</span> {new Date(prova.data).toLocaleDateString('pt-BR')}
                                  </div>
                                  <div>
                                    <span className="font-medium">Peso:</span> {prova.peso}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="ml-4 flex items-center space-x-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  new Date(prova.data) > new Date() 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {new Date(prova.data) > new Date() ? 'Agendada' : 'Realizada'}
                                </span>
                              </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                              <h4 className="text-md font-medium text-gray-900 mb-3">Avaliações dos Alunos</h4>
                              
                              {/* Simulação de alunos - você precisará ajustar conforme seu backend */}
                              <div className="space-y-3">
                                {[
                                  { idAluno: '1', nomeAluno: 'João Silva', nota: undefined, concluida: false },
                                  { idAluno: '2', nomeAluno: 'Maria Santos', nota: 8.5, concluida: true },
                                  { idAluno: '3', nomeAluno: 'Pedro Costa', nota: 7.0, concluida: false },
                                  { idAluno: '4', nomeAluno: 'Ana Oliveira', nota: undefined, concluida: false },
                                ].map((aluno) => (
                                  <div key={aluno.idAluno} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                                    <div className="flex items-center space-x-3">
                                      <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                          <span className="text-sm font-medium text-gray-600">
                                            {aluno.nomeAluno.charAt(0).toUpperCase()}
                                          </span>
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">{aluno.nomeAluno}</p>
                                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                                          <span>
                                            Status: <span className={`font-medium ${
                                              aluno.concluida ? 'text-green-600' : 'text-blue-600'
                                            }`}>
                                              {aluno.concluida ? 'Concluída' : 'Pendente'}
                                            </span>
                                          </span>
                                          {aluno.nota !== undefined && (
                                            <span>
                                              Nota: <span className="font-medium text-gray-700">{aluno.nota}</span>
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-3">
                                      {/* Mostrar nota se já avaliada */}
                                      {aluno.nota !== undefined && (
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                          aluno.nota >= 7 ? 'bg-green-100 text-green-800' : 
                                          aluno.nota >= 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                          Nota: {aluno.nota}
                                        </span>
                                      )}
                                      
                                      {/* Input e botão para avaliar (se ainda não tem nota) */}
                                      {aluno.nota === undefined && (
                                        <div className="flex items-center space-x-2">
                                          <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="10"
                                            placeholder="Nota"
                                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                            onKeyPress={(e) => {
                                              if (e.key === 'Enter') {
                                                const nota = parseFloat((e.target as HTMLInputElement).value);
                                                if (nota >= 0 && nota <= 10) {
                                                  avaliarProva(prova.idProva, aluno.idAluno, nota);
                                                  (e.target as HTMLInputElement).value = '';
                                                }
                                              }
                                            }}
                                          />
                                          <button
                                            onClick={() => {
                                              const input = document.querySelector(`input[placeholder="Nota"]`) as HTMLInputElement;
                                              if (input) {
                                                const nota = parseFloat(input.value);
                                                if (nota >= 0 && nota <= 10) {
                                                  avaliarProva(prova.idProva, aluno.idAluno, nota);
                                                  input.value = '';
                                                }
                                              }
                                            }}
                                            disabled={avaliandoAluno === aluno.idAluno}
                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                          >
                                            {avaliandoAluno === aluno.idAluno ? (
                                              <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                              </svg>
                                            ) : (
                                              'Avaliar'
                                            )}
                                          </button>
                                        </div>
                                      )}
                                      
                                      {/* Botão para marcar como concluída */}
                                      {!aluno.concluida && (
                                        <button
                                          onClick={() => concluirProva(prova.idProva, aluno.idAluno)}
                                          disabled={concluindoProva === aluno.idAluno}
                                          className="inline-flex items-center px-3 py-1 border border-blue-300 text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                        >
                                          {concluindoProva === aluno.idAluno ? (
                                            <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                            </svg>
                                          ) : (
                                            <>
                                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                              </svg>
                                              Concluir
                                            </>
                                          )}
                                        </button>
                                      )}
                                      
                                      {/* Indicador de concluída */}
                                      {aluno.concluida && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                          </svg>
                                          Concluída
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Estatísticas da Prova */}
                              <div className="mt-6 pt-4 border-t border-gray-200">
                                <h5 className="text-sm font-medium text-gray-900 mb-3">Estatísticas da Prova</h5>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <div className="text-lg font-bold text-blue-600">4</div>
                                    <div className="text-xs text-blue-600">Total Alunos</div>
                                  </div>
                                  <div className="text-center p-3 bg-green-50 rounded-lg">
                                    <div className="text-lg font-bold text-green-600">2</div>
                                    <div className="text-xs text-green-600">Avaliadas</div>
                                  </div>
                                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                                    <div className="text-lg font-bold text-yellow-600">2</div>
                                    <div className="text-xs text-yellow-600">Pendentes</div>
                                  </div>
                                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                                    <div className="text-lg font-bold text-purple-600">7.8</div>
                                    <div className="text-xs text-purple-600">Média</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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