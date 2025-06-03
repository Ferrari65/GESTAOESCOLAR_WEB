import { useState, useCallback } from 'react';
import { getAPIClient, handleApiError } from '@/services/api';
import { validateDisciplinaDTO, type DisciplinaDTO } from '@/schemas/secretaria/disciplina/disciplinaValidations';
import type { UseDisciplinaAPIReturn } from '@/types/secretariaTypes/cadastroDisciplina/disciplina';

export const useDisciplinaAPI = (): UseDisciplinaAPIReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createDisciplina = useCallback(async (data: DisciplinaDTO): Promise<DisciplinaDTO> => {
    setLoading(true);
    setError(null);

    try {
      const validation = validateDisciplinaDTO(data);
      if (!validation.success) {
        throw new Error('Dados inválidos: ' + validation.error?.issues[0].message);
      }

      const validData = validation.data;
      const api = getAPIClient();

      const response = await api.post(`/disciplina/${validData.id_secretaria}`, validData);

      return response.data;
    } catch (err: unknown) {
      const { message } = handleApiError(err, 'CreateDisciplina');

      let errorMessage = message;

      // Validação de erro específico do backend
      if (
        (err as any)?.response?.status === 400 &&
        typeof (err as any)?.response?.data === 'string' &&
        (err as any)?.response?.data.toLowerCase().includes('disciplina já cadastrada')
      ) {
        errorMessage = 'Esta disciplina já está cadastrada no sistema.';
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createDisciplina,
    loading,
    error,
    clearError
  };
};
