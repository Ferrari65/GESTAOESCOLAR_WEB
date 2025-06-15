// ===== TIPOS ÚNICOS E CENTRALIZADOS =====
// CORRIGIDO: Este arquivo agora apenas RE-EXPORTA dos schemas (sem duplicação)

// ===== TIPOS BÁSICOS (vêm dos schemas) =====
export type {
  SituacaoType,
  TurnoType, 
  SexoType
} from '@/schemas/shared';

// ===== TIPOS DE FORMULÁRIOS (vêm dos schemas) =====
export type {
  // Auth
  LoginFormData,
  ResetPasswordFormData,
  
  // Professor
  ProfessorCadastroData,
  ProfessorEdicaoData,
  ProfessorCreateDTO,
  ProfessorUpdateDTO,
  ProfessorResponse,
  
  // Curso
  CursoFormData,
  CursoDTO,
  CursoEditarDTO,
  CursoResponse,
  
  // Disciplina
  DisciplinaFormData,
  DisciplinaDTO,
  DisciplinaResponse,
  
  // Turma
  TurmaFormData,
  TurmaDTO,
  TurmaResponse,
} from '@/schemas';

// ===== TIPOS ÚNICOS DESTE ARQUIVO (que não existem nos schemas) =====
export type UserRole = 'ROLE_SECRETARIA' | 'ROLE_PROFESSOR' | 'ROLE_ALUNO';

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

export interface SecretariaData {
  nome: string;
  email: string;
  id_secretaria: string;
}

// ===== INTERFACES PARA COMPONENTES =====
export interface BaseFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export interface LoadingState {
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
}

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

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  secretariaData?: SecretariaData | null;
  user: User;
  onSignOut: () => void;
  showSignOutButton?: boolean;
}

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