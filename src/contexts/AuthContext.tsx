'use client';

import { createContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import axios, { AxiosError, AxiosResponse } from 'axios';

// ===== INTERFACES =====
interface LoginResponse {
  id: string;
  token: string;
}

interface User {
  id: string;
  email: string;
  role: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthError {
  type: 'validation' | 'network' | 'unauthorized' | 'server' | 'unknown';
  message: string;
  statusCode?: number;
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

// ===== CONFIGURAÇÕES =====
const AUTH_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  requestTimeout: 10000,
  tokenCookieName: 'nextauth.token',
  tokenLocalStorageKey: 'nextauth.token',
  secretariaIdKey: 'secretaria_id',
  maxAge: 604800,
} as const;

const LOGIN_ENDPOINTS = [
  '/secretaria/auth/login',
  '/professor/auth/login'

] as const;

const DASHBOARD_ROUTES = {
  ROLE_SECRETARIA: '/secretaria/alunos', 
  ROLE_PROFESSOR: '/professor/home'
} as const;

// ===== AXIOS INSTANCE =====
const api = axios.create({
  baseURL: AUTH_CONFIG.baseURL,
  timeout: AUTH_CONFIG.requestTimeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
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

// ===== TOKEN  =====
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
      console.error('Erro ao salvar token:', getErrorMessage(error));
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
      console.error('Erro ao obter token:', getErrorMessage(error));
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
      console.error('Erro ao remover token:', getErrorMessage(error));
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

  // ===== FUNCTIONS =====
  const clearError = useCallback(() => setError(null), []);

  const getRedirectPath = useCallback((role: string): string => {
    return DASHBOARD_ROUTES[role as keyof typeof DASHBOARD_ROUTES] || '/login';
  }, []);

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

      return {
        email: payload.email || payload.sub || '',
        role: payload.role,
        id: userId
      };
    } catch (error) {
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
        const redirectPath = getRedirectPath(userData.role);
        router.push(redirectPath);
      }, 3000);
      
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
  }, [attemptLogin, processToken, getRedirectPath, router]);

  const signOut = useCallback((): void => {
    setUser(null);
    setError(null);
    setShowWelcome(false);
    TokenManager.remove();
    router.push('/login');
  }, [router]);


  useEffect(() => {
    const initializeAuth = async (): Promise<void> => {
      try {
        await refreshAuth();
      } catch (error) {
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