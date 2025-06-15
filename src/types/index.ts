// ===== TIPOS ÚNICOS E CENTRALIZADOS =====
// Use APENAS este arquivo para todos os tipos da aplicação

// ===== TIPOS BÁSICOS =====
export type SituacaoType = 'ATIVO' | 'INATIVO';
export type TurnoType = 'DIURNO' | 'NOTURNO';
export type SexoType = 'M' | 'F';
export type UserRole = 'ROLE_SECRETARIA' | 'ROLE_PROFESSOR' | 'ROLE_ALUNO';

// ===== USER E AUTENTICAÇÃO =====
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

// ===== PROFESSOR =====
export interface ProfessorResponse {
  id_professor: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  situacao: SituacaoType;
  logradouro: string;
  bairro: string;
  numero: number;
  cidade: string;
  uf: string;
  sexo: string;
  data_nasc: string;
}

// ===== CURSO =====
export interface CursoResponse {
  idCurso: string;
  nome: string;
  duracao: number;
  id_secretaria: string;
  situacao: SituacaoType;
  data_alteracao?: string;
}

// ===== DISCIPLINA =====
export interface DisciplinaResponse {
  idDisciplina: string;
  nome: string;
  ementa: string;
  cargaHoraria: number;
  idSecretaria: string;
  situacao: SituacaoType;
}

// ===== TURMA =====
export interface TurmaResponse {
  idTurma: string;
  nome: string;
  ano: string;
  turno: TurnoType;
  idCurso: string;
  idSecretaria: string;
  situacao: SituacaoType;
  dataCreacao?: string;
}

// ===== FORMULÁRIOS =====
export interface BaseFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export interface LoadingState {
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

// ===== API =====
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
}

// ===== SCHEMAS (Re-export apenas os necessários) =====
export type {
  // Auth
  LoginFormData,
  ResetPasswordFormData,
  
  // Professor
  ProfessorCadastroData,
  ProfessorEdicaoData,
  ProfessorCreateDTO,
  ProfessorUpdateDTO,
  
  // Curso
  CursoFormData,
  CursoDTO,
  CursoEditarDTO,
  
  // Disciplina
  DisciplinaFormData,
  DisciplinaDTO,
  
  // Turma
  TurmaFormData,
  TurmaDTO,
} from '@/schemas';

// ===== COMPONENTES UI =====
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

// ===== PAGINAÇÃO =====
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
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

// ===== SIDEBAR =====
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