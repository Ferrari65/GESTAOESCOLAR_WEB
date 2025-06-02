import axios, { AxiosHeaders, AxiosInstance } from 'axios';

/**
 * Função para obter token que REALMENTE funciona
 */
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Método 1: document.cookie (mais confiável no client-side)
  const match = document.cookie.match(/nextauth\.token=([^;]+)/);
  if (match) {
    return match[1];
  }
  
  // Método 2: localStorage como fallback
  try {
    return localStorage.getItem('nextauth.token');
  } catch {
    return null;
  }
}

export function getAPIClient(): AxiosInstance {
  const token = getToken();

  const api = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // Interceptor para sempre aplicar o token mais atual
  api.interceptors.request.use(config => {
    const currentToken = getToken();
    
    if (currentToken) {
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }
      config.headers['Authorization'] = `Bearer ${currentToken}`;
    }
    
    return config;
  });

  // Interceptor de resposta
  api.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        // Token inválido - redirecionar para login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );

  return api;
}

export const api = getAPIClient();