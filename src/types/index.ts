// ===== ARQUIVO PRINCIPAL DE TIPOS CORRIGIDO =====

// ===== IMPORTAR TODOS OS TIPOS COMPARTILHADOS =====
export * from './shared';

// ===== IMPORTAR TIPOS DOS SCHEMAS =====
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

// ===== ALIASES PARA COMPATIBILIDADE =====
// (Para não quebrar código existente)
export type { SituacaoType as Status } from './shared';
export type { UserRole as Role } from './shared';
export type { SexoType as Sexo } from './shared';

// ===== TIPOS ESPECÍFICOS DE DOMÍNIO =====

// Professor específicos
export interface ProfessorListItem {
  id_professor: string;
  nome: string;
  email: string;
  situacao: SituacaoType;
}

export interface ProfessorFilters extends BaseFilters {
  nome?: string;
  email?: string;
  situacao?: SituacaoType;
}

// Curso específicos
export interface CursoListItem {
  idCurso: string;
  nome: string;
  duracao: number;
  situacao: SituacaoType;
}

export interface CursoFilters extends BaseFilters {
  nome?: string;
  duracao?: number;
}

// Disciplina específicos
export interface DisciplinaListItem {
  idDisciplina: string;
  nome: string;
  cargaHoraria: number;
  situacao: SituacaoType;
}

export interface DisciplinaFilters extends BaseFilters {
  nome?: string;
  cargaHoraria?: number;
}

// Turma específicos
export interface TurmaListItem {
  idTurma: string;
  nome: string;
  ano: string;
  turno: TurnoType;
  situacao: SituacaoType;
}

export interface TurmaFilters extends BaseFilters {
  nome?: string;
  ano?: string;
  turno?: TurnoType;
}

// ===== HOOKS ESPECIALIZADOS =====
export interface UseProfessorListReturn extends FetchResponse<ProfessorResponse[]> {
  atualizarProfessor: (id: string, dados: Partial<ProfessorResponse>) => void;
}

export interface UseCursoListReturn extends FetchResponse<CursoResponse[]> {
  updateCursoOptimistic: (id: string, updates: Partial<CursoResponse>) => void;
  revertCursoOptimistic: (id: string, original: CursoResponse) => void;
}

// ===== RE-EXPORTAR TUDO IMPORTANTE =====
import type {
  SituacaoType,
  TurnoType, 
  SexoType,
  User,
  UserRole,
  SecretariaData,
  ApiResponse,
  ApiError,
  BaseFormProps,
  LoadingState,
  BaseHookReturn
} from './shared';

// Garantir que estes tipos estão disponíveis
export type {
  SituacaoType,
  TurnoType,
  SexoType,
  User,
  UserRole,
  SecretariaData,
  ApiResponse,
  ApiError,
  BaseFormProps,
  LoadingState,
  BaseHookReturn
};