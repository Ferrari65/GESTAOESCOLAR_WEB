'use client';

import { createContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import axios, { AxiosError } from 'axios';

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
}

interface ApiErrorResponse {
  message?: string;
}

// ===== CONFIGURAÇÕES =====
const AUTH_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  requestTimeout: 10000,
  tokenCookieName: 'nextauth.token',
  secretariaIdKey: 'secretaria_id',
  maxAge: 604800,
} as const;

const LOGIN_ENDPOINTS = [
  '/secretaria/auth/login',
  '/professor/auth/login'
] as const;

const DASHBOARD_ROUTES = {
  ROLE_SECRETARIA: '/secretaria/alunos',
  ROLE_PROFESSOR: '/professor/atividades'
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

// ===== TOKEN MANAGER =====
const TokenManager = {
  save: (token: string, secretariaId?: string) => {
    if (typeof document === 'undefined') return;
    try {
      const expires = new Date(Date.now() + AUTH_CONFIG.maxAge * 1000).toUTCString();
      const isSecure = window.location.protocol === 'https:';
      document.cookie = `${AUTH_CONFIG.tokenCookieName}=${token}; path=/; expires=${expires}; SameSite=Lax${isSecure ? '; Secure' : ''}`;
      if (secretariaId) {
        localStorage.setItem(AUTH_CONFIG.secretariaIdKey, secretariaId);
      }
    } catch {}
  },

  get: (): string | null => {
    if (typeof document === 'undefined') return null;
    try {
      const match = document.cookie.match(new RegExp(`${AUTH_CONFIG.tokenCookieName}=([^;]+)`));
      return match?.[1] || null;
    } catch {
      return null;
    }
  },

  remove: () => {
    if (typeof document === 'undefined') return;
    try {
      document.cookie = `${AUTH_CONFIG.tokenCookieName}=; path=/; max-age=0`;
      localStorage.removeItem(AUTH_CONFIG.secretariaIdKey);
    } catch {}
  },

  getSecretariaId: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_CONFIG.secretariaIdKey);
  },

  isValid: (token: string): boolean => {
    try {
      const payload = jwtDecode<JWTPayload>(token);
      return payload.exp > Date.now() / 1000 && Boolean(payload.role);
    } catch {
      return false;
    }
  }
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

  const clearError = () => setError(null);

  const getRedirectPath = (role: string) =>
    DASHBOARD_ROUTES[role as keyof typeof DASHBOARD_ROUTES] || '/login';

  const processToken = (token: string, secretariaId?: string): User | null => {
    try {
      if (!TokenManager.isValid(token)) return null;
      const payload = jwtDecode<JWTPayload>(token);
      const id = payload.role === 'ROLE_SECRETARIA'
        ? secretariaId || TokenManager.getSecretariaId() || payload.sub || ''
        : payload.sub || '';
      return { id, email: payload.email || payload.sub || '', role: payload.role };
    } catch {
      return null;
    }
  };

  const refreshAuth = async () => {
    const token = TokenManager.get();
    if (token && TokenManager.isValid(token)) {
      const userData = processToken(token);
      if (userData) {
        setUser(userData);
        return;
      }
    }
    TokenManager.remove();
    setUser(null);
  };

  const attemptLogin = async (credentials: LoginCredentials) => {
  for (const endpoint of LOGIN_ENDPOINTS) {
    try {
      const { data } = await api.post<LoginResponse>(endpoint, {
        email: credentials.email,
        senha: credentials.password,
      });
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const serverMsg = error.response?.data?.message;

        if (status === 404) {
          throw { type: 'validation', message: 'Usuário não cadastrado.', statusCode: status };
        }
        if (status === 401) {
          throw { type: 'unauthorized', message: 'Senha incorreta.', statusCode: status };
        }
        if (status === 400) {
          throw { type: 'validation', message: serverMsg || 'Dados inválidos.', statusCode: status };
        }
        if (status === 500) {
          throw { type: 'server', message: 'Erro interno do servidor.', statusCode: status };
        }
      }
    }
  }
  throw { type: 'server', message: 'Falha ao autenticar. Tente novamente.' };
};

const signIn = async (credentials: LoginCredentials) => {
  setIsLoading(true);
  setError(null);
  try {
    TokenManager.remove();
    const { token, id } = await attemptLogin(credentials);
    if (!token || !id) throw { type: 'server', message: 'Resposta inválida do servidor' };

    TokenManager.save(token, id);
    const userData = processToken(token, id);
    if (!userData) throw { type: 'server', message: 'Token inválido recebido' };

    setUser(userData);
    setShowWelcome(true);
    setTimeout(() => {
      setShowWelcome(false);
      router.push(getRedirectPath(userData.role));
    }, 2000);

  } catch (error: any) {
    setError(error);
    TokenManager.remove();
    setUser(null);
  } finally {
    setIsLoading(false);
  }
};


  const signOut = () => {
    TokenManager.remove();
    setUser(null);
    setError(null);
    setShowWelcome(false);
    router.push('/login');
  };

  useEffect(() => {
    const initialize = () => {
      const token = TokenManager.get();
      if (token && TokenManager.isValid(token)) {
        const userData = processToken(token);
        if (userData) {
          setUser(userData);
        } else {
          TokenManager.remove();
        }
      } else {
        TokenManager.remove();
      }
      setIsInitialized(true);
    };
    initialize();
  }, []);

  const contextValue = useMemo(() => ({
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
  }), [signIn, signOut, isLoading, user, error, isInitialized, showWelcome]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
