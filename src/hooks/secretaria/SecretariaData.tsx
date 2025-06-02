// hooks/useSecretariaData.ts

import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { getAPIClient } from '@/services/api';
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

  // ✅ FUNÇÃO PARA OBTER ID DA SECRETARIA DE MÚLTIPLAS FONTES
  const getSecretariaId = useCallback((): string | null => {
    // 1. Tentar pegar do user.id primeiro
    if (user?.id) {
      console.log('🔍 ID obtido do user.id:', user.id);
      return user.id;
    }

    // 2. Tentar localStorage
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('secretaria_id');
      if (storedId) {
        console.log('🔍 ID obtido do localStorage:', storedId);
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
            console.log('🔍 ID obtido do token.sub:', payload.sub);
            return payload.sub;
          }
          if (payload.id) {
            console.log('🔍 ID obtido do token.id:', payload.id);
            return payload.id;
          }
        }
      } catch (e) {
        console.warn('Erro ao decodificar token:', e);
      }
    }

    return null;
  }, [user?.id]);

  const fetchSecretariaData = useCallback(async () => {
    try {
      console.log('🎬 fetchSecretariaData iniciado');
      console.log('👤 Dados do user:', {
        hasUser: !!user,
        userId: user?.id,
        userRole: user?.role,
        userEmail: user?.email
      });

      setLoading(true);
      setError(null);

      const secretariaId = getSecretariaId();
      
      console.log('🔍 ID final obtido:', {
        secretariaId,
        hasId: !!secretariaId,
        fonte: user?.id ? 'user.id' : 
               localStorage.getItem('secretaria_id') ? 'localStorage' : 
               'token'
      });

      if (!secretariaId) {
        throw new Error('ID da secretaria não encontrado em nenhuma fonte (user.id, localStorage, token)');
      }
      
      const api = getAPIClient();
      console.log('🌐 Fazendo requisição para:', `/secretaria/${secretariaId}`);
      
      const response = await api.get(`/secretaria/${secretariaId}`);
      
      console.log('✅ Dados da secretaria encontrados:', response.data);
      setSecretariaData(response.data);
      
    } catch (err: any) {
      console.error('❌ Erro ao buscar dados da secretaria:', {
        error: err.message,
        response: err.response?.data,
        status: err.response?.status,
        hasUser: !!user,
        userId: user?.id
      });
      
      let errorMessage = 'Erro ao carregar dados da secretaria';
      
      if (err.response) {
        switch (err.response.status) {
          case 401:
            errorMessage = 'Sessão expirada. Por favor, faça login novamente.';
            break;
          case 403:
            errorMessage = 'Sem permissão para acessar dados da secretaria.';
            break;
          case 404:
            errorMessage = 'Secretaria não encontrada.';
            break;
          default:
            errorMessage = err.response.data?.message || errorMessage;
        }
      } else if (err.message.includes('ID da secretaria não encontrado')) {
        errorMessage = 'Sessão inválida. Por favor, faça login novamente.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getSecretariaId]);

  const refetch = useCallback(async () => {
    console.log('🔄 Refazendo busca dos dados da secretaria...');
    await fetchSecretariaData();
  }, [fetchSecretariaData]);

  // ✅ AGUARDAR UM POUCO PARA O CONTEXTO CARREGAR
  useEffect(() => {
    console.log('🎬 useSecretariaData montado');
    
    // Pequeno delay para garantir que o AuthContext carregou
    const timer = setTimeout(() => {
      fetchSecretariaData();
    }, 500);

    return () => clearTimeout(timer);
  }, [fetchSecretariaData]);

  // Debug - log das mudanças de estado
  useEffect(() => {
    console.log('📊 Estado da secretaria atualizado:', {
      hasData: !!secretariaData,
      loading,
      hasError: !!error,
      errorMessage: error
    });
  }, [secretariaData, loading, error]);

  return {
    secretariaData,
    loading,
    error,
    refetch
  };
};