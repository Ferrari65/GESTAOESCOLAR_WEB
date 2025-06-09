// src/components/secretaria/home/professor/ListaProfessorCompleta.tsx - VERSÃO CORRIGIDA

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useProfessorList, useProfessorActions, type ProfessorResponse } from '@/hooks/secretaria/professor';
import { LoadingSpinner } from '@/components/ui/loading/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { formatCPF, formatPhone } from '@/schemas/professor';

const PROFESSORES_POR_PAGINA = 8;

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

// ===== COMPONENTE DE PAGINAÇÃO =====
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (currentPage >= totalPages - 2) {
      return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  };

  const visiblePages = getVisiblePages();

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Próxima
        </button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{startItem}</span> até{' '}
            <span className="font-medium">{endItem}</span> de{' '}
            <span className="font-medium">{totalItems}</span> resultados
          </p>
        </div>

        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Página anterior</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
              </svg>
            </button>

            {visiblePages.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${
                  page === currentPage
                    ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Próxima página</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

// ===== ✅ MODAL DE DETALHES CORRIGIDO (SEM CPF VISÍVEL) =====
interface ModalDetalhesProps {
  professor: ProfessorResponse;
  onClose: () => void;
  onEdit: (professor: ProfessorResponse) => void;
}

const ModalDetalhes: React.FC<ModalDetalhesProps> = ({ professor, onClose, onEdit }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3 w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Detalhes do Professor
                </h3>
                
                {/* ✅ INFORMAÇÕES SEM CPF */}
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nome:</label>
                    <p className="text-sm text-gray-900">{professor.nome}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">ID:</label>
                      <p className="text-sm text-gray-900">#{professor.id_professor ? professor.id_professor.slice(-6) : 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Sexo:</label>
                      <p className="text-sm text-gray-900">{professor.sexo === 'M' ? 'Masculino' : 'Feminino'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email:</label>
                    <p className="text-sm text-gray-900">{professor.email}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Telefone:</label>
                    <p className="text-sm text-gray-900">{formatPhone(professor.telefone)}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Data de Nascimento:</label>
                    <p className="text-sm text-gray-900">
                      {new Date(professor.data_nasc).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Endereço:</label>
                    <p className="text-sm text-gray-900">
                      {professor.logradouro}, {professor.numero} - {professor.bairro}
                      <br />
                      {professor.cidade} - {professor.uf}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status:</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      professor.situacao === 'ATIVO' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {professor.situacao}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Botões */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={() => onEdit(professor)}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Editar
            </button>
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== COMPONENTE PRINCIPAL CORRIGIDO =====
interface ListaProfessorCompletaProps {
  onEditarProfessor?: (professor: ProfessorResponse) => void;
}

export default function ListaProfessorCompleta({ onEditarProfessor }: ListaProfessorCompletaProps) {
  const { 
    professores, 
    loading, 
    error, 
    refetch, 
    clearError,
    updateProfessorOptimistic,
    revertProfessorOptimistic 
  } = useProfessorList();
  
  const { 
    updateSituacao, 
    deleteProfessor,
    loading: actionLoading, 
    successMessage, 
    error: actionError, 
    clearMessages 
  } = useProfessorActions();
  
  // Estados locais
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'nome' | 'email' | 'situacao'>('nome');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [professorSelecionado, setProfessorSelecionado] = useState<ProfessorResponse | null>(null);
  const [filtro, setFiltro] = useState('');
  const [professoresProcessando, setProfessoresProcessando] = useState<Set<string>>(new Set());

  // Filtrar e ordenar professores
  const professoresFiltrados = useMemo(() => {
    let resultado = professores;

    // Aplicar filtro
    if (filtro.trim()) {
      resultado = resultado.filter(professor =>
        professor.nome.toLowerCase().includes(filtro.toLowerCase()) ||
        professor.email.toLowerCase().includes(filtro.toLowerCase())
        // ✅ REMOVIDO FILTRO POR CPF
      );
    }

    // Aplicar ordenação
    resultado.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'nome' || sortField === 'email') {
        aValue = (aValue as string).toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return resultado;
  }, [professores, filtro, sortField, sortDirection]);

  const totalProfessores = professoresFiltrados.length;
  const totalPages = Math.ceil(totalProfessores / PROFESSORES_POR_PAGINA);
  
  const professoresExibidos = useMemo(() => {
    const startIndex = (currentPage - 1) * PROFESSORES_POR_PAGINA;
    const endIndex = startIndex + PROFESSORES_POR_PAGINA;
    return professoresFiltrados.slice(startIndex, endIndex);
  }, [professoresFiltrados, currentPage]);

  // Funções auxiliares
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const handleRefetch = useCallback(() => {
    setCurrentPage(1); 
    clearError();
    clearMessages();
    refetch();
  }, [refetch, clearError, clearMessages]);

  const handleSort = useCallback((field: 'nome' | 'email' | 'situacao') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  }, [sortField]);

  // ✅ TOGGLE DE SITUAÇÃO CORRIGIDO - PROCESSA APENAS UM PROFESSOR
  const handleToggleSituacao = useCallback(async (professor: ProfessorResponse) => {
    // ✅ VERIFICAR SE JÁ ESTÁ PROCESSANDO ESTE PROFESSOR
    if (professoresProcessando.has(professor.id_professor)) {
      console.log('⏳ Professor já está sendo processado:', professor.nome);
      return;
    }

    const novaSituacao = professor.situacao === 'ATIVO' ? 'INATIVO' : 'ATIVO';
    
    console.log('🔄 Alterando situação do professor:', {
      id: professor.id_professor,
      nome: professor.nome,
      situacaoAtual: professor.situacao,
      novaSituacao: novaSituacao
    });

    // ✅ MARCAR COMO PROCESSANDO
    setProfessoresProcessando(prev => new Set(prev).add(professor.id_professor));
    
    // ✅ ATUALIZAR IMEDIATAMENTE NA TELA (OTIMISTA)
    const dadosOriginais = { ...professor };
    updateProfessorOptimistic(professor.id_professor, { situacao: novaSituacao });
    
    try {
      // ✅ ENVIAR PARA API
      await updateSituacao(professor.id_professor, novaSituacao);
      console.log('✅ Situação alterada com sucesso:', professor.nome);
      
    } catch (error) {
      console.error('❌ Erro ao alterar situação:', error);
      // ✅ REVERTER SE DEU ERRO
      revertProfessorOptimistic(professor.id_professor, dadosOriginais);
    } finally {
      // ✅ DESMARCAR COMO PROCESSANDO
      setProfessoresProcessando(prev => {
        const newSet = new Set(prev);
        newSet.delete(professor.id_professor);
        return newSet;
      });
    }
  }, [updateSituacao, updateProfessorOptimistic, revertProfessorOptimistic, professoresProcessando]);

  // ✅ INATIVAR PROFESSOR CORRIGIDO
  const handleInativarProfessor = useCallback(async (professor: ProfessorResponse) => {
    if (!window.confirm(`Tem certeza que deseja inativar o professor ${professor.nome}?`)) {
      return;
    }

    // ✅ VERIFICAR SE JÁ ESTÁ PROCESSANDO
    if (professoresProcessando.has(professor.id_professor)) {
      return;
    }

    console.log('🗑️ Inativando professor:', professor.nome);

    // ✅ MARCAR COMO PROCESSANDO
    setProfessoresProcessando(prev => new Set(prev).add(professor.id_professor));
    
    const dadosOriginais = { ...professor };
    updateProfessorOptimistic(professor.id_professor, { situacao: 'INATIVO' });
    
    try {
      await deleteProfessor(professor.id_professor);
      console.log('✅ Professor inativado com sucesso:', professor.nome);
    } catch (error) {
      console.error('❌ Erro ao inativar professor:', error);
      revertProfessorOptimistic(professor.id_professor, dadosOriginais);
    } finally {
      // ✅ DESMARCAR COMO PROCESSANDO
      setProfessoresProcessando(prev => {
        const newSet = new Set(prev);
        newSet.delete(professor.id_professor);
        return newSet;
      });
    }
  }, [deleteProfessor, updateProfessorOptimistic, revertProfessorOptimistic, professoresProcessando]);

  const getSortIcon = (field: 'nome' | 'email' | 'situacao') => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Carregando professores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <ErrorMessage message={error} onRetry={handleRefetch} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mensagens de feedback */}
      {(successMessage || actionError) && (
        <div className="space-y-2">
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-green-700">{successMessage}</span>
                <button onClick={clearMessages} className="ml-auto text-green-400 hover:text-green-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          {actionError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-red-700">{actionError}</span>
                <button onClick={clearMessages} className="ml-auto text-red-400 hover:text-red-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Header com controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM9 9a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Lista de Professores</h3>
            <p className="text-sm text-gray-600">
              {totalProfessores} professor{totalProfessores !== 1 ? 'es' : ''} encontrado{totalProfessores !== 1 ? 's' : ''}
              {totalPages > 1 && (
                <span className="ml-2">• Página {currentPage} de {totalPages}</span>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* ✅ FILTRO SEM CPF */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={filtro}
              onChange={(e) => {
                setFiltro(e.target.value);
                setCurrentPage(1);
              }}
              className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <button 
            onClick={handleRefetch}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Atualizar
          </button>
        </div>
      </div>

      {/* Tabela de Professores */}
      {totalProfessores === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM9 9a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filtro ? 'Nenhum professor encontrado' : 'Nenhum professor cadastrado'}
          </h3>
          <p className="text-gray-600 mb-6">
            {filtro 
              ? 'Tente ajustar os filtros de busca.' 
              : 'Comece cadastrando seu primeiro professor.'
            }
          </p>
          {filtro && (
            <button
              onClick={() => {
                setFiltro('');
                setCurrentPage(1);
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('nome')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Nome</span>
                      {getSortIcon('nome')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Email</span>
                      {getSortIcon('email')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('situacao')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      {getSortIcon('situacao')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {professoresExibidos.map((professor, index) => {
                  const isProcessando = professoresProcessando.has(professor.id_professor);
                  
                  return (
                    <tr 
                      key={`professor-${professor.id_professor}-${index}`} 
                      className={`transition-colors ${isProcessando ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-indigo-600">
                                {professor.nome.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {professor.nome}
                            </div>
                            {/* ✅ REMOVIDO CPF - MOSTRAR APENAS ID PARCIAL */}
                            <div className="text-sm text-gray-500">
                              ID: #{professor.id_professor ? professor.id_professor.slice(-6) : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{professor.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatPhone(professor.telefone)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 ${
                          professor.situacao === 'ATIVO' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          <svg 
                            className={`w-1.5 h-1.5 mr-1.5 transition-colors duration-200 ${
                              professor.situacao === 'ATIVO' ? 'text-green-400' : 'text-red-400'
                            }`} 
                            fill="currentColor" 
                            viewBox="0 0 8 8"
                          >
                            <circle cx={4} cy={4} r={3} />
                          </svg>
                          {professor.situacao}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Botão Ver Detalhes */}
                          <button
                            onClick={() => setProfessorSelecionado(professor)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Ver detalhes"
                            disabled={isProcessando}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>

                          {/* ✅ TOGGLE ATIVO/INATIVO CORRIGIDO */}
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-600">
                              {professor.situacao === 'ATIVO' ? 'Ativo' : 'Inativo'}
                            </span>
                            <button
                              onClick={() => handleToggleSituacao(professor)}
                              disabled={isProcessando || actionLoading}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 ${
                                professor.situacao === 'ATIVO' 
                                  ? 'bg-blue-600 shadow-md' 
                                  : 'bg-gray-200'
                              } ${isProcessando ? 'animate-pulse' : ''}`}
                              title={`${professor.situacao === 'ATIVO' ? 'Desativar' : 'Ativar'} professor`}
                            >
                              <span className="sr-only">
                                {professor.situacao === 'ATIVO' ? 'Desativar' : 'Ativar'} professor
                              </span>
                              {isProcessando ? (
                                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center transform transition-transform duration-200 translate-x-1">
                                  <svg className="w-2 h-2 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                  </svg>
                                </div>
                              ) : (
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${
                                    professor.situacao === 'ATIVO' ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              )}
                            </button>
                          </div>

                          {/* Botão Inativar */}
                          {professor.situacao === 'ATIVO' && (
                            <button
                              onClick={() => handleInativarProfessor(professor)}
                              disabled={isProcessando || actionLoading}
                              className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                              title="Inativar professor"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalProfessores}
            itemsPerPage={PROFESSORES_POR_PAGINA}
          />
        </div>
      )}

      {/* Estatísticas resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {professores.filter(p => p.situacao === 'ATIVO').length}
          </div>
          <div className="text-sm text-gray-500">Professores Ativos</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {professores.filter(p => p.situacao === 'INATIVO').length}
          </div>
          <div className="text-sm text-gray-500">Professores Inativos</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {professores.length}
          </div>
          <div className="text-sm text-gray-500">Total de Professores</div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {professorSelecionado && (
        <ModalDetalhes
          professor={professorSelecionado}
          onClose={() => setProfessorSelecionado(null)}
          onEdit={(professor) => {
            setProfessorSelecionado(null);
            onEditarProfessor?.(professor);
          }}
        />
      )}
    </div>
  );
}