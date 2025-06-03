import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { getAPIClient } from '@/services/api';
import type { CursoResponse } from '@/schemas/secretaria/curso/cursoValidations';

interface UseCursosListReturn {
  cursos: CursoResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  deleteCurso: (cursoId: string) => Promise<void>;
}

export const useCursosList = (): UseCursosListReturn => {
  const [cursos, setCursos] = useState<CursoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(AuthContext);

  const fetchCursos = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      const api = getAPIClient();
      const response = await api.get(`/curso/${user.id}/secretaria`);
      
      setCursos(response.data);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const deleteCurso = useCallback(async (cursoId: string) => {
    try {
      const api = getAPIClient();
      await api.delete(`/curso/${cursoId}`);
      
      // Remove o curso da lista local
      setCursos(prev => prev.filter(curso => curso.id_curso !== cursoId));
    } catch (err: any) {
      throw new Error(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    fetchCursos();
  }, [fetchCursos]);

  return {
    cursos,
    loading,
    error,
    refetch: fetchCursos,
    deleteCurso
  };
};

const getErrorMessage = (err: any): string => {
  if (err.response) {
    const { status, data } = err.response;
    
    switch (status) {
      case 401:
        return 'Sessão expirada. Por favor, faça login novamente.';
      case 403:
        return 'Sem permissão para visualizar cursos.';
      case 404:
        return 'Nenhum curso encontrado.';
      default:
        return data?.message || 'Erro ao carregar cursos.';
    }
  }
  return err.message || 'Erro de conexão';
};