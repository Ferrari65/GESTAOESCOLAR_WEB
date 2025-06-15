'use client';

import { createContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { log } from '@/utils/logger';
// ===== IMPORTAR CONFIGURAÇÃO CENTRALIZADA =====
import { AUTH_CONFIG, API_CONFIG, getDashboardRoute } from '@/config/app';
// ===== IMPORTAR TIPOS CENTRALIZADOS =====
import type { User, AuthError } from '@/types';

// ===== INTERFACES ESPECÍFICAS DO CONTEXTO =====
interface LoginResponse {
  id: string;
  token: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => void;
  isLoading: boolean;
  user: User | null;
  error: AuthError | null;
  clearError: () => void;
  isInitialized: boolean;
  refreshAuth: () => Promise<void>;
  showWelcome: boolean;
  setShowWelcome: (show: boolean) => void;
}

interface JWTPayload {
  sub?: string;
  email?: string;
  role: string;
  exp: number;
  iat?: number;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

// ===== ENDPOINTS DE LOGIN =====
const LOGIN_ENDPOINTS = [
  '/secretaria/auth/login',
  '/professor/auth/login'
] as const;

// ===== AXIOS INSTANCE =====
const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers
});

function isAxiosError(error: unknown): error is AxiosError {
  return error !== null && 
         typeof error === 'object' && 
         'isAxiosError' in error;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Erro desconhecido';
}

// ===== TOKEN MANAGER =====
const TokenManager = {
  save: (token: string, secretariaId?: string): void => {
    if (typeof window === 'undefined') return;
    
    try {
      const expires = new Date(Date.now() + AUTH_CONFIG.maxAge * 1000).toUTCString();
      const isSecure = window.location.protocol === 'https:';
      
      document.cookie = `${AUTH_CONFIG.tokenCookieName}=${token}; path=/; expires=${expires}; SameSite=Lax${isSecure ? '; Secure' : ''}`;
      localStorage.setItem(AUTH_CONFIG.tokenLocalStorageKey, token);
      
      if (secretariaId) {
        localStorage.setItem(AUTH_CONFIG.secretariaIdKey, secretariaId);
      }
    } catch (error) {
      log.error('AUTH', 'Erro ao salvar token', error);
    }
  },

  get: (): string | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const cookieMatch = document.cookie.match(new RegExp(`${AUTH_CONFIG.tokenCookieName}=([^;]+)`));
      if (cookieMatch?.[1]) {
        return cookieMatch[1];
      }
      
      const localToken = localStorage.getItem(AUTH_CONFIG.tokenLocalStorageKey);
      if (localToken) {
        return localToken;
      }
      
      return null;
    } catch (error) {
      log.error('AUTH', 'Erro ao obter token', error);
      return null;
    }
  },

  remove: (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      document.cookie = `${AUTH_CONFIG.tokenCookieName}=; path=/; max-age=0`;
      localStorage.removeItem(AUTH_CONFIG.tokenLocalStorageKey);
      localStorage.removeItem(AUTH_CONFIG.secretariaIdKey);
    } catch (error) {
      log.error('AUTH', 'Erro ao remover token', error);
    }
  },

  getSecretariaId: (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(AUTH_CONFIG.secretariaIdKey);
    } catch {
      return null;
    }
  },

  isValid: (token: string): boolean => {
    try {
      const payload = jwtDecode<JWTPayload>(token);
      const isExpired = payload.exp <= Date.now() / 1000;
      const hasRole = Boolean(payload.role);
      
      return !isExpired && hasRole;
    } catch (error) {
      return false;
    }
  }
};

const createError = (type: AuthError['type'], message: string, statusCode?: number): AuthError => ({
  type, message, statusCode
});

const handleAxiosError = (error: AxiosError<ApiErrorResponse>): AuthError => {
  if (error.response) {
    const status = error.response.status;
    const serverMessage = error.response.data?.message;
    
    switch (status) {
      case 400:
        return createError('validation', serverMessage || 'Dados inválidos fornecidos.', status);
      case 401:
        return createError('unauthorized', 'Email ou senha incorretos.', status);
      case 403:
        return createError('unauthorized', 'Sem permissão para acessar.', status);
      case 404:
        return createError('server', 'Serviço não encontrado.', status);
      case 500:
        return createError('server', 'Erro interno do servidor.', status);
      default:
        return createError('server', serverMessage || 'Erro no servidor.', status);
    }
  }
  
  if (error.request) {
    return createError('network', 'Erro de conexão. Verifique sua internet.');
  }
  
  return createError('unknown', error.message || 'Erro desconhecido.');
};

// ===== CONTEXT =====
export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const clearError = useCallback(() => setError(null), []);

  const processToken = useCallback((token: string): User | null => {
    try {
      if (!TokenManager.isValid(token)) {
        return null;
      }

      const payload = jwtDecode<JWTPayload>(token);

      let userId = '';
      if (payload.role === 'ROLE_SECRETARIA') {
        userId = TokenManager.getSecretariaId() || payload.sub || '';
      } else {
        userId = payload.sub || '';
      }

      const userData = {
        email: payload.email || payload.sub || '',
        role: payload.role,
        id: userId
      };

      return userData;
    } catch (error) {
      log.error('AUTH', 'Erro ao processar token', error);
      return null;
    }
  }, []);

  const refreshAuth = useCallback(async (): Promise<void> => {
    try {
      const token = TokenManager.get();
      
      if (!token) {
        setUser(null);
        return;
      }

      if (!TokenManager.isValid(token)) {
        TokenManager.remove();
        setUser(null);
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          router.push('/login');
        }
        return;
      }

      const userData = processToken(token);
      if (userData) {
        setUser(userData);
      } else {
        TokenManager.remove();
        setUser(null);
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          router.push('/login');
        }
      }
    } catch (error) {
      log.error('AUTH', 'Erro na verificação de autenticação', error);
      TokenManager.remove();
      setUser(null);
    }
  }, [processToken, router]);

  const attemptLogin = useCallback(async (credentials: LoginCredentials): Promise<AxiosResponse<LoginResponse>> => {
    const errors: AxiosError[] = [];
    
    for (const endpoint of LOGIN_ENDPOINTS) {
      try {
        const response = await api.post<LoginResponse>(endpoint, {
          email: credentials.email,
          senha: credentials.password
        });
        
        return response;
      } catch (error: unknown) {
        if (isAxiosError(error)) {
          const axiosError = error as AxiosError<ApiErrorResponse>;
          errors.push(axiosError);
          
          if (axiosError.response?.status === 401 || axiosError.response?.status === 400) {
            throw handleAxiosError(axiosError);
          }
        }
      }
    }
    
    throw createError('server', 'Nenhum servidor disponível.');
  }, []);

  const signIn = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      TokenManager.remove();
      
      const response = await attemptLogin(credentials);
      const data = response.data;
      
      if (!data.token || !data.id) {
        throw createError('server', 'Resposta inválida do servidor');
      }

      const userData = processToken(data.token);
      if (!userData) {
        throw createError('server', 'Token inválido recebido');
      }

      TokenManager.save(data.token, userData.role === 'ROLE_SECRETARIA' ? data.id : undefined);
      setUser({ ...userData, id: data.id });
      
      setShowWelcome(true);

      setTimeout(() => {
        setShowWelcome(false);
        const redirectPath = getDashboardRoute(userData.role);
        router.push(redirectPath);
      }, 2000);
      
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        setError(handleAxiosError(error as AxiosError<ApiErrorResponse>));
      } else if (error && typeof error === 'object' && 'type' in error) {
        setError(error as AuthError);
      } else {
        setError(createError('unknown', getErrorMessage(error)));
      }
      
      TokenManager.remove();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [attemptLogin, processToken, router]);

  const signOut = useCallback((): void => {
    setUser(null);
    setError(null);
    setShowWelcome(false);
    TokenManager.remove();
    router.push('/login');
  }, [router]);

  // ===== INICIALIZAÇÃO =====
  useEffect(() => {
    const initializeAuth = async (): Promise<void> => {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout de inicialização')), 5000)
        );
        
        await Promise.race([refreshAuth(), timeoutPromise]);
      } catch (error) {
        log.warn('AUTH', 'Timeout na inicialização da autenticação', error);
        TokenManager.remove();
        setUser(null);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [refreshAuth]);

  // ===== CONTEXT VALUE =====
  const contextValue = useMemo((): AuthContextData => ({
    signIn,
    signOut,
    isLoading,
    user,
    error,
    clearError,
    isInitialized,
    refreshAuth,
    showWelcome,
    setShowWelcome
  }), [signIn, signOut, isLoading, user, error, clearError, isInitialized, refreshAuth, showWelcome]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}