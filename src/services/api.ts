import axios, { AxiosInstance, AxiosHeaders } from 'axios';

/**
 * Função para obter token de diferentes fontes
 */
function getToken(): string | null {
  if (typeof window === 'undefined') return null;

  // Método 1: Cookies (mais seguro para tokens)
  const cookieMatch = document.cookie.match(/(?:^|;\s*)nextauth\.token=([^;]+)/);
  if (cookieMatch) {
    try {
      return decodeURIComponent(cookieMatch[1]);
    } catch {
      // Se falhar ao decodificar, continua para próximo método
    }
  }

  // Método 2: sessionStorage (mais seguro que localStorage)
  try {
    const sessionToken = sessionStorage.getItem('nextauth.token');
    if (sessionToken) return sessionToken;
  } catch {
    // Ignora erro de acesso ao sessionStorage
  }

  // Método 3: localStorage como último recurso
  try {
    return localStorage.getItem('nextauth.token');
  } catch {
    return null;
  }
}

/**
 * Função para limpar tokens em caso de erro de autenticação
 */
function clearTokens(): void {
  if (typeof window === 'undefined') return;

  try {
    // Remove do sessionStorage
    sessionStorage.removeItem('nextauth.token');
    // Remove do localStorage
    localStorage.removeItem('nextauth.token');
    // Remove cookie (definindo data de expiração no passado)
    document.cookie = 'nextauth.token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  } catch {
    // Ignora erros de limpeza
  }
}

export function getAPIClient(): AxiosInstance {
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // Interceptor de requisição
  api.interceptors.request.use(
    (config) => {
      const currentToken = getToken();

      if (currentToken) {
        if (!config.headers) {
          config.headers = new AxiosHeaders();
        }
        config.headers.set('Authorization', `Bearer ${currentToken}`);
      }

      // Log de debug em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor de resposta melhorado
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      const status = error.response?.status;

      if (status === 401) {
        // Token inválido ou expirado
        clearTokens();
        
        if (typeof window !== 'undefined') {
          // Evita loop infinito se já estiver na página de login
          if (!window.location.pathname.includes('/login')) {
            const currentPath = encodeURIComponent(window.location.pathname + window.location.search);
            window.location.href = `/login?redirect=${currentPath}`;
          }
        }
      } else if (status === 403) {
        // Usuário não tem permissão
        console.warn('Access denied:', error.response?.data?.message);
      } else if (status >= 500) {
        // Erro do servidor
        console.error('Server error:', error.response?.data?.message || 'Internal server error');
      }

      // Log de debug em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.error('API Error:', {
          status,
          url: error.config?.url,
          message: error.response?.data?.message || error.message
        });
      }

      return Promise.reject(error);
    }
  );

  return api;
}

// Instância única da API
export const api = getAPIClient();

// Função utilitária para verificar se o usuário está autenticado
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

// Função utilitária para logout
export function logout(): void {
  clearTokens();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}