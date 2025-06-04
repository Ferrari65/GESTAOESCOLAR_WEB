import { useCallback, useEffect, useState } from 'react';
import { getAPIClient, handleApiError } from '@/services/api';
import type { Disciplina } from '@/types/secretariaTypes/cadastroDisciplina/disciplina';
import type { UseDisciplinaListReturn, DisciplinaFilters } from '@/types/secretariaTypes/cadastroDisciplina/disciplina';

export const useDisciplinaList = (): UseDisciplinaListReturn => {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DisciplinaFilters>({
    orderBy: 'nome',
    order: 'asc',
    situacao: 'ATIVO'
  });

  const fetchDisciplinas = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const api = getAPIClient();
      const response = await api.get('/disciplina', {
        params: filters
      });

      setDisciplinas(response.data);
    } catch (err: unknown) {
      const { message } = handleApiError(err, 'FetchDisciplinas');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDisciplinas();
  }, [fetchDisciplinas]);

  return {
    disciplinas,
    loading,
    error,
    refetch: fetchDisciplinas,
    filters,
    setFilters
  };
};
