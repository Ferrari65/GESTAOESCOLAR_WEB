// ===== EXPORTS ÚNICOS E ORGANIZADOS =====
// Use APENAS este arquivo para importar tipos

// ===== TIPOS PRINCIPAIS =====
export type {
  // Básicos
  SituacaoType,
  TurnoType,
  SexoType,
  UserRole,
  
  // User e Auth
  User,
  AuthError,
  
  // Forms
  BaseFormProps,
  LoadingState,
  
  // API
  ApiResponse,
  ApiError,
  
  // Entidades
  ProfessorResponse,
  CursoResponse,
  DisciplinaResponse,
  TurmaResponse,
  SecretariaData,
} from './core';

// ===== SCHEMAS (apenas os necessários) =====
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

// ===== NADA MAIS! =====
// Se você precisar de um tipo, adicione aqui
// Não crie tipos duplicados em outros arquivos