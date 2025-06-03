import axios, { AxiosInstance, AxiosHeaders } from 'axios';
import { 
  API_CONFIG, 
  AUTH_CONFIG, 
  ERROR_MESSAGES,
  ENV,
  devLog
} from '@/config/app';

function getToken(): string | null {
  if (ENV.isServer) return null;
  
  try {
    const match = document.cookie.match(new RegExp(`${AUTH_CONFIG.tokenCookieName}=([^;]+)`));
    if (match) return match[1];
    
    return localStorage.getItem(AUTH_CONFIG.tokenLocalStorageKey);
  } catch {
    return null;
  }
}

function clearTokens(): void {
  if (ENV.isServer) return;
  
  try {
    // Remove cookie
    document.cookie = `${AUTH_CONFIG.tokenCookieName}=; path=/; max-age=0`;
    
    // Remove localStorage  
    localStorage.removeItem(AUTH_CONFIG.tokenLocalStorageKey);
    localStorage.removeItem(AUTH_CONFIG.secretariaIdKey);
 
  } catch (error) {
    console.error(' Erro crítico ao limpar tokens:', error);
  }
}

function getErrorMessage(error: any): string {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data?.message || 'Dados inválidos fornecidos.';
      case 401:
        return ERROR_MESSAGES.INVALID_CREDENTIALS;
      case 403:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 404:
        return 'Recurso não encontrado.';
      case 422:
        return data?.message || 'Dados inconsistentes.';
      case 429:
        return 'Muitas tentativas. Aguarde alguns minutos.';
      case 500:
        return ERROR_MESSAGES.SERVER_ERROR;
      case 502:
      case 503:
      case 504:
        return 'Serviço temporariamente indisponível.';
      default:
        return data?.message || ERROR_MESSAGES.UNKNOWN;
    }
  }
  
  if (error.request) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  return error.message || ERROR_MESSAGES.UNKNOWN;
}

/**
 *  AXIOS CONFIG
 */
export function getAPIClient(): AxiosInstance {
  const api = axios.create(API_CONFIG);

  // ========================
  // REQUEST INTERCEPTOR
  // ========================
  api.interceptors.request.use(
    (config) => {
      const currentToken = getToken();

      if (currentToken) {
        if (!config.headers) {
          config.headers = new AxiosHeaders();
        }
        config.headers.set('Authorization', `Bearer ${currentToken}`);
      }

      return config;
    },
    (error) => {

      console.error(' Request Error:', error);
      return Promise.reject(error);
    }
  );

  // ========================
  // RESPONSE INTERCEPTOR
  // ========================
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      const status = error.response?.status;

      if (status && status >= 500) {
        console.error(' API Error:', {
          status,
          url: error.config?.url,
          message: error.response?.data?.message || error.message
        });
      }

      switch (status) {
        case 401:
          clearTokens();
          if (!ENV.isServer && !window.location.pathname.includes('/login')) {
            const redirect = encodeURIComponent(window.location.pathname + window.location.search);
            window.location.href = `/login?redirect=${redirect}`;
          }
          break;
          
        case 403:

          break;
          
        case 500:
        case 502:
        case 503:
      
          break;
      }

      return Promise.reject(error);
    }
  );

  return api;
}

// ========================
// EXPORTS
// ========================
export const api = getAPIClient();

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

export function logout(): void {
  clearTokens();
  if (!ENV.isServer) {
    window.location.href = '/login';
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function handleApiError(error: any, context?: string): { message: string; status?: number } {
  const message = getErrorMessage(error);
  const status = error.response?.status;
  
  if (status && status >= 500) {
    console.error(` ${context || 'API'} Error:`, { status, message });
  }
  
  return { message, status };
}

export { getErrorMessage };