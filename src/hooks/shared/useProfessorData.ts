// src/hooks/shared/useProfessorData.ts
// COPIANDO EXATAMENTE O PADRÃO QUE FUNCIONA NA SECRETARIA

import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { getAPIClient, handleApiError } from '@/services/api';

interface ProfessorData {
  nome: string;
  email: string;
  id_professor: string;
}

interface UseProfessorDataReturn {
  professorData: ProfessorData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// ⚠️ EXATAMENTE IGUAL AO useSecretariaData
const professorDataCache = new Map<string, { data: ProfessorData; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const useProfessorData = (): UseProfessorDataReturn => {
  const [professorData, setProfessorData] = useState<ProfessorData | null>(null);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(AuthContext);

  const fetchProfessorData = useCallback(async (forceRefresh = false) => {
    if (!user?.id) {
      setError('ID do professor não encontrado');
      return;
    }

    // ⚠️ SÓ EXECUTA PARA PROFESSORES (igual a secretaria que só executa para secretarios)
    if (user.role !== 'ROLE_PROFESSOR') {
      return;
    }

    if (!forceRefresh) {
      const cached = professorDataCache.get(user.id);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setProfessorData(cached.data);
        setError(null);
        return;
      }
    }

    // ⚠️ IGUAL A SECRETARIA: só loading se não tem dados
    if (!professorData) {
      setLoading(true);
    }
    setError(null);

    try {
      const api = getAPIClient();
      const response = await api.get(`/professor/${user.id}`);
      
      const data = response.data;
      setProfessorData(data);
      
      // ⚠️ IGUAL A SECRETARIA: salvar no cache
      professorDataCache.set(user.id, {
        data,
        timestamp: Date.now()
      });
      
    } catch (err: unknown) {
      const { message } = handleApiError(err, 'ProfessorData');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, professorData]); // ⚠️ MESMAS DEPENDÊNCIAS DA SECRETARIA

  const refetch = useCallback(async () => {
    await fetchProfessorData(true);
  }, [fetchProfessorData]);

  // ⚠️ EXATAMENTE IGUAL AO useSecretariaData
  useEffect(() => {
    if (user?.id) {
      fetchProfessorData();
    }
  }, [user?.id, fetchProfessorData]);

  return {
    professorData,
    loading,
    error,
    refetch
  };
};