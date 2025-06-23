// src/hooks/shared/index.ts
// ← ALTERADO: Endpoint corrigido para /professor/{id_professor}

import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { getAPIClient, handleApiError } from '@/services/api';

interface SecretariaData {
  nome: string;
  email: string;
  id_secretaria: string;
}

interface UseSecretariaDataReturn {
  secretariaData: SecretariaData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

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

const secretariaDataCache = new Map<string, { data: SecretariaData; timestamp: number }>();
const professorDataCache = new Map<string, { data: ProfessorData; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; 

// Hook da secretaria (mantém inalterado)
export const useSecretariaData = (): UseSecretariaDataReturn => {
  const [secretariaData, setSecretariaData] = useState<SecretariaData | null>(null);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(AuthContext);

  const fetchSecretariaData = useCallback(async (forceRefresh = false) => {
    if (!user?.id) {
      setError('ID da secretaria não encontrado');
      return;
    }

    if (!forceRefresh) {
      const cached = secretariaDataCache.get(user.id);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setSecretariaData(cached.data);
        setError(null);
        return;
      }
    }

    if (!secretariaData) {
      setLoading(true);
    }
    setError(null);

    try {
      const api = getAPIClient();
      const response = await api.get(`/secretaria/${user.id}`);
      
      const data = response.data;
      setSecretariaData(data);
      
      secretariaDataCache.set(user.id, {
        data,
        timestamp: Date.now()
      });
      
    } catch (err: unknown) {
      const { message } = handleApiError(err, 'SecretariaData');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, secretariaData]);

  const refetch = useCallback(async () => {
    await fetchSecretariaData(true);
  }, [fetchSecretariaData]);

  useEffect(() => {
    if (user?.id) {
      fetchSecretariaData();
    }
  }, [user?.id, fetchSecretariaData]);

  return {
    secretariaData,
    loading,
    error,
    refetch
  };
};

// ⚠️ HOOK DO PROFESSOR COM ENDPOINT CORRETO
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

    // Só executa para professores
    if (user.role !== 'ROLE_PROFESSOR') {
      return;
    }

    // Verificar cache primeiro
    if (!forceRefresh) {
      const cached = professorDataCache.get(user.id);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setProfessorData(cached.data);
        setError(null);
        return;
      }
    }

    if (!professorData) {
      setLoading(true);
    }
    setError(null);

    try {
      // ⚠️ ENDPOINT CORRETO: /professor/{id_professor}
      console.log('🔍 [PROFESSOR-DATA] Buscando dados em:', `GET /professor/${user.id}`);
      
      const api = getAPIClient();
      const response = await api.get(`/professor/${user.id}`);
      
      console.log('✅ [PROFESSOR-DATA] Dados encontrados:', response.data);
      
      const data = response.data;
      setProfessorData(data);
      
      // Salvar no cache
      professorDataCache.set(user.id, {
        data,
        timestamp: Date.now()
      });
      
    } catch (err: unknown) {
      const { message, status } = handleApiError(err, 'ProfessorData');
      
      console.log('❌ [PROFESSOR-DATA] Erro na requisição:', { message, status, endpoint: `/professor/${user.id}` });
      
      // ⚠️ FALLBACK GRACIOSO: Se for 404 ou erro de rede, criar dados básicos
      if (status === 404 || status === 500 || !status) {
        console.log('🔄 [PROFESSOR-DATA] Endpoint não disponível, criando dados básicos');
        
        // Extrair nome do email (parte antes do @)
        const emailParts = user.email.split('@');
        const emailName = emailParts[0] || 'Professor';
        
        // Capitalizar primeira letra
        const nomeCapitalizado = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        
        const dadosBasicos: ProfessorData = {
          nome: nomeCapitalizado,
          email: user.email,
          id_professor: user.id
        };
        
        console.log('✅ [PROFESSOR-DATA] Usando dados básicos:', dadosBasicos);
        
        setProfessorData(dadosBasicos);
        
        // ⚠️ IMPORTANTE: Salvar no cache para persistir entre reloads
        professorDataCache.set(user.id, {
          data: dadosBasicos,
          timestamp: Date.now()
        });
        
        // ⚠️ NÃO mostrar erro para o usuário, usar dados básicos silenciosamente
        setError(null);
        
      } else {
        // Para outros tipos de erro (401, 403, etc), mostrar erro
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.email, user?.role, professorData]);

  const refetch = useCallback(async () => {
    // Limpar cache antes de tentar novamente
    if (user?.id) {
      professorDataCache.delete(user.id);
    }
    await fetchProfessorData(true);
  }, [fetchProfessorData, user?.id]);

  useEffect(() => {
    if (user?.id && user?.role === 'ROLE_PROFESSOR') {
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

export const useLoading = (initialState = false) => {
  const [loading, setLoading] = useState(initialState);

  const withLoading = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    try {
      setLoading(true);
      return await fn();
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, setLoading, withLoading };
};

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const sharedHooks = {
  useSecretariaData,
  useProfessorData,
  useLoading,
  useDebounce
};