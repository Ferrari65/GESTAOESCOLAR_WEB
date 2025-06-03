import { z } from 'zod';

// ===== CONFIGURAÇÕES E CONSTANTES =====

const COMMON_PASSWORDS = [
  '123456', 'password', '123456789', '12345678', 'qwerty', 'abc123'
];

// ===== VALIDADORES BASE UNIFICADOS =====

export const emailValidator = z
  .string()
  .trim()
  .min(1, 'Email é obrigatório')
  .email('Digite um email válido')
  .max(254, 'Email muito longo')
  .toLowerCase(); 

export const passwordValidator = z
  .string()
  .min(1, 'Senha é obrigatória')
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

// ===== SCHEMAS DE AUTENTICAÇÃO =====

/**
 * Schema de login para produção
 */
export const loginSchema = z.object({
  email: emailValidator,
  password: passwordValidator,
});

/**
 * Schema de login para desenvolvimento (mais rigoroso)
 */
export const developmentLoginSchema = z.object({
  email: emailValidator,
  password: strictPasswordValidator,
});

/**
 * Função para obter schema baseado no ambiente
 */
export function getLoginSchema(isDevelopment = false) {
  return isDevelopment ? developmentLoginSchema : loginSchema;
}

/**
 * Schema de reset de senha UNIFICADO
 */
export const resetPasswordSchema = z.object({
  email: emailValidator,
  password: strictPasswordValidator,
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

// ===== SCHEMAS DE CURSO =====

/**
 * Schema para formulário de curso
 */
export const cursoFormSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),

  duracao: duracaoValidator,
    
});

/**
 * Schema para DTO de curso (API)
 */
export const cursoDTOSchema = z.object({
  nome: z.string().min(1).max(100),
  duracao: z.number().int().positive().max(60),  
  id_secretaria: z.string().min(1, 'ID da secretaria é obrigatório'),
  situacao: z.string().default('ATIVO'),
  data_alteracao: z.string()
});

/**
 * Schema para resposta de curso da API
 */
export const cursoResponseSchema = z.object({
  id_curso: z.string(), 
  nome: z.string(),
  duracao: z.number(),  
  id_secretaria: z.string(), 
  situacao: z.string(), 
  data_alteracao: z.string()
});

// ===== TIPOS DERIVADOS =====

export type LoginFormData = z.infer<typeof loginSchema>;
export type LoginData = LoginFormData; 
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export type CursoFormData = z.infer<typeof cursoFormSchema>;
export type CursoDTO = z.infer<typeof cursoDTOSchema>;
export type CursoResponse = z.infer<typeof cursoResponseSchema>;

// ===== FUNÇÕES DE VALIDAÇÃO =====


export const validateCursoForm = (data: unknown) => {
  return cursoFormSchema.safeParse(data);
};


export const validateCursoDTO = (data: unknown) => {
  return cursoDTOSchema.safeParse(data);
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
