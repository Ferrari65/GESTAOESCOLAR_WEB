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

// ===== ALIASES PARA COMPATIBILIDADE =====
// Disciplina - compatibilidade com nomes antigos
export { disciplinaDTOSchema as disciplinaDTO };
export { disciplinaResponseSchema as disciplinaResponse };

// Curso - compatibilidade
export { cursoEditarDTOSchema as cursoEditarDTO };

// Situação - compatibilidade
export { SituacaoEnum as SituacaoTypeEnum };
export { TurnoEnum as TurnoTypeEnum };