import axios, { AxiosHeaders, AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

//  configuração
const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  TIMEOUT: 10000,
  TOKEN_COOKIE_NAME: 'nextauth.token',
  TOKEN_STORAGE_KEY: 'nextauth.token',
  LOGIN_PATH: '/login'
} as const;

/**
 *  configuração personalizada  cliente API
 */
interface APIClientConfig {
  baseURL?: string;
  timeout?: number;
  enableAutoRedirect?: boolean;
}

const isClientSide = (): boolean => typeof window !== 'undefined';

/**
 * Extrai token de autenticação dos cookies do navegador
 * @param cookieName - Nome do cookie que contém o token
 * @returns Token extraído ou null se não encontrado
 */
function getTokenFromCookie(cookieName: string): string | null {
  if (!isClientSide()) return null;
  
  const cookieMatch = document.cookie.match(new RegExp(`${cookieName}=([^;]+)`));
  return cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
}

/**
 * Recupera token de autenticação do localStorage
 * @param storageKey - Chave do localStorage
 * @returns Token do localStorage ou null se não encontrado/erro
 */
function getTokenFromStorage(storageKey: string): string | null {
  if (!isClientSide()) return null;
  
  try {
    return localStorage.getItem(storageKey);
  } catch (error) {
    console.warn('Erro ao acessar localStorage:', error);
    return null;
  }
}

/**
 * obter token de autenticação
 * Prioriza cookies sobre localStorage para melhor segurança
 * @returns Token de autenticação válido ou null
 */
function getAuthToken(): string | null {
   
  const cookieToken = getTokenFromCookie(API_CONFIG.TOKEN_COOKIE_NAME);
  if (cookieToken) {
    return cookieToken;
  }
  
  const storageToken = getTokenFromStorage(API_CONFIG.TOKEN_STORAGE_KEY);
  if (storageToken) {
    return storageToken;
  }
  
  return null;
}

/**
 * Configura interceptador de requisições para injetar token de autenticação
 * @param apiInstance - Instância do axios
 */
function setupRequestInterceptor(apiInstance: AxiosInstance): void {
  apiInstance.interceptors.request.use(
    (config: AxiosRequestConfig) => {
      const currentToken = getAuthToken();
      
      if (currentToken) {
        if (!config.headers) {
          config.headers = new AxiosHeaders();
        }
        
        config.headers['Authorization'] = `Bearer ${currentToken}`;
      }
      
      return config;
    },
    (error) => {
      console.error('Erro no interceptador de requisição:', error);
      return Promise.reject(error);
    }
  );
}
function setupResponseInterceptor(
  apiInstance: AxiosInstance, 
  enableAutoRedirect: boolean = true
): void {
  apiInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      
      if (error.response?.status === 401) {
        console.warn('Token de autenticação inválido ou expirado');
        
        if (enableAutoRedirect && isClientSide()) {
          
          try {
            localStorage.removeItem(API_CONFIG.TOKEN_STORAGE_KEY);
          } catch (e) {
            console.warn('Erro ao limpar localStorage:', e);
          }
          
          window.location.href = API_CONFIG.LOGIN_PATH;
        }
      }
      
      if (error.response) {
        console.error(`Erro API ${error.response.status}:`, error.response.data);
      } else if (error.request) {
        console.error('Erro de rede - sem resposta do servidor:', error.request);
      } else {
        console.error('Erro na configuração da requisição:', error.message);
      }
      
      return Promise.reject(error);
    }
  );
}

export function createAPIClient(config: APIClientConfig = {}): AxiosInstance {
  const {
    baseURL = API_CONFIG.BASE_URL,
    timeout = API_CONFIG.TIMEOUT,
    enableAutoRedirect = true
  } = config;

  const apiInstance = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  });

  setupRequestInterceptor(apiInstance);
  setupResponseInterceptor(apiInstance, enableAutoRedirect);

  return apiInstance;
}


export const api = createAPIClient();

export const authUtils = {

  isAuthenticated: (): boolean => getAuthToken() !== null,
  
  getCurrentToken: (): string | null => getAuthToken(),
  
  clearAuth: (): void => {
    if (!isClientSide()) return;
    
    try {
      localStorage.removeItem(API_CONFIG.TOKEN_STORAGE_KEY);
    } catch (error) {
      console.warn('Erro ao limpar autenticação:', error);
    }
  }
} as const;