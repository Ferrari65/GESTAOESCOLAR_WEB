import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { parseCookies } from 'nookies';
import type { GetServerSidePropsContext } from 'next';

interface APIClientConfig {
  baseURL?: string;
  timeout?: number;
  enableLogging?: boolean;
}

interface APIError {
  message: string;
  status?: number;
  code?: string;
}

// Configurações padrão
const DEFAULT_CONFIG: Required<APIClientConfig> = {
  baseURL: 'http://localhost:8080', 
  timeout: 10000,
  enableLogging: process.env.NODE_ENV === 'development',
};

const TOKEN_CONFIG = {
  cookieName: 'nextauth.token',
  headerPrefix: 'Bearer',
} as const;

/**
 * Formatando logs de requisições 
 */
function logRequest(config: AxiosRequestConfig): void {
  if (!DEFAULT_CONFIG.enableLogging) return;
  
  const method = config.method?.toUpperCase() || 'GET';
  const url = config.url || '';
  const baseURL = config.baseURL || '';
  
  console.log(`[API] ${method} ${baseURL}${url}`);
}

/**
 * Formatando logs de erro
 */
function logError(error: AxiosError): void {
  if (!DEFAULT_CONFIG.enableLogging) return;
  
  const status = error.response?.status;
  const responseData = error.response?.data as Record<string, unknown>;
  const message = String(responseData?.message) || error.message;
  const url = error.config?.url;
  
  console.error(`[API] Erro ${status ? `(${status})` : ''} em ${url}:`, message);
}

/**
 * Extrai e formata token do cookie
 */
function getAuthToken(ctx?: GetServerSidePropsContext): string | null {
  try {
    const cookies = parseCookies(ctx);
    return cookies[TOKEN_CONFIG.cookieName] || null;
  } catch (error) {
    console.warn('[API] Erro ao ler cookies:', error);
    return null;
  }
}

function setupRequestInterceptor(instance: AxiosInstance): void {
  instance.interceptors.request.use(
    (config) => {
      logRequest(config);
      const token = getAuthToken();
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `${TOKEN_CONFIG.headerPrefix} ${token}`;
      }
      
      return config;
    },
    (error: AxiosError) => {
      logError(error);
      return Promise.reject(error);
    }
  );
}

/**
 * Configura interceptors de resposta
 */
function setupResponseInterceptor(instance: AxiosInstance): void {
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      if (DEFAULT_CONFIG.enableLogging) {
        console.log(`[API] ${response.status} ${response.config.url}`);
      }
      return response;
    },
    (error: AxiosError) => {
      logError(error);
      
      // Tratamento específico de erros
      if (error.response?.status === 401) {
        // Token expirado ou inválido
        if (typeof window !== 'undefined') {
          console.warn('[API] Token inválido, redirecionando para login...');
          window.location.href = '/login';
        }
      }
      
      return Promise.reject(error);
    }
  );
}

/**
 * Cria instância configurada do Axios
 */
export function createAPIClient(
  ctx?: GetServerSidePropsContext,
  config: APIClientConfig = {}
): AxiosInstance {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Criar instância do axios
  const instance = axios.create({
    baseURL: finalConfig.baseURL,
    timeout: finalConfig.timeout,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });
  
  // Configurar interceptors
  setupRequestInterceptor(instance);
  setupResponseInterceptor(instance);
  
  // Adicionar token inicial se existir
  const token = getAuthToken(ctx);
  if (token) {
    instance.defaults.headers.Authorization = `${TOKEN_CONFIG.headerPrefix} ${token}`;
  }
  
  return instance;
}

/**
 * Instância padrão para uso geral (client-side)
 */
export const api = createAPIClient();

/**
 * Factory function para compatibilidade com código legado
 */
export function getAPIClient(ctx?: GetServerSidePropsContext): AxiosInstance {
  return createAPIClient(ctx);
}

/**
 * Utility para tratar erros de API de forma consistente
 */
export function handleAPIError(error: unknown): APIError {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as Record<string, unknown>;
    return {
      message: String(responseData?.message) || error.message,
      status: error.response?.status,
      code: error.code,
    };
  }
  
  return {
    message: error instanceof Error ? error.message : 'Erro desconhecido',
  };
}

/**
 * Types para exportar e usar em outros lugares
 */
export type { APIClientConfig, APIError };
export type APIInstance = AxiosInstance;