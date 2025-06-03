'use client';

import { createContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import axios, { AxiosError, AxiosResponse } from 'axios';

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
}

const AUTH_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  requestTimeout: 10000,
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

const api = axios.create({
  baseURL: AUTH_CONFIG.baseURL,
  timeout: AUTH_CONFIG.requestTimeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

function devLog(message: string, data?: any): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, data || '');
  }
}


function saveToken(token: string): void {
  if (typeof window === 'undefined') return;
  
  // Salvar no cookie
  document.cookie = `nextauth.token=${token}; path=/; max-age=604800; SameSite=Lax`;
  
  // Salvar no localStorage como {backup}
  localStorage.setItem('nextauth.token', token);
  
  devLog(' Token salvo:', `${token.substring(0, 30)}...`);
}

/**
 * Salvar ID da secretaria
 */
function saveSecretariaId(id: string): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('secretaria_id', id);
  devLog(' ID da secretaria salvo:', id);
}

/**
 * Obter token 
 */
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  //logica:
  // Tentar buscar token primeiro pelo cookie caso nao escontre, executa
  const match = document.cookie.match(/nextauth\.token=([^;]+)/);
  if (match) return match[1];
  
  // Fallback para localStorage
  return localStorage.getItem('nextauth.token');
}


function getSecretariaId(): string | null {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem('secretaria_id');
}

function removeToken(): void {
  if (typeof window === 'undefined') return;
  
  document.cookie = 'nextauth.token=; path=/; max-age=0';
  
  localStorage.removeItem('nextauth.token');
  localStorage.removeItem('secretaria_id');
  
  devLog(' Token e dados removidos');
}

function createError(type: AuthError['type'], message: string, statusCode?: number): AuthError {
  return { type, message, statusCode };
}

function handleAxiosError(error: AxiosError): AuthError {
  if (error.response) {
    const status = error.response.status;
    const message = status === 401 ? 'Email ou senha incorretos.' : 'Erro no servidor.';
    return createError('unauthorized', message);
  }
  
  if (error.request) {
    return createError('network', 'Erro de conexão. Verifique sua internet.');
  }
  
  return createError('unknown', error.message);
}

function getRedirectPath(role: string): string {
  return DASHBOARD_ROUTES[role as keyof typeof DASHBOARD_ROUTES] || '/login';
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        devLog(' Inicializando autenticação...');
        
        const token = getToken();
        
        devLog(' Token encontrado:', !!token);
        
        if (token) {
          const tokenPayload = jwtDecode<{
            sub?: string;
            email?: string;
            role: string;
            exp: number;
          }>(token);

          if (tokenPayload.role && tokenPayload.exp > Date.now() / 1000) {
            // Obtendo ID por Role
            let userId = '';
            
            if (tokenPayload.role === 'ROLE_SECRETARIA') {

              // Para secretaria, usar o ID salvo no localStorage
              userId = getSecretariaId() || tokenPayload.sub || '';
              devLog('👥 Secretaria - ID obtido:', {
                fromLocalStorage: getSecretariaId(),
                fromToken: tokenPayload.sub,
                final: userId
              });
            } else {
              // Para outros roles, usar o sub do token
              userId = tokenPayload.sub || '';
              devLog(' Outro role - ID do token:', userId);
            }

            devLog(' Usuário autenticado:', {
              role: tokenPayload.role,
              email: tokenPayload.email,
              id: userId
            });

            setUser({
              email: tokenPayload.email || tokenPayload.sub || '',
              role: tokenPayload.role,
              id: userId
            });
          } else {
            devLog(' Token expirado ou inválido');
            removeToken();
          }
        } else {
          devLog('ℹ Nenhum token encontrado');
        }
      } catch (error) {
        devLog(' Erro na inicialização:', error);
        removeToken();
        setUser(null);
      } finally {
        setIsInitialized(true);
        devLog(' Inicialização completa');
      }
    };

    initializeAuth();
  }, []);

  function clearError(): void {
    setError(null);
  }

  async function attemptLogin(credentials: LoginCredentials): Promise<AxiosResponse> {
    for (const endpoint of LOGIN_ENDPOINTS) {
      try {
        const response = await api.post(endpoint, {
          email: credentials.email,
          senha: credentials.password
        });
        return response;
      } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 401 || axiosError.response?.status === 400) {
          throw handleAxiosError(axiosError);
        }
        continue;
      }
    }
    throw createError('server', 'Nenhum servidor disponível.');
  }

  function processLoginResponse(response: AxiosResponse): User {
    const data = response.data as LoginResponse;
    
    devLog(' Resposta do login:', {
      hasToken: !!data.token,
      hasId: !!data.id,
      id: data.id
    });
    
    if (!data.token || !data.id) {
      throw createError('server', 'Resposta inválida do servidor');
    }

    const tokenPayload = jwtDecode<{
      sub?: string;
      email?: string;
      role: string;
      exp: number;
    }>(data.token);

    if (!tokenPayload.role) {
      throw new Error('Role não encontrada no token');
    }

    saveToken(data.token);
    
  
    if (tokenPayload.role === 'ROLE_SECRETARIA') {
      saveSecretariaId(data.id);
    }

    devLog(' Login processado:', {
      role: tokenPayload.role,
      email: tokenPayload.email,
      id: data.id
    });
    
    return {
      email: tokenPayload.email || tokenPayload.sub || '',
      role: tokenPayload.role,
      id: data.id
    };
  }

  async function signIn(credentials: LoginCredentials): Promise<void> {
    setIsLoading(true);
    setError(null);

    try {
      removeToken();
      
      const response = await attemptLogin(credentials);
      const userData = processLoginResponse(response);
      
      setUser(userData);
      
      const redirectPath = getRedirectPath(userData.role);
      router.push(redirectPath);
      
    } catch (authError) {
      setError(authError as AuthError);
      removeToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

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