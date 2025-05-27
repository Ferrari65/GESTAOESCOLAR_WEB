'use client';

import { createContext, useState, ReactNode } from 'react';
import { setCookie } from 'nookies';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

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
 * Trata diferentes tipos de erro da requisição
 */
function handleRequestError(error: unknown, response?: Response): AuthError {
  // Erro de rede ou conexão
  if (!response) {
    const err = error as Error;
    if (err.name === 'TypeError' || err.message.includes('fetch')) {
      return createError('network', 'Erro de conexão. Verifique sua internet.');
    }
    if (err.message.includes('Timeout')) {
      return createError('network', 'Conexão muito lenta. Tente novamente.');
    }
    return createError('unknown', 'Erro inesperado. Tente novamente.');
  }

  // Erro baseado no status da resposta
  const statusCode = response.status;
  const message = getErrorMessage(statusCode);
  
  // Categorizar tipos de erro mais especificamente
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
 * Faz requisição HTTP com timeout personalizado
 */
async function makeRequest(endpoint: string, credentials: LoginCredentials): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AUTH_CONFIG.requestTimeout);

  try {
    const response = await fetch(`${AUTH_CONFIG.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        email: credentials.email, 
        senha: credentials.password 
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if ((error as Error).name === 'AbortError') {
      throw new Error('Timeout: A requisição demorou muito para responder');
    }
    
    throw error;
  }
}

/**
 * Extrai informações do token JWT
 */
function decodeUserToken(token: string): User {
  try {
    // Definir interface para o payload do token
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

  /**
   * Remove erro atual
   */
  function clearError(): void {
    setError(null);
  }

  /**
   * Tenta login em múltiplos endpoints
   */
  async function attemptLogin(credentials: LoginCredentials): Promise<Response> {
    let lastError: AuthError | null = null;

    for (const endpoint of LOGIN_ENDPOINTS) {
      try {
        const response = await makeRequest(endpoint, credentials);
        
        if (response.ok) {
          return response;
        }
        
        // Se é erro de credenciais (401, 400, 404), não tenta outros endpoints
        if (response.status === 401 || response.status === 400 || response.status === 404) {
          throw handleRequestError(null, response);
        }
        
        lastError = handleRequestError(null, response);
      } catch (requestError) {
        // Se é erro de credenciais, propaga imediatamente
        if ((requestError as AuthError).type === 'unauthorized') {
          throw requestError;
        }
        
        lastError = handleRequestError(requestError);
        continue;
      }
    }

    // Se chegou aqui, todos os endpoints falharam por motivos técnicos
    throw lastError || createError('server', 'Nenhum servidor disponível no momento.');
  }

  /**
   * Processa resposta do login bem-sucedido
   */
  async function processLoginResponse(response: Response): Promise<User> {
    const data = await response.json();
    
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
      const userData = await processLoginResponse(response);
      
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
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}