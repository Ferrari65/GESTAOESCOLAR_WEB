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
      console.log('Validating DisciplinaDTO:', validation);
      if (!validation.success) {
        throw new Error('Dados inválidos: ' + validation.error?.issues[0].message);
      }

      const validData = validation.data;
      const api = getAPIClient();
      console.log('Creating Disciplina with data:', validData);

      const response = await api.post(`/disciplina/${validData.id_secretaria}`, validData);

      // Se o backend devolveu 409, tratamos como erro manualmente:
      if (response.status === 409) {
        // ★ Ajuste a mensagem de erro conforme o padrão do seu backend:
        const backendMsg = 
          typeof response.data === "string" 
            ? response.data 
            : (response.data as any).message || "Disciplina já cadastrada.";
        
        const errorMessage = backendMsg.toLowerCase().includes("disciplina já cadastrada")
          ? "Esta disciplina já está cadastrada no sistema."
          : backendMsg;
        
        setError(errorMessage);
        // “forçamos” a Promise a cair no catch de createDisciplina
        throw new Error(errorMessage);
      }

      return response.data;
    } catch (err: unknown) {
      const { message } = handleApiError(err, 'CreateDisciplina');

      let errorMessage = message;

      // Validação de erro específico do backend
      if (
        ((err as any)?.response?.status === 400 || (err as any)?.response?.status === 409) &&
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
