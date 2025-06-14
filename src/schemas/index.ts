// ===== EXPORTAÇÕES CENTRALIZADAS DOS SCHEMAS =====

// ===== TIPOS COMPARTILHADOS =====
export type { SituacaoType, TurnoType, SexoType } from './shared';
export {
  // Enums
  SituacaoEnum,
  TurnoEnum,
  SexoEnum,
  
  // Validadores básicos
  nomeValidator,
  cpfValidator,
  phoneValidator,
  emailValidator,
  passwordValidator,
  ufValidator,
  numeroValidator,
  dataValidator,
  duracaoValidator,
  cargaHorariaValidator,
  
  // Funções de validação
  validateCPF,
  validatePhone,
  
  // Utilitários de formatação
  cleanCPF,
  cleanPhone,
  formatCPF,
  formatPhone,
  
  // Outras funções
  checkPasswordStrength,
} from './shared';

// ===== AUTENTICAÇÃO =====
export type { LoginFormData, ResetPasswordFormData } from './auth';
export {
  loginSchema,
  developmentLoginSchema,
  resetPasswordSchema,
  validateLogin,
  validateResetPassword,
} from './auth';

// ===== PROFESSOR =====
export type {
  ProfessorCadastroData,
  ProfessorEdicaoData,
  ProfessorCreateDTO,
  ProfessorUpdateDTO,
  ProfessorResponse,
} from './professor';
export {
  professorCadastroSchema,
  professorEdicaoSchema,
  professorCreateDTOSchema,
  professorUpdateDTOSchema,
  professorResponseSchema,
  validateProfessorCadastro,
  validateProfessorEdicao,
  validateProfessorResponse,
} from './professor';

// ===== CURSO =====
export type {
  CursoFormData,
  CursoDTO,
  CursoEditarDTO,
  CursoResponse,
} from './curso';
export {
  cursoFormSchema,
  cursoDTOSchema,
  cursoEditarDTOSchema,
  cursoResponseSchema,
  validateCursoForm,
  validateCursoDTO,
  validateCursoResponse,
} from './curso';

// ===== DISCIPLINA =====
export type {
  DisciplinaFormData,
  DisciplinaDTO,
  DisciplinaResponse,
} from './disciplina';
export {
  disciplinaFormSchema,
  disciplinaDTOSchema,
  disciplinaResponseSchema,
  validateDisciplinaForm,
  validateDisciplinaDTO,
  validateDisciplinaResponse,
} from './disciplina';

// ===== TURMA =====
export type {
  TurmaFormData,
  TurmaDTO,
  TurmaResponse,
} from './turma';
export {
  turmaFormSchema,
  turmaDTOSchema,
  turmaResponseSchema,
  validateTurmaForm,
  validateTurmaDTO,
  validateTurmaResponse,
} from './turma';

// ===== FUNÇÕES UTILITÁRIAS GERAIS =====
export function validateSchema<T>(schema: any, data: unknown): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error: any) {
    if (error?.errors) {
      return {
        success: false,
        errors: error.errors.map((err: any) => err.message)
      };
    }
    return {
      success: false,
      errors: ['Erro de validação desconhecido']
    };
  }
}

// ===== COMPATIBILIDADE (para não quebrar imports existentes) =====

// Disciplina - compatibilidade com nomes antigos
export const disciplinaDTO = disciplinaDTOSchema;
export const disciplinaResponse = disciplinaResponseSchema;

// Curso - compatibilidade
export const cursoEditarDTO = cursoEditarDTOSchema;

// Situação - compatibilidade
export const SituacaoTypeEnum = SituacaoEnum;
export const TurnoTypeEnum = TurnoEnum;