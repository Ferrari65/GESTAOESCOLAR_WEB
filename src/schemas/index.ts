import { z } from 'zod';

// ===== VALIDADORES  =====
const validateCPF = (cpf: string): boolean => {
  if (!cpf) return false;
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cleanCPF.charAt(10));
};

const validatePhone = (phone: string): boolean => {
  if (!phone) return false;
  const cleanPhone = phone.replace(/[^\d]/g, '');
  if (cleanPhone.length !== 10 && cleanPhone.length !== 11) return false;
  const areaCode = parseInt(cleanPhone.substring(0, 2));
  if (areaCode < 11 || areaCode > 99) return false;
  if (cleanPhone.length === 11 && cleanPhone.charAt(2) !== '9') return false;
  return true;
};

// ===== SCHEMAS REUTILIZÁVEIS =====
export const emailValidator = z
  .string()
  .trim()
  .min(1, 'Email é obrigatório')
  .email('Digite um email válido')
  .max(254, 'Email muito longo')
  .toLowerCase();

export const passwordValidator = z
  .string()
  .min(6, 'Senha deve ter pelo menos 6 caracteres')
  .max(50, 'Senha muito longa')
  .refine(
    (password) => !COMMON_PASSWORDS.includes(password.toLowerCase()),
    'Esta senha é muito comum, escolha outra'
  );

/**
 * Validador de senha rigoroso - para desenvolvimento e cadastros
 */
export const strictPasswordValidator = z
  .string()
  .min(1, 'Senha é obrigatória')
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .max(100, 'Senha muito longa')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'A senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número'
  )
  .refine(
    (password) => !COMMON_PASSWORDS.includes(password.toLowerCase()),
    'Esta senha é muito comum, escolha outra'
  );

/**
 * Validador de duração para cursos
 */
export const duracaoValidator = z
  .string()
  .min(1, 'Duração é obrigatória')
  .refine((val) => {
    const num = parseInt(val, 10);
    return !isNaN(num) && num > 0 && num <= 60;
  }, 'Duração deve ser um número entre 1 e 60 meses');

  /*
  * Validador para carga horária de disciplinas
  */
 export const cargaHorariaValidator = z
  .string()
  .min(1, 'Carga horária é obrigatória')
  .refine((val) => {
    const num = parseInt(val, 10);
    return !isNaN(num) && num > 0;
  }, 'Carga horária deve ser um número positivo');

// ===== SCHEMAS DE AUTENTICAÇÃO =====
export const loginSchema = z.object({
  email: emailValidator,
  password: passwordValidator,
});

export const resetPasswordSchema = z
  .object({
    email: emailValidator,
    password: passwordValidator,
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

// =====  PROFESSOR =====
export const professorFormSchema = z.object({
  nome: nameValidator,
  cpf: cpfValidator,
  email: emailValidator,
  senha: passwordValidator,
  telefone: phoneValidator,
  data_nasc: z.string().min(1, 'Data de nascimento é obrigatória'),
  sexo: z.enum(['M', 'F'], {
    errorMap: () => ({ message: 'Selecione o sexo' }),
  }),
  logradouro: z.string().min(1, 'Logradouro é obrigatório').trim(),
  bairro: z.string().min(1, 'Bairro é obrigatório').trim(),
  numero: z.string().min(1, 'Número é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória').trim(),
  uf: z.string().length(2, 'UF deve ter 2 caracteres').toUpperCase(),
});

export const professorDTOSchema = z.object({
  nome: z.string(),
  CPF: z.string(),
  email: z.string(),
  senha: z.string(),
  telefone: z.string(),
  data_nasc: z.string(),
  sexo: z.enum(['M', 'F']),
  logradouro: z.string(),
  bairro: z.string(),
  numero: z.number().positive('Número deve ser positivo'),
  cidade: z.string(),
  UF: z.string(),
  situacao: z.literal('ATIVO'),
  id_secretaria: z.string(),
});

// =====  CURSO =====
export const cursoFormSchema = z.object({
  nome: z
    .string()
    .min(3, 'Nome do curso deve ter pelo menos 3 caracteres')
    .max(100, 'Nome do curso deve ter no máximo 100 caracteres')
    .trim(),
  duracao: z
    .union([
      z.string().min(1, 'Duração é obrigatória'),
      z.number().min(1).max(60),
    ])
    .transform((val) => {
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      if (isNaN(num) || num < 1 || num > 60) {
        throw new Error('Duração deve ser um número entre 1 e 60 meses');
      }
      return num;
    }),
});

export const cursoDTOSchema = z.object({
  nome: z.string().min(3).max(100),
  duracao: z.number().min(1).max(60),
  id_secretaria: z.string().min(1),
});

export const cursoEditarDTOSchema = z.object({
  nome: z.string().optional(),
  duracao: z.number().optional(), 
  situacao: SituacaoTypeEnum.optional(),
  id_secretaria: z.string().optional(),
});

export const cursoResponseSchema = z.object({
  idCurso: z.string(),
  nome: z.string(),
  duracao: z.number(),  
  id_secretaria: z.string(), 
  situacao: z.string(), 
  data_alteracao: z.string()
});

/**
 * Schema para disciplina
 */

  export const disciplinaDTO = z.object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    ementa: z.string().min(1, 'Ementa é obrigatória'),
    cargaHoraria: z.number().int().positive().min(1, 'Carga horária é obrigatória'),
    id_secretaria: z.string()
  });

  export const disciplinaResponse = z.object({
  idDisciplina: z.string(),
  nome: z.string(),
  ementa: z.string(),
  cargaHoraria: z.number().int().positive(),
  idSecretaria: z.string(),
  situacao: z.enum(['ATIVO', 'INATIVO']),
});

export const disciplinaFormSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),

  ementa: z
    .string()
    .min(1, 'Ementa é obrigatória')
    .max(500, 'Ementa deve ter no máximo 500 caracteres'),

  cargaHoraria: cargaHorariaValidator
});


// ===== TIPOS DERIVADOS =====

export type LoginFormData = z.infer<typeof loginSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ProfessorFormData = z.infer<typeof professorFormSchema>;
export type ProfessorDTO = z.infer<typeof professorDTOSchema>;

export type CursoFormData = z.infer<typeof cursoFormSchema>;
export type CursoDTO = z.infer<typeof cursoDTOSchema>;
export type CursoEditarDTO = z.infer<typeof cursoEditarDTOSchema>;
export type CursoResponse = z.infer<typeof cursoResponseSchema>;

export type DisciplinaFormData = z.infer<typeof disciplinaFormSchema>;
export type DisciplinaDTO = z.infer<typeof disciplinaDTO>;
export type DisciplinaResponse = z.infer<typeof disciplinaResponse>;

// ===== FUNÇÕES DE VALIDAÇÃO =====


export const validateCursoForm = (data: unknown) => {
  return cursoFormSchema.safeParse(data);
};

export const validateCursoDTO = (data: unknown) => {
  return cursoDTOSchema.safeParse(data);
};

export const validateDisciplinaForm = (data: unknown) => {
  return disciplinaFormSchema.safeParse(data);
};

export const validateDisciplinaDTO = (data: unknown) => {
  return disciplinaDTO.safeParse(data);
};

export function checkPasswordStrength(password: string) {
  const checks = {
    length: password.length >= 8,
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    notCommon: !COMMON_PASSWORDS.includes(password.toLowerCase()),
  };

  const score = Object.values(checks).filter(Boolean).length;
  
  let level: 'fraca' | 'média' | 'forte';
  if (score <= 2) level = 'fraca';
  else if (score <= 4) level = 'média';
  else level = 'forte';

  return { score, level, isStrong: score >= 4 };
}

export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => err.message)
      };
    }
    return {
      success: false,
      errors: ['Erro de validação desconhecido']
    };
  }
}

// ===== CONFIGURAÇÕES DE SEGURANÇA =====

export const securitySettings = {
  maxLoginAttempts: 5,
  lockoutTime: 15 * 60 * 1000, 
  sessionDuration: 24 * 60 * 60 * 1000, 
} as const;

// ===== EXPORTS DE COMPATIBILIDADE =====


export const productionSchema = loginSchema;
export const developmentSchema = developmentLoginSchema;
