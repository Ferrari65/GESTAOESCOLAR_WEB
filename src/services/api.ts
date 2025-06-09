// src/services/api.ts - VERSÃO FINAL CORRIGIDA

import axios, { AxiosInstance, AxiosHeaders, AxiosError } from 'axios';

// ===== CONFIGURAÇÕES DIRETAS (sem import problemático) =====
const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
} as const;

const AUTH_CONFIG = {
  tokenCookieName: 'nextauth.token',
  tokenLocalStorageKey: 'nextauth.token',
  secretariaIdKey: 'secretaria_id'
} as const;

const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Email ou senha incorretos.',
  UNAUTHORIZED: 'Sem permissão para acessar esta área.',
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  SERVER_ERROR: 'Erro no servidor. Tente novamente.',
  UNKNOWN: 'Erro desconhecido. Contate o suporte.'
} as const;

const ENV = {
  isServer: typeof window === 'undefined'
} as const;

// ===== TOKEN MANAGER =====
function getToken(): string | null {
  if (ENV.isServer) return null;
  
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
  } catch {
    return null;
  }
}

function clearTokens(): void {
  if (ENV.isServer) return;
  
  try {
    document.cookie = `${AUTH_CONFIG.tokenCookieName}=; path=/; max-age=0`;
    localStorage.removeItem(AUTH_CONFIG.tokenLocalStorageKey);
    localStorage.removeItem(AUTH_CONFIG.secretariaIdKey);
  } catch (error) {
    console.error('Erro ao limpar tokens:', error);
  }
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= now;
  } catch {
    return true;
  }
}

// ===== ERROR HANDLER =====
function getErrorMessage(error: AxiosError): string {
  if (error.response) {
    const { status, data } = error.response;
    const serverMessage = (data as any)?.message || (data as any)?.error;
    
    switch (status) {
      case 400:
        return serverMessage || 'Dados inválidos fornecidos.';
      case 401:
        return ERROR_MESSAGES.INVALID_CREDENTIALS;
      case 403:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 404:
        return 'Recurso não encontrado no servidor.';
      case 422:
        return serverMessage || 'Dados inconsistentes ou já existem.';
      case 429:
        return 'Muitas tentativas. Aguarde alguns minutos.';
      case 500:
        return ERROR_MESSAGES.SERVER_ERROR;
      case 502:
      case 503:
      case 504:
        return 'Serviço temporariamente indisponível.';
      default:
        return serverMessage || `Erro ${status}: ${error.response.statusText}`;
    }
  }
  
  if (error.request) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  return error.message || ERROR_MESSAGES.UNKNOWN;
}

// ===== AXIOS INSTANCE =====
export function getAPIClient(): AxiosInstance {
  const api = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    headers: API_CONFIG.headers,
  });

  // ===== REQUEST INTERCEPTOR =====
  api.interceptors.request.use(
    (config) => {
      const currentToken = getToken();

      if (currentToken && !isTokenExpired(currentToken)) {
        if (!config.headers) {
          config.headers = new AxiosHeaders();
        }
        config.headers.set('Authorization', `Bearer ${currentToken}`);
      } else if (currentToken && isTokenExpired(currentToken)) {
        clearTokens();
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // ===== RESPONSE INTERCEPTOR =====
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error: AxiosError) => {
      const status = error.response?.status;

      switch (status) {
        case 401:
          clearTokens();
          
          if (!ENV.isServer && !window.location.pathname.includes('/login')) {
            const currentPath = window.location.pathname + window.location.search;
            const redirectParam = encodeURIComponent(currentPath);
            window.location.href = `/login?redirect=${redirectParam}`;
          }
          break;
      }

      return Promise.reject(error);
    }
  );

  return api;
}

// ===== SINGLETON INSTANCE =====
export const api = getAPIClient();

// ===== UTILITY FUNCTIONS =====
export function isAuthenticated(): boolean {
  const token = getToken();
  return token !== null && !isTokenExpired(token);
}

export function logout(): void {
  clearTokens();
  if (!ENV.isServer) {
    window.location.href = '/login';
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  if (token && !isTokenExpired(token)) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

// ===== ERROR HANDLER PRINCIPAL =====
export function handleApiError(
  error: AxiosError | Error | unknown, 
  context?: string
): { message: string; status?: number } {
  if (axios.isAxiosError(error)) {
    const message = getErrorMessage(error);
    const status = error.response?.status;
    
    return { message, status };
  }
  
  const message = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN;
  
  return { message };
}

// ===== FUNÇÕES DE VERIFICAÇÃO =====
export function checkAPIHealth(): Promise<boolean> {
  return api.get('/health')
    .then(() => true)
    .catch(() => false);
}