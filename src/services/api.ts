import axios, { AxiosInstance, AxiosHeaders, AxiosError } from 'axios';
import { 
  API_CONFIG, 
  AUTH_CONFIG, 
  ERROR_MESSAGES, 
  ENV 
} from '@/config/app'; 

// ===== TOKEN MANAGEMENT =====
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

export function getAPIClient(): AxiosInstance {
  const api = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    headers: API_CONFIG.headers,
  });

  // Request interceptor
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

export const api = getAPIClient();

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


export function checkAPIHealth(): Promise<boolean> {
  return api.get('/health')
    .then(() => true)
    .catch(() => false);
}