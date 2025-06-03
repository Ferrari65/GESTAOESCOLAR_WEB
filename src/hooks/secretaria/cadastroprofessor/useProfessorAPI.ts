import { useState, useCallback } from 'react';
import { getAPIClient, handleApiError } from '@/services/api';
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
 
      const { message } = handleApiError(err, 'CreateProfessor');
      
      let errorMessage = message;
      if (err.response?.status === 400 && 
          typeof err.response.data === 'string' && 
          err.response.data.toLowerCase().includes('professor já cadastrado')) {
        errorMessage = 'Este professor já está cadastrado no sistema.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProfessores = useCallback(async (secretariaId: string): Promise<Professor[]> => {
    setLoading(true);
    setError(null);
    
    try {
      
      if (!secretariaId) {
        throw new Error('ID da secretaria é obrigatório para buscar professores');
      }

      if (secretariaId === 'undefined' || secretariaId === 'null') {
        throw new Error('ID da secretaria inválido (string undefined/null)');
      }

      const api = getAPIClient();
      const endpoint = `/professor/${secretariaId}`;
      
      const response = await api.get(endpoint);
      
      return response.data;
    } catch (err: any) {
      const { message } = handleApiError(err, 'FetchProfessores');
      
      let errorMessage = message;
      if (err.response?.status === 404) {
        errorMessage = `Endpoint não encontrado: GET /professor/${secretariaId}. Verifique se o ID da secretaria está correto.`;
      } else if (err.response?.status === 403) {
        errorMessage = 'Sem permissão para acessar professores desta secretaria.';
      }
      
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
