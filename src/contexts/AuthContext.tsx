'use client';

import { createContext, useState, ReactNode, useEffect } from 'react';
import { setCookie, parseCookies } from 'nookies';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import axios, { AxiosError, AxiosResponse } from 'axios';

interface User {
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
}

// Configurações 
const AUTH_CONFIG = {
  baseURL: 'http://localhost:8080',
  requestTimeout: 10000,
  cookieName: 'nextauth.token',
  cookieMaxAge: 60 * 60 * 24, // 24 horas
};

const LOGIN_ENDPOINTS = [
  '/secretaria/auth/login',
  '/professor/auth/login', 
  '/aluno/login'
];

const DASHBOARD_ROUTES = {
  ROLE_SECRETARIA: '/secretaria/home',
  ROLE_PROFESSOR: '/professor/home',
  ROLE_ALUNO: '/aluno/home',
} as const;

// ✅ Configurar Axios
const api = axios.create({
  baseURL: AUTH_CONFIG.baseURL,
  timeout: AUTH_CONFIG.requestTimeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

/**
 * Mapeia status HTTP para mensagens de erro 
 */
function getErrorMessage(status: number): string {
  const errorMessages: Record<number, string> = {
    400: 'Dados inválidos. Verifique email e senha.',
    401: 'Email ou senha incorretos.',
    403: 'Acesso negado. Sua conta pode estar bloqueada.',
    404: 'Usuário não encontrado.',
    422: 'Email ou senha em formato inválido.',
    429: 'Muitas tentativas. Aguarde alguns minutos.',
    500: 'Erro interno do servidor. Tente novamente em alguns minutos.',
    502: 'Servidor indisponível. Tente novamente.',
    503: 'Serviço temporariamente indisponível.',
  };

  return errorMessages[status] || `Erro inesperado (${status}). Tente novamente.`;
}

/**
 * Cria objeto de erro padronizado
 */
function createError(type: AuthError['type'], message: string, statusCode?: number): AuthError {
  return { type, message, statusCode };
}

/**
 * Trata diferentes tipos de erro do Axios
 */
function handleAxiosError(error: AxiosError): AuthError {
  // Erro de rede ou conexão
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return createError('network', 'Conexão muito lenta. Tente novamente.');
    }
    if (error.code === 'ERR_NETWORK') {
      return createError('network', 'Erro de conexão. Verifique sua internet.');
    }
    return createError('unknown', 'Erro inesperado. Tente novamente.');
  }

  // Erro baseado no status da resposta
  const statusCode = error.response.status;
  const message = getErrorMessage(statusCode);
  
  // Categorizar tipos de erro
  if (statusCode === 400 || statusCode === 401 || statusCode === 404 || statusCode === 422) {
    return createError('unauthorized', message, statusCode);
  }
  
  if (statusCode === 403) {
    return createError('unauthorized', message, statusCode);
  }
  
  if (statusCode >= 500) {
    return createError('server', message, statusCode);
  }
  
  return createError('unknown', message, statusCode);
}

/**
 * Extrai informações do token JWT
 */
function decodeUserToken(token: string): User {
  try {
    interface TokenPayload {
      role?: string;
      email?: string;
      sub?: string;
      exp?: number;
      iat?: number;
    }
    
    const payload = jwtDecode<TokenPayload>(token);
    
    if (!payload.role) {
      throw new Error('Role não encontrada no token');
    }
    
    // Verificar se token não expirou
    if (payload.exp && payload.exp < Date.now() / 1000) {
      throw new Error('Token expirado');
    }
    
    return {
      email: payload.email || payload.sub || '',
      role: payload.role
    };
  } catch {
    throw new Error('Token inválido ou corrompido');
  }
}

/**
 * Salva token de autenticação no cookie
 */
function saveToken(token: string): void {
  setCookie(null, AUTH_CONFIG.cookieName, token, {
    maxAge: AUTH_CONFIG.cookieMaxAge,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
}

/**
 * Remove token de autenticação
 */
function removeToken(): void {
  setCookie(null, AUTH_CONFIG.cookieName, '', { 
    maxAge: -1, 
    path: '/' 
  });
}

/**
 * Determina rota de redirecionamento baseada na role do usuário
 */
function getRedirectPath(role: string): string {
  return DASHBOARD_ROUTES[role as keyof typeof DASHBOARD_ROUTES] || '/login';
}

// Contexto de autenticação
export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Provider do contexto
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // ✅ Inicializar estado do usuário ao carregar a página
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const cookies = parseCookies();
        const token = cookies[AUTH_CONFIG.cookieName];
        
        if (token) {
          const userData = decodeUserToken(token);
          setUser(userData);
        }
      } catch (error) {
        console.warn('Token inválido encontrado, removendo:', error);
        removeToken();
        setUser(null);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Remove erro atual
   */
  function clearError(): void {
    setError(null);
  }

  /**
   * Tenta login em múltiplos endpoints com Axios
   */
  async function attemptLogin(credentials: LoginCredentials): Promise<AxiosResponse> {
    let lastError: AuthError | null = null;

    for (const endpoint of LOGIN_ENDPOINTS) {
      try {
        const response = await api.post(endpoint, {
          email: credentials.email,
          senha: credentials.password
        });
        
        return response; // Sucesso!
        
      } catch (error) {
        const axiosError = error as AxiosError;
        const authError = handleAxiosError(axiosError);
        
        // Se é erro de credenciais, não tenta outros endpoints
        if (axiosError.response?.status === 401 || 
            axiosError.response?.status === 400 || 
            axiosError.response?.status === 404) {
          throw authError;
        }
        
        lastError = authError;
        continue;
      }
    }

    // Se chegou aqui, todos os endpoints falharam
    throw lastError || createError('server', 'Nenhum servidor disponível no momento.');
  }

  /**
   * Processa resposta do login bem-sucedido
   */
  function processLoginResponse(response: AxiosResponse): User {
    const data = response.data;
    
    if (!data.token) {
      throw createError('server', 'Token não retornado pelo servidor');
    }

    const userData = decodeUserToken(data.token);
    saveToken(data.token);
    
    return userData;
  }

  /**
   * Realiza login do usuário
   */
  async function signIn(credentials: LoginCredentials): Promise<void> {
    setIsLoading(true);
    setError(null);

    try {
      const response = await attemptLogin(credentials);
      const userData = processLoginResponse(response);
      
      setUser(userData);
      
      const redirectPath = getRedirectPath(userData.role);
      router.push(redirectPath);
      
    } catch (authError) {
      const errorToSet = authError as AuthError;
      setError(errorToSet);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Realiza logout do usuário
   */
  function signOut(): void {
    setUser(null);
    setError(null);
    removeToken();
    router.push('/login');
  }

  const contextValue: AuthContextData = {
    signIn,
    signOut,
    isLoading,
    user,
    error,
    clearError,
    isInitialized
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}