// src/config/app.ts - VERSÃO CORRIGIDA COM EXPORTS

// ========================
// API CONFIGURATION
// ========================
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
} as const;

// ========================
// AUTH CONFIGURATION
// ========================
export const AUTH_CONFIG = {
  tokenCookieName: 'nextauth.token',
  tokenLocalStorageKey: 'nextauth.token', 
  secretariaIdKey: 'secretaria_id',
  maxAge: 604800, 

  loginEndpoints: [
    '/secretaria/auth/login',
    '/professor/auth/login', 
    '/aluno/login'
  ],
  
  dashboardRoutes: {
    ROLE_SECRETARIA: '/secretaria/alunos',
    ROLE_PROFESSOR: '/professor/home',
    ROLE_ALUNO: '/aluno/home',
  }
} as const;

// ========================
// MIDDLEWARE CONFIG
// ========================
export const MIDDLEWARE_CONFIG = {
  publicPaths: ['/login', '/redefinir'],
  
  protectedRoutes: {
    '/secretaria': 'ROLE_SECRETARIA',
    '/professor': 'ROLE_PROFESSOR', 
    '/aluno': 'ROLE_ALUNO'
  },
  
  skipPaths: [
    '/_next',
    '/api', 
    '/favicon'
  ]
} as const;

// ========================
// ENVIRONMENT & UTILS
// ========================
export const ENV = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isServer: typeof window === 'undefined',
} as const;

// ========================
// ERROR MESSAGES
// ========================
export const ERROR_MESSAGES = {
  // Auth
  INVALID_CREDENTIALS: 'Email ou senha incorretos.',
  SESSION_EXPIRED: 'Sessão expirada. Faça login novamente.',
  UNAUTHORIZED: 'Sem permissão para acessar esta área.',
  
  // Network
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  SERVER_ERROR: 'Erro no servidor. Tente novamente.',
  TIMEOUT: 'Tempo limite excedido.',
  
  // Generic
  UNKNOWN: 'Erro desconhecido. Contate o suporte.',
  REQUIRED_FIELD: 'Este campo é obrigatório.',
} as const;

export const SUCCESS_MESSAGES = {
  SAVE: 'Dados salvos com sucesso!',
  UPDATE: 'Dados atualizados com sucesso!', 
  DELETE: 'Item excluído com sucesso!',
  LOGIN: 'Login realizado com sucesso!',
} as const;

// ========================
// UTILITY FUNCTIONS
// ========================
export function getDashboardRoute(role: string): string {
  return AUTH_CONFIG.dashboardRoutes[role as keyof typeof AUTH_CONFIG.dashboardRoutes] || '/login';
}

export function isDev(): boolean {
  return ENV.isDevelopment;
}

export function devLog(message: string, data?: unknown): void {
  if (ENV.isDevelopment) {
    console.log(message, data || '');
  }
}

export function getAPIURL(): string {
  return API_CONFIG.baseURL;
}