'use client';

import { createContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { log } from '@/utils/logger';
import { AUTH_CONFIG, API_CONFIG, getDashboardRoute } from '@/config/app';
import type { User, AuthError } from '@/types';

// ===== INTERFACES =====
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
      return localToken;
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

// ===== ENDPOINTS DE LOGIN =====
const LOGIN_ENDPOINTS = ['/secretaria/auth/login', '/professor/auth/login'] as const;

// ===== AXIOS INSTANCE =====
const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers
});

const createError = (type: AuthError['type'], message: string, statusCode?: number): AuthError => ({
  type, message, statusCode
});

const handleAxiosError = (error: AxiosError): AuthError => {
  if (error.response) {
    const status = error.response.status;
    const serverMessage = (error.response.data as any)?.message;
    
    switch (status) {
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
  const pathname = usePathname();
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
        userId = localStorage.getItem(AUTH_CONFIG.secretariaIdKey) || payload.sub || '';
      } else {
        userId = payload.sub || '';
      }

      return {
        email: payload.email || payload.sub || '',
        role: payload.role,
        id: userId
      };
    } catch (error) {
      log.error('AUTH', 'Erro ao processar token', error);
      return null;
    }
  }, []);

  // ✅ REFRESH SEM REDIRECIONAMENTO AUTOMÁTICO
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
        
        // ✅ SÓ REDIRECIONA SE ESTIVER EM ROTA PROTEGIDA
        if (pathname?.startsWith('/secretaria') || pathname?.startsWith('/professor') || pathname?.startsWith('/aluno')) {
          router.push('/login');
        }
        return;
      }

      const userData = processToken(token);
      if (userData) {
        setUser(userData);
        
        // ✅ SÓ REDIRECIONA DA PÁGINA DE LOGIN SE JÁ ESTIVER AUTENTICADO
        if (pathname === '/login') {
          const dashboardRoute = getDashboardRoute(userData.role);
          router.push(dashboardRoute);
        }
      } else {
        TokenManager.remove();
        setUser(null);
      }
    } catch (error) {
      log.error('AUTH', 'Erro na verificação de autenticação', error);
      TokenManager.remove();
      setUser(null);
    }
  }, [processToken, router, pathname]);

  const attemptLogin = useCallback(async (credentials: LoginCredentials): Promise<AxiosResponse<LoginResponse>> => {
    for (const endpoint of LOGIN_ENDPOINTS) {
      try {
        const response = await api.post<LoginResponse>(endpoint, {
          email: credentials.email,
          senha: credentials.password
        });
        
        return response;
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
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
      if (axios.isAxiosError(error)) {
        setError(handleAxiosError(error));
      } else if (error && typeof error === 'object' && 'type' in error) {
        setError(error as AuthError);
      } else {
        setError(createError('unknown', String(error)));
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

  // ✅ INICIALIZAÇÃO SEM REDIRECIONAMENTO FORÇADO
  useEffect(() => {
    const initializeAuth = async (): Promise<void> => {
      try {
        await refreshAuth();
      } catch (error) {
        log.warn('AUTH', 'Erro na inicialização da autenticação', error);
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