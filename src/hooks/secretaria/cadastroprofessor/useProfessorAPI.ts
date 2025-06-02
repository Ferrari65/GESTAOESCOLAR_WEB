// hooks/useProfessorAPI.ts

import { useState, useCallback } from 'react';
import { getAPIClient } from '@/services/api';
import type { Professor, ProfessorDTO, UseProfessorAPIReturn } from '@/types/secretariaTypes/cadastroprofessor/professor';

export const useProfessorAPI = (): UseProfessorAPIReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createProfessor = useCallback(async (data: ProfessorDTO): Promise<Professor> => {
    setLoading(true);
    setError(null);
    
    try {
      const api = getAPIClient();
      const response = await api.post(`/professor/${data.id_secretaria}`, data);
      return response.data;
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ VOLTANDO PARA O ENDPOINT COM ID DA SECRETARIA
  const fetchProfessores = useCallback(async (secretariaId: string): Promise<Professor[]> => {
    setLoading(true);
    setError(null);
    
    try {
      // ✅ VERIFICAÇÕES DETALHADAS
      console.log('🔍 fetchProfessores - Debug completo:', {
        secretariaId,
        temSecretariaId: !!secretariaId,
        tipoSecretariaId: typeof secretariaId,
        comprimentoId: secretariaId?.length || 0
      });

      if (!secretariaId) {
        throw new Error('ID da secretaria é obrigatório para buscar professores');
      }

      if (secretariaId === 'undefined' || secretariaId === 'null') {
        throw new Error('ID da secretaria inválido (string undefined/null)');
      }

      const api = getAPIClient();
      const endpoint = `/professor/${secretariaId}`;
      
      console.log('🌐 Fazendo requisição:', {
        endpoint,
        fullURL: `http://localhost:8080${endpoint}`,
        secretariaId
      });
      
      const response = await api.get(endpoint);
      
      console.log('✅ Professores encontrados:', {
        status: response.status,
        quantidade: Array.isArray(response.data) ? response.data.length : 'não é array',
        data: response.data
      });
      
      return response.data;
    } catch (err: any) {
      let errorMessage = 'Erro ao carregar lista de professores';
      
      if (err.response?.status === 404) {
        errorMessage = `Endpoint não encontrado: GET /professor/${secretariaId}. Verifique se o ID da secretaria está correto.`;
      } else if (err.response?.status === 403) {
        errorMessage = 'Sem permissão para acessar professores desta secretaria.';
      }
        
      console.error('❌ Erro detalhado:', {
        secretariaId,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
        endpoint: `/professor/${secretariaId}`
      });
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createProfessor,
    fetchProfessores,
    loading,
    error,
    clearError
  };
};

// Função auxiliar para extrair mensagens de erro
const getErrorMessage = (err: any): string => {
  if (err.response) {
    const { status, data } = err.response;
    
    switch (status) {
      case 400:
        if (typeof data === 'string' && data.toLowerCase().includes('professor já cadastrado')) {
          return 'Este professor já está cadastrado no sistema.';
        }
        return data?.message || 'Dados inválidos. Verifique os campos.';
      
      case 401:
        return 'Sessão expirada. Por favor, faça login novamente.';
      
      case 403:
        return 'Sem permissão para esta operação.';
      
      case 404:
        return 'Recurso não encontrado.';
      
      default:
        return data?.message || 'Erro desconhecido ao processar solicitação.';
    }
  }
  
  return err.message || 'Erro de conexão. Verifique sua internet.';
};