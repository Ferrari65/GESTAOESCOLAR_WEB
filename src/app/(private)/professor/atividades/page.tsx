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

interface Atividade {
  idAtividade: string;
  nome: string;
  descricao: string;
  dataEntrega: string;
  peso: number;
  turma: {
    idTurma: string;
    nome: string;
  };
  disciplina: {
    idDisciplina: string;
    nome: string;
  };
  entregas?: EntregaAluno[];
}

interface EntregaAluno {
  idAluno: string;
  nomeAluno: string;
  nota?: number;
  dataEntrega?: string;
  status: 'PENDENTE' | 'ENTREGUE' | 'AVALIADO';
}

interface CriarAtividadeForm {
  nome: string;
  descricao: string;
  dataEntrega: string;
  peso: string;
  idTurma: string;
  idDisciplina: string;
}

type AbaSelecionada = 'criar' | 'avaliar';

export default function ProfessorAtividadesPage(): React.JSX.Element {
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
  const [formData, setFormData] = useState<CriarAtividadeForm>({
    nome: '',
    descricao: '',
    dataEntrega: '',
    peso: '',
    idTurma: '',
    idDisciplina: ''
  });

  // Estados para avaliação
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [atividadeSelecionada, setAtividadeSelecionada] = useState<string>('');
  const [entregas, setEntregas] = useState<EntregaAluno[]>([]);
  const [avaliandoAluno, setAvaliandoAluno] = useState<string | null>(null);

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

  // ===== CRIAR ATIVIDADE =====
  const criarAtividade = useCallback(async () => {
    if (!user?.id) return;

    // Validações
    if (!formData.nome.trim()) {
      setError('Nome da atividade é obrigatório');
      return;
    }
    if (!formData.descricao.trim()) {
      setError('Descrição é obrigatória');
      return;
    }
    if (!formData.dataEntrega) {
      setError('Data de entrega é obrigatória');
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

    setLoading(true);
    setError(null);

    try {
      const api = getAPIClient();
      
      const payload = {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim(),
        dataEntrega: formData.dataEntrega,
        peso: parseFloat(formData.peso)
      };

      await api.post(
        `/atividades/${formData.idDisciplina}/${formData.idTurma}/${user.id}`,
        payload
      );

      setSuccessMessage('Atividade criada com sucesso!');
      
      // Limpar formulário
      setFormData({
        nome: '',
        descricao: '',
        dataEntrega: '',
        peso: '',
        idTurma: '',
        idDisciplina: ''
      });
      setDisciplinasDisponiveis([]);

      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (err: unknown) {
      const { message } = handleApiError(err, 'CriarAtividade');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, formData]);

  // ===== BUSCAR ATIVIDADES PARA AVALIAÇÃO =====
  const fetchAtividades = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Buscar todas as atividades do professor
      // Nota: Este endpoint pode precisar ser ajustado conforme seu backend
      const api = getAPIClient();
      
      // Simulação - você pode precisar ajustar este endpoint
      const turmasResponse = await api.get(`/professor/${user.id}/turmas`);
      const turmas = Array.isArray(turmasResponse.data) ? turmasResponse.data : [turmasResponse.data];
      
      const todasAtividades: Atividade[] = [];
      
      for (const turma of turmas) {
        try {
          // Buscar atividades por turma - endpoint pode precisar ser ajustado
          const atividadesResponse = await api.get(`/atividades/turma/${turma.idTurma}`);
          const atividades = Array.isArray(atividadesResponse.data) ? atividadesResponse.data : [atividadesResponse.data];
          
          atividades.forEach((atividade: any) => {
            todasAtividades.push({
              idAtividade: atividade.idAtividade || atividade.id,
              nome: atividade.nome,
              descricao: atividade.descricao,
              dataEntrega: atividade.dataEntrega,
              peso: atividade.peso,
              turma: {
                idTurma: turma.idTurma,
                nome: turma.nome
              },
              disciplina: {
                idDisciplina: atividade.idDisciplina || '',
                nome: atividade.disciplina?.nome || 'Disciplina'
              }
            });
          });
        } catch (err) {
          console.warn(`Erro ao buscar atividades da turma ${turma.nome}:`, err);
        }
      }
      
      setAtividades(todasAtividades);
    } catch (err) {
      console.error('Erro ao buscar atividades:', err);
      setAtividades([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // ===== AVALIAR ENTREGA =====
  const avaliarEntrega = useCallback(async (idAtividade: string, idAluno: string, nota: number) => {
    setAvaliandoAluno(idAluno);

    try {
      const api = getAPIClient();
      await api.patch(`/atividades/avaliar/${idAtividade}/${idAluno}`, {
        nota: nota
      });

      // Atualizar estado local
      setEntregas(prev => prev.map(entrega => 
        entrega.idAluno === idAluno 
          ? { ...entrega, nota, status: 'AVALIADO' as const }
          : entrega
      ));

      setSuccessMessage(`Nota ${nota} atribuída com sucesso!`);
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (err: unknown) {
      const { message } = handleApiError(err, 'AvaliarEntrega');
      setError(message);
    } finally {
      setAvaliandoAluno(null);
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
      fetchAtividades();
    }
  }, [abaSelecionada, fetchAtividades]);

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
              title="Gestão de Atividades"
              subtitle="Bem-vindo(a),"
              professorData={professorData}
              user={user}
              onSignOut={handleSignOut}
            />

            {/* Navegação por Abas */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
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
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Criar Atividade
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
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      Avaliar Entregas
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
                      <h2 className="text-xl font-semibold text-gray-900">Criar Nova Atividade</h2>
                      <p className="text-gray-600 mt-1">
                        Preencha as informações para criar uma nova atividade para seus alunos
                      </p>
                    </div>

                    <form className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Nome da Atividade */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome da Atividade <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.nome}
                            onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Ex: Lista de Exercícios 01"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
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

                        {/* Data de Entrega */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data de Entrega <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={formData.dataEntrega}
                            onChange={(e) => setFormData(prev => ({ ...prev, dataEntrega: e.target.value }))}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Ex: 2.0"
                          />
                          <p className="text-xs text-gray-500 mt-1">Peso da atividade na média final</p>
                        </div>

                        {/* Descrição */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descrição <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            rows={4}
                            value={formData.descricao}
                            onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Descreva a atividade, objetivos e instruções para os alunos..."
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              nome: '',
                              descricao: '',
                              dataEntrega: '',
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
                          onClick={criarAtividade}
                          disabled={loading}
                          className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center min-w-[140px] justify-center"
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
                              Criar Atividade
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
                      <h2 className="text-xl font-semibold text-gray-900">Avaliar Entregas</h2>
                      <p className="text-gray-600 mt-1">
                        Selecione uma atividade para avaliar as entregas dos alunos
                      </p>
                    </div>

                    {loading ? (
                      <div className="flex justify-center py-12">
                        <LoadingSpinner size="lg" />
                      </div>
                    ) : atividades.length === 0 ? (
                      <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma atividade encontrada</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Crie algumas atividades primeiro para poder avaliá-las.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-6">
                        {atividades.map((atividade) => (
                          <div key={atividade.idAtividade} className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                  {atividade.nome}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                  <div>
                                    <span className="font-medium">Turma:</span> {atividade.turma.nome}
                                  </div>
                                  <div>
                                    <span className="font-medium">Disciplina:</span> {atividade.disciplina.nome}
                                  </div>
                                  <div>
                                    <span className="font-medium">Entrega:</span> {new Date(atividade.dataEntrega).toLocaleDateString('pt-BR')}
                                  </div>
                                </div>
                                <p className="text-gray-600 mt-2">{atividade.descricao}</p>
                              </div>
                              <div className="ml-4 flex items-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Peso: {atividade.peso}
                                </span>
                              </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                              <h4 className="text-md font-medium text-gray-900 mb-3">Entregas dos Alunos</h4>
                              
                              {/* Simulação de entregas - você precisará ajustar conforme seu backend */}
                              <div className="space-y-3">
                                {[
                                  { idAluno: '1', nomeAluno: 'João Silva', status: 'ENTREGUE' as const, nota: undefined },
                                  { idAluno: '2', nomeAluno: 'Maria Santos', status: 'AVALIADO' as const, nota: 8.5 },
                                  { idAluno: '3', nomeAluno: 'Pedro Costa', status: 'PENDENTE' as const, nota: undefined },
                                ].map((entrega) => (
                                  <div key={entrega.idAluno} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                      <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                          <span className="text-sm font-medium text-gray-600">
                                            {entrega.nomeAluno.charAt(0).toUpperCase()}
                                          </span>
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">{entrega.nomeAluno}</p>
                                        <p className="text-xs text-gray-500">
                                          Status: <span className={`font-medium ${
                                            entrega.status === 'AVALIADO' ? 'text-green-600' :
                                            entrega.status === 'ENTREGUE' ? 'text-blue-600' : 'text-gray-600'
                                          }`}>
                                            {entrega.status}
                                          </span>
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-3">
                                      {entrega.status === 'AVALIADO' && entrega.nota !== undefined && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                          Nota: {entrega.nota}
                                        </span>
                                      )}
                                      
                                      {entrega.status === 'ENTREGUE' && (
                                        <div className="flex items-center space-x-2">
                                          <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="10"
                                            placeholder="Nota"
                                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            onKeyPress={(e) => {
                                              if (e.key === 'Enter') {
                                                const nota = parseFloat((e.target as HTMLInputElement).value);
                                                if (nota >= 0 && nota <= 10) {
                                                  avaliarEntrega(atividade.idAtividade, entrega.idAluno, nota);
                                                  (e.target as HTMLInputElement).value = '';
                                                }
                                              }
                                            }}
                                          />
                                          <button
                                            onClick={() => {
                                              const input = document.querySelector(`input[data-aluno="${entrega.idAluno}"]`) as HTMLInputElement;
                                              if (input) {
                                                const nota = parseFloat(input.value);
                                                if (nota >= 0 && nota <= 10) {
                                                  avaliarEntrega(atividade.idAtividade, entrega.idAluno, nota);
                                                  input.value = '';
                                                }
                                              }
                                            }}
                                            disabled={avaliandoAluno === entrega.idAluno}
                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                          >
                                            {avaliandoAluno === entrega.idAluno ? (
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
                                      
                                      {entrega.status === 'PENDENTE' && (
                                        <span className="text-xs text-gray-500">Aguardando entrega</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
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