type UserRole = 'ROLE_SECRETARIA' | 'ROLE_PROFESSOR' | 'ROLE_ALUNO';

// ===== ENVIRONMENT =====
export const ENV = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isServer: typeof window === 'undefined',
  nodeEnv: process.env.NODE_ENV || 'development',
} as const;

// ===== API CONFIGURATION =====
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
} as const;

// ===== AUTHENTICATION =====
export const AUTH_CONFIG = {
  // Tokens
  tokenCookieName: 'nextauth.token',
  tokenLocalStorageKey: 'nextauth.token', 
  secretariaIdKey: 'secretaria_id',
  maxAge: 604800, // 7 dias em segundos
  
  // Endpoints
  loginEndpoints: [
    '/secretaria/auth/login',
    '/professor/auth/login', 
  ] as const,
  
  // Rotas após login
  dashboardRoutes: {
    ROLE_SECRETARIA: '/secretaria/alunos',
    ROLE_PROFESSOR: '/professor/home',
    ROLE_ALUNO: '/aluno/home',
  } as const satisfies Record<UserRole, string>,
  
  // Segurança
  passwordMinLength: 6,
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutos
} as const;

// ===== MIDDLEWARE =====
export const MIDDLEWARE_CONFIG = {
  // Rotas públicas (não precisam de autenticação)
  publicPaths: ['/login', '/redefinir', '/'] as const,
  
  // Mapeamento de rotas protegidas e roles necessárias
  protectedRoutes: {
    '/secretaria': 'ROLE_SECRETARIA',
    '/professor': 'ROLE_PROFESSOR', 
    '/aluno': 'ROLE_ALUNO',
  } as const satisfies Record<string, UserRole>,
  
  // Paths que o middleware deve ignorar
  skipPaths: [
    '/_next',
    '/api', 
    '/favicon',
    '/logo',
    '/background',
    '/cuate.png',
  ] as const,
} as const;

// ===== CACHE =====
export const CACHE_CONFIG = {
  // Durações em milissegundos
  durations: {
    SHORT: 1 * 60 * 1000,   // 1 minuto
    MEDIUM: 5 * 60 * 1000,  // 5 minutos
    LONG: 30 * 60 * 1000,   // 30 minutos
    EXTRA_LONG: 60 * 60 * 1000, // 1 hora
  },
  
  // Tamanhos máximos
  maxSizes: {
    SMALL: 50,
    MEDIUM: 100,
    LARGE: 200,
  },
  
  // Configurações específicas por entidade
  entities: {
    cursos: { duration: 3 * 60 * 1000, maxSize: 100 },
    professores: { duration: 5 * 60 * 1000, maxSize: 200 },
    disciplinas: { duration: 10 * 60 * 1000, maxSize: 150 },
    turmas: { duration: 5 * 60 * 1000, maxSize: 100 },
    secretaria: { duration: 5 * 60 * 1000, maxSize: 50 },
  },
} as const;

// ===== PAGINAÇÃO =====
export const PAGINATION_CONFIG = {
  defaultPageSize: 10,
  pageSizes: [5, 10, 20, 50] as const,
  maxPageSize: 100,
  
  // Por entidade
  entities: {
    professores: 8,
    cursos: 8,
    disciplinas: 10,
    turmas: 10,
    alunos: 15,
  },
} as const;

// ===== MENSAGENS =====
export const ERROR_MESSAGES = {
  // Autenticação
  INVALID_CREDENTIALS: 'Email ou senha incorretos.',
  SESSION_EXPIRED: 'Sessão expirada. Faça login novamente.',
  UNAUTHORIZED: 'Sem permissão para acessar esta área.',
  ACCOUNT_LOCKED: 'Conta bloqueada por muitas tentativas.',
  
  // Rede
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  SERVER_ERROR: 'Erro no servidor. Tente novamente.',
  TIMEOUT: 'Tempo limite excedido.',
  SERVICE_UNAVAILABLE: 'Serviço temporariamente indisponível.',
  
  // Validação
  REQUIRED_FIELD: 'Este campo é obrigatório.',
  INVALID_EMAIL: 'Email inválido.',
  INVALID_CPF: 'CPF inválido.',
  INVALID_PHONE: 'Telefone inválido.',
  PASSWORD_TOO_SHORT: `Senha deve ter pelo menos ${AUTH_CONFIG.passwordMinLength} caracteres.`,
  
  // Conflitos
  ALREADY_EXISTS: 'Este item já existe.',
  CPF_EXISTS: 'CPF já cadastrado.',
  EMAIL_EXISTS: 'Email já cadastrado.',
  NAME_EXISTS: 'Nome já cadastrado.',
  
  // Geral
  UNKNOWN: 'Erro desconhecido. Contate o suporte.',
  NOT_FOUND: 'Item não encontrado.',
  ACCESS_DENIED: 'Acesso negado.',
} as const;

export const SUCCESS_MESSAGES = {
  // CRUD
  SAVE: 'Dados salvos com sucesso!',
  UPDATE: 'Dados atualizados com sucesso!', 
  DELETE: 'Item excluído com sucesso!',
  CREATE: 'Item criado com sucesso!',
  
  // Auth
  LOGIN: 'Login realizado com sucesso!',
  LOGOUT: 'Logout realizado com sucesso!',
  PASSWORD_CHANGED: 'Senha alterada com sucesso!',
  
  // Status
  ACTIVATED: 'Item ativado com sucesso!',
  DEACTIVATED: 'Item desativado com sucesso!',
  
  // Específicos
  PROFESSOR_CREATED: 'Professor cadastrado com sucesso!',
  PROFESSOR_UPDATED: 'Professor atualizado com sucesso!',
  CURSO_CREATED: 'Curso cadastrado com sucesso!',
  CURSO_UPDATED: 'Curso atualizado com sucesso!',
  DISCIPLINA_CREATED: 'Disciplina cadastrada com sucesso!',
  TURMA_CREATED: 'Turma cadastrada com sucesso!',
} as const;

// ===== VALIDAÇÃO =====
export const VALIDATION_CONFIG = {
  // Campos de texto
  minNameLength: 2,
  maxNameLength: 100,
  maxEmailLength: 254,
  maxDescriptionLength: 1000,
  
  // Números
  minAge: 16,
  maxAge: 120,
  minDuration: 1,
  maxDuration: 60,
  minCargaHoraria: 1,
  maxCargaHoraria: 1000,
  
  // Formatos
  cpfLength: 11,
  phoneMinLength: 10,
  phoneMaxLength: 11,
  ufLength: 2,
  yearLength: 4,
  
  // Regex patterns
  patterns: {
    cpf: /^\d{11}$/,
    phone: /^\d{10,11}$/,
    year: /^\d{4}$/,
    alphanumeric: /^[a-zA-Z0-9\s]+$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
} as const;

// ===== UI =====
export const UI_CONFIG = {
  // Animações
  animationDuration: 200,
  toastDuration: 3000,
  welcomeAnimationDuration: 2000,
  
  // Cores (para uso em JavaScript)
  colors: {
    primary: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
  },
  
  // Breakpoints (em pixels)
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
  
  // Z-index
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080,
  },
} as const;

// ===== FUNÇÕES UTILITÁRIAS =====

export function getDashboardRoute(role: UserRole): string {
  return AUTH_CONFIG.dashboardRoutes[role] || '/login';
}

export function getAPIURL(): string {
  return API_CONFIG.baseURL;
}

export function isDev(): boolean {
  return ENV.isDevelopment;
}

export function isProd(): boolean {
  return ENV.isProduction;
}

export function isServer(): boolean {
  return ENV.isServer;
}

export function getEntityCacheConfig(entity: keyof typeof CACHE_CONFIG.entities) {
  return CACHE_CONFIG.entities[entity];
}

export function getEntityPageSize(entity: keyof typeof PAGINATION_CONFIG.entities): number {
  return PAGINATION_CONFIG.entities[entity];
}

// ===== LOGGER EM DESENVOLVIMENTO =====
export function devLog(message: string, data?: unknown): void {
  if (ENV.isDevelopment) {
    console.log(`[DEV] ${message}`, data || '');
  }
}

export function devWarn(message: string, data?: unknown): void {
  if (ENV.isDevelopment) {
    console.warn(`[DEV] ${message}`, data || '');
  }
}

export function devError(message: string, data?: unknown): void {
  if (ENV.isDevelopment) {
    console.error(`[DEV] ${message}`, data || '');
  }
}

// ===== VALIDAÇÕES =====
export function isValidRole(role: string): role is UserRole {
  const validRoles: UserRole[] = ['ROLE_SECRETARIA', 'ROLE_PROFESSOR', 'ROLE_ALUNO'];
  return validRoles.includes(role as UserRole);
}

export function isPublicPath(pathname: string): boolean {
  return MIDDLEWARE_CONFIG.publicPaths.some(path => pathname.startsWith(path));
}

export function getRequiredRole(pathname: string): UserRole | null {
  for (const [routePrefix, role] of Object.entries(MIDDLEWARE_CONFIG.protectedRoutes)) {
    if (pathname.startsWith(routePrefix)) {
      return role as UserRole;
    }
  }
  return null;
}

// ===== FEATURES FLAGS =====
export const FEATURE_FLAGS = {
  enableWelcomeAnimation: true,
  enableCache: true,
  enableDetailedLogging: ENV.isDevelopment,
  enableErrorReporting: ENV.isProduction,
  enableOfflineMode: false,
  enablePushNotifications: false,
} as const;

// ===== EXPORTS ORGANIZADOS =====
export const config = {
  env: ENV,
  api: API_CONFIG,
  auth: AUTH_CONFIG,
  middleware: MIDDLEWARE_CONFIG,
  cache: CACHE_CONFIG,
  pagination: PAGINATION_CONFIG,
  validation: VALIDATION_CONFIG,
  ui: UI_CONFIG,
  features: FEATURE_FLAGS,
  messages: {
    error: ERROR_MESSAGES,
    success: SUCCESS_MESSAGES,
  },
} as const;

export default config;