// ===== ARQUIVO ÚNICO PARA TODOS OS TIPOS =====
// Use APENAS este arquivo para tipos básicos

// ===== TIPOS FUNDAMENTAIS =====
export type SituacaoType = 'ATIVO' | 'INATIVO';
export type TurnoType = 'DIURNO' | 'NOTURNO';
export type SexoType = 'M' | 'F';
export type UserRole = 'ROLE_SECRETARIA' | 'ROLE_PROFESSOR' | 'ROLE_ALUNO';

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

// ===== SECRETARIA =====
export interface SecretariaData {
  nome: string;
  email: string;
  id_secretaria: string;
}