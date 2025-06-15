// ===== TIPOS COMPARTILHADOS CENTRALIZADOS =====
// Este arquivo vai substituir todas as duplicações!

// ===== TIPOS BÁSICOS =====
export type SituacaoType = 'ATIVO' | 'INATIVO';
export type TurnoType = 'DIURNO' | 'NOTURNO';
export type SexoType = 'M' | 'F';

// ===== ROLES/PAPÉIS =====
export type UserRole = 
  | 'ROLE_SECRETARIA' 
  | 'ROLE_PROFESSOR' 
  | 'ROLE_ALUNO';

// ===== USER E AUTH =====
export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthError {
  type: 'validation' | 'network' | 'unauthorized' | 'server' | 'unknown';
  message: string;
  statusCode?: number;
}

// ===== SECRETARIA =====
export interface SecretariaData {
  nome: string;
  email: string;
  id_secretaria: string;
}

// ===== API RESPONSES =====
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
}

// ===== COMPONENTES UI =====
export interface BaseFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export interface LoadingState {
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

// ===== HOOKS RETURN TYPES =====
export interface BaseHookReturn extends LoadingState {
  clearMessages: () => void;
}

// ===== FORM COMPONENTS =====
export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

export interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export interface SuccessMessageProps {
  message: string;
  onClose?: () => void;
  className?: string;
}

// ===== SIDEBAR/MENU =====
export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

export interface SidebarProps {
  className?: string;
  onMenuItemClick?: (itemId: string) => void;
}

// ===== HEADER =====
export interface HeaderProps {
  title?: string;
  subtitle?: string;
  secretariaData?: SecretariaData | null;
  user: User;
  onSignOut: () => void;
  showSignOutButton?: boolean;
}

// ===== PAGINAÇÃO =====
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

// ===== FILTROS GENÉRICOS =====
export interface BaseFilters {
  orderBy?: string;
  order?: 'asc' | 'desc';
  situacao?: SituacaoType;
  page?: number;
  limit?: number;
}

// ===== CACHE =====
export interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export interface CacheConfig {
  duration: number; // em milissegundos
  maxSize?: number;
}

// ===== VALIDAÇÃO =====
export interface ValidationResult<T = any> {
  success: boolean;
  data?: T;
  errors?: string[];
}

// ===== TRANSFORMADORES =====
export interface TransformOptions {
  validateRequired?: boolean;
  sanitizeStrings?: boolean;
  logTransformation?: boolean;
}

// ===== UTILITÁRIOS DE RESPOSTA =====
export interface FetchResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface MutationResponse {
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  clearMessages: () => void;
}

// ===== MODAL/DIALOG =====
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

// ===== SEARCH/FILTER =====
export interface SearchState {
  query: string;
  filters: Record<string, any>;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

// ===== CONSTANTS =====
export const CACHE_DURATION = {
  SHORT: 1 * 60 * 1000,   // 1 minuto
  MEDIUM: 5 * 60 * 1000,  // 5 minutos
  LONG: 30 * 60 * 1000,   // 30 minutos
} as const;

export const ITEMS_PER_PAGE = {
  SMALL: 5,
  MEDIUM: 10,
  LARGE: 20,
} as const;