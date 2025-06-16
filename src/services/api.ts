import axios, { AxiosInstance, AxiosHeaders, AxiosError } from 'axios';
import { API_CONFIG, ERROR_MESSAGES, ENV } from '@/config/app'; 

// ===== ✅ USANDO O CHAVEIRO ÚNICO =====
import TokenManager from '@/utils/tokenManager';

// ===== ✅ FUNÇÕES SIMPLIFICADAS (agora usam o gerenciador único) =====
export const getToken = (): string | null => TokenManager.get();
export const clearTokens = (): void => TokenManager.remove();
export const isTokenValid = (token: string): boolean => TokenManager.isValid(token);
export const isAuthenticated = (): boolean => {
  const token = getToken();
  return token !== null && isTokenValid(token);
};

// ===== FUNÇÕES DE AUTENTICAÇÃO =====
export function logout(): void {
  clearTokens();
  if (!ENV.isServer) {
    window.location.href = '/login';
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  if (token && isTokenValid(token)) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

// ===== TRATAMENTO DE ERROS =====
function getErrorMessage(error: AxiosError): string {
  if (error.response) {
    const { status, data } = error.response;
    // ✅ CORRIGIDO: Tipagem específica em vez de any
    const serverMessage = (data as { message?: string; error?: string })?.message || 
                         (data as { message?: string; error?: string })?.error;
    
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

// ===== ✅ API CLIENT COM GERENCIADOR ÚNICO =====
export function getAPIClient(): AxiosInstance {
  const api = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    headers: API_CONFIG.headers,
  });

  // ✅ REQUEST INTERCEPTOR SIMPLIFICADO
  api.interceptors.request.use(
    (config) => {
      const currentToken = getToken(); // ✅ Usando função unificada

      if (currentToken && isTokenValid(currentToken)) { // ✅ Usando função unificada
        if (!config.headers) {
          config.headers = new AxiosHeaders();
        }
        config.headers.set('Authorization', `Bearer ${currentToken}`);
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // ✅ RESPONSE INTERCEPTOR SIMPLIFICADO
  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const status = error.response?.status;

      // ✅ SÓ REDIRECIONA EM CASOS ESPECÍFICOS
      if (status === 401 && !ENV.isServer) {
        const currentPath = window.location.pathname;
        
        // ✅ EVITA LOOP: Só redireciona se NÃO estiver na página de login
        if (!currentPath.includes('/login')) {
          clearTokens(); // ✅ Usando função unificada
          window.location.href = '/login';
        }
      }

      return Promise.reject(error);
    }
  );

  return api;
}

// ===== EXPORT DA INSTÂNCIA =====
export const api = getAPIClient();

// ===== TRATAMENTO DE ERROS DA API =====
export function handleApiError(
  error: AxiosError | Error | unknown, 
  // ✅ REMOVIDO: context não usado, parâmetro opcional removido
): { message: string; status?: number } {
  if (axios.isAxiosError(error)) {
    const message = getErrorMessage(error);
    const status = error.response?.status;
    return status !== undefined ? { message, status } : { message };
  }
  
  const message = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN;
  return { message };
}

// ===== VERIFICAÇÃO DE SAÚDE DA API =====
export function checkAPIHealth(): Promise<boolean> {
  return api.get('/health')
    .then(() => true)
    .catch(() => false);
}