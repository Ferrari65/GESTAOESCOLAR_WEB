import axios, { AxiosInstance, AxiosHeaders, AxiosError } from 'axios';
import { 
  API_CONFIG, 
  AUTH_CONFIG, 
  ERROR_MESSAGES,
  ENV,
  getDashboardRoute
} from '@/config/app';

// ===== INTERFACES =====

interface ApiErrorResponse {
  message: string;
  status?: number;
  code?: string;
  isRetryable?: boolean;
}

interface TokenInfo {
  token: string | null;
  source: 'cookie' | 'localStorage' | null;
}

// ===== GERENCIAMENTO DE TOKEN MELHORADO =====

function getToken(): TokenInfo {
  if (ENV.isServer) return { token: null, source: null };
  
  try {
    // 1. Prioridade: Cookie (mais seguro)
    const cookieMatch = document.cookie.match(
      new RegExp(`${AUTH_CONFIG.tokenCookieName}=([^;]+)`)
    );
    if (cookieMatch?.[1]) {
      return { token: cookieMatch[1], source: 'cookie' };
    }
    
    // 2. Fallback: localStorage
    const localToken = localStorage.getItem(AUTH_CONFIG.tokenLocalStorageKey);
    if (localToken) {
      return { token: localToken, source: 'localStorage' };
    }
    
    return { token: null, source: null };
  } catch (error) {
    console.warn(' Erro ao obter token:', error);
    return { token: null, source: null };
  }
}

/**
 * Verifica se o token é válido (não expirado)
 */
function isTokenValid(token: string): boolean {
  try {
    // Decodifica o payload do JWT
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    // Verifica se não expirou
    return payload.exp && payload.exp > now;
  } catch {
    return false;
  }
}

/**
 * Obtém role do token JWT
 */
function getRoleFromToken(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload.role || payload.authorities?.[0] || payload.scope || null;
  } catch {
    return null;
  }
}

function clearTokens(): void {
  if (ENV.isServer) return;
  
  try {
    const paths = ['/', '/secretaria', '/professor', '/aluno'];
    paths.forEach(path => {
      document.cookie = `${AUTH_CONFIG.tokenCookieName}=; path=${path}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    });
    
    localStorage.removeItem(AUTH_CONFIG.tokenLocalStorageKey);
    localStorage.removeItem(AUTH_CONFIG.secretariaIdKey);

    sessionStorage.removeItem(AUTH_CONFIG.tokenLocalStorageKey);
    
  } catch (error) {
    console.error('Erro crítico ao limpar tokens:', error);
  }
}
function classifyError(error: AxiosError): ApiErrorResponse {
  const status = error.response?.status;
  const data = error.response?.data as any;

  if (error.request && !error.response) {
    return {
      message: ERROR_MESSAGES.NETWORK_ERROR,
      status: 0,
      code: 'NETWORK_ERROR',
      isRetryable: true
    };
  }
  
  if (status) {
    const baseResponse = {
      status,
      code: data?.code || `HTTP_${status}`,
      isRetryable: false
    };
    
    switch (status) {
      case 400:
        return {
          ...baseResponse,
          message: data?.message || 'Dados inválidos fornecidos.'
        };
        
      case 401:
        return {
          ...baseResponse,
          message: ERROR_MESSAGES.INVALID_CREDENTIALS,
          code: 'UNAUTHORIZED'
        };
        
      case 403:
        return {
          ...baseResponse,
          message: ERROR_MESSAGES.UNAUTHORIZED,
          code: 'FORBIDDEN'
        };
        
      case 404:
        return {
          ...baseResponse,
          message: data?.message || 'Recurso não encontrado.'
        };
        
      case 422:
        return {
          ...baseResponse,
          message: data?.message || 'Dados inconsistentes.'
        };
        
      case 429:
        return {
          ...baseResponse,
          message: 'Muitas tentativas. Aguarde alguns minutos.',
          isRetryable: true
        };
        
      case 500:
        return {
          ...baseResponse,
          message: ERROR_MESSAGES.SERVER_ERROR,
          code: 'INTERNAL_SERVER_ERROR',
          isRetryable: true
        };
        
      case 502:
      case 503:
      case 504:
        return {
          ...baseResponse,
          message: 'Serviço temporariamente indisponível.',
          code: 'SERVICE_UNAVAILABLE',
          isRetryable: true
        };
        
      default:
        return {
          ...baseResponse,
          message: data?.message || ERROR_MESSAGES.UNKNOWN,
          isRetryable: status >= 500
        };
    }
  }
  

  return {
    message: error.message || ERROR_MESSAGES.UNKNOWN,
    code: 'UNKNOWN_ERROR',
    isRetryable: false
  };
}

function performLogout(redirectToLogin = true): void {
  clearTokens();
  
  if (!ENV.isServer && redirectToLogin) {
    const currentPath = window.location.pathname + window.location.search;
    const shouldPreserveRedirect = !currentPath.includes('/login') && 
                                   currentPath !== '/' && 
                                   !currentPath.includes('/logout');
    
    if (shouldPreserveRedirect) {
      const redirect = encodeURIComponent(currentPath);
      window.location.href = `/login?redirect=${redirect}`;
    } else {
      window.location.href = '/login';
    }
  }
}

// ===== AXIOS CONFIGURADO =====

export function getAPIClient(): AxiosInstance {
  const api = axios.create({
    ...API_CONFIG,
    
    validateStatus: (status) => status < 500, 
  });

  // ========================
  // REQUEST INTERCEPTOR
  // ========================
  api.interceptors.request.use(
    (config) => {
      const { token } = getToken();

      if (token && isTokenValid(token)) {
        if (!config.headers) {
          config.headers = new AxiosHeaders();
        }
        config.headers.set('Authorization', `Bearer ${token}`);
      }

      if (ENV.isDevelopment) {
        config.headers.set('X-Request-ID', crypto.randomUUID());
        config.headers.set('X-Timestamp', Date.now().toString());
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

      if (ENV.isDevelopment) {
        console.log(`API Success: ${response.config.method?.toUpperCase()} ${response.config.url} (${response.status})`);
      }
      return response;
    },
    (error: AxiosError) => {
      const errorInfo = classifyError(error);
      const status = error.response?.status;

      if (errorInfo.isRetryable || status && status >= 500) {
        console.error(' API Error:', {
          status: errorInfo.status,
          code: errorInfo.code,
          url: error.config?.url,
          method: error.config?.method?.toUpperCase(),
          message: errorInfo.message,
          isRetryable: errorInfo.isRetryable
        });
      }


      switch (status) {
        case 401: {

          const { token } = getToken();
          if (!token || !isTokenValid(token)) {
            clearTokens();
            performLogout();
          }
          break;
        }
          
        case 403: {

          const { token } = getToken();
          if (token && isTokenValid(token)) {
            const role = getRoleFromToken(token);
            if (role && !ENV.isServer) {
              const dashboard = getDashboardRoute(role);
              if (window.location.pathname !== dashboard) {
                window.location.href = dashboard;
              }
            }
          }
          break;
        }
      }

      return Promise.reject(error);
    }
  );

  return api;
}

// ===== EXPORTS PÚBLICOS =====

export const api = getAPIClient();

export function isAuthenticated(): boolean {
  const { token } = getToken();
  return token !== null && isTokenValid(token);
}

export function logout(): void {
  performLogout(true);
}

export function getAuthHeaders(): Record<string, string> {
  const { token } = getToken();
  return token && isTokenValid(token) ? { Authorization: `Bearer ${token}` } : {};
}


export function getCurrentUser(): { role: string | null; isValid: boolean } | null {
  const { token } = getToken();
  if (!token) return null;
  
  const isValid = isTokenValid(token);
  const role = isValid ? getRoleFromToken(token) : null;
  
  return { role, isValid };
}


export function handleApiError(
  error: any, 
  context?: string
): ApiErrorResponse {
  const errorInfo = classifyError(error);

  if (errorInfo.isRetryable || (errorInfo.status && errorInfo.status >= 500)) {
    console.error(`❌ ${context || 'API'} Error:`, {
      context,
      ...errorInfo
    });
  }
  
  return errorInfo;
}


/**
 * @deprecated Use handleApiError instead
 */
export function getErrorMessage(error: any): string {
  return classifyError(error).message;
}