import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { getAPIClient, handleApiError } from '@/services/api';
import { jwtDecode } from 'jwt-decode';

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

export const useSecretariaData = (): UseSecretariaDataReturn => {
  const [secretariaData, setSecretariaData] = useState<SecretariaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(AuthContext);

  //OBTER ID DA SECRETARIA 
  const getSecretariaId = useCallback((): string | null => {
    // 1. Tentar pegar do user.id primeiro
    if (user?.id) {
      return user.id;
    }

    // 2. Tentar localStorage
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('secretaria_id');
      if (storedId) {
        return storedId;
      }
    }

    // 3. Tentar extrair do token JWT
    if (typeof window !== 'undefined') {
      try {
        const token = document.cookie.match(/nextauth\.token=([^;]+)/)?.[1];
        if (token) {
          const payload = jwtDecode<{ sub?: string; id?: string }>(token);
          if (payload.sub) {
            return payload.sub;
          }
          if (payload.id) {
            return payload.id;
          }
        }
      } catch (e) {
        console.error(' Erro ao decodificar token:', e);
      }
    }

    return null;
  }, [user?.id]);

  const fetchSecretariaData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const secretariaId = getSecretariaId();

      if (!secretariaId) {
        throw new Error('ID da secretaria não encontrado em nenhuma fonte (user.id, localStorage, token)');
      }
      
      const api = getAPIClient();
      const response = await api.get(`/secretaria/${secretariaId}`);
      
      setSecretariaData(response.data);
      
    } catch (err: any) {

      const { message } = handleApiError(err, 'SecretariaData');
      
      let errorMessage = message;
      
      if (err.message?.includes('ID da secretaria não encontrado')) {
        errorMessage = 'Sessão inválida. Por favor, faça login novamente.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getSecretariaId]);

  const refetch = useCallback(async () => {
    await fetchSecretariaData();
  }, [fetchSecretariaData]);

  useEffect(() => {

    
    const timer = setTimeout(() => {
      fetchSecretariaData();
    }, 500);

    return () => clearTimeout(timer);
  }, [fetchSecretariaData]);


  return {
    secretariaData,
    loading,
    error,
    refetch
  };
};