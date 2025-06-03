import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { getAPIClient, handleApiError } from '@/services/api';
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

      const { message } = handleApiError(err, 'FetchCursos');
      
      let errorMessage = message;
      if (err.response?.status === 404) {
        errorMessage = 'Nenhum curso encontrado.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Sem permissão para visualizar cursos.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const deleteCurso = useCallback(async (cursoId: string) => {
    try {
      const api = getAPIClient();
      await api.delete(`/curso/${cursoId}`);

      setCursos(prev => prev.filter(curso => curso.id_curso !== cursoId));
    } catch (err: any) {
      const { message } = handleApiError(err, 'DeleteCurso');
      throw new Error(message);
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

// ✅ REMOVIDA: Função getErrorMessage duplicada (agora usando handleApiError do api.ts)