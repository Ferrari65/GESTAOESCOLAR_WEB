import { z } from 'zod';

// ===== SENHAS =====
const COMMON_PASSWORDS = [
  '123456', 'password', '123456789', '12345678', '12345',
  '1234567', '1234567890', 'qwerty', 'abc123', '111111',
  'password1', 'admin', 'letmein', 'welcome', 'monkey'
];

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

// ===== ENUMS =====
export const SituacaoTypeEnum = z.enum(['ATIVO', 'INATIVO'], {
  errorMap: () => ({ message: 'Situação deve ser ATIVO ou INATIVO' }),
});

export const TurnoTypeEnum = z.enum(['DIURNO', 'NOTURNO'], {
  errorMap: () => ({ message: 'Turno deve ser DIURNO ou NOTURNO' }),
});

// =====  REUTILIZÁVEIS =====
export const nameValidator = z
  .string()
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(100, 'Nome muito longo')
  .trim();

export const cpfValidator = z
  .string()
  .min(1, 'CPF é obrigatório')
  .refine(validateCPF, 'CPF inválido');

export const phoneValidator = z
  .string()
  .min(1, 'Telefone é obrigatório')
  .refine(validatePhone, 'Telefone inválido');

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

export const duracaoValidator = z
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
  });

export const cargaHorariaValidator = z
  .string()
  .min(1, 'Carga horária é obrigatória')
  .transform((val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num <= 0) {
      throw new Error('Carga horária deve ser um número positivo');
    }
    return num;
  });

// =====  AUTENTICAÇÃO =====
export const loginSchema = z.object({
  email: emailValidator,
  password: passwordValidator,
});

export const developmentLoginSchema = z.object({
  email: emailValidator,
  password: z.string().min(1, 'Senha é obrigatória'),
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

// =====  CURSO =====
export const cursoFormSchema = z.object({
  nome: z
    .string()
    .min(3, 'Nome do curso deve ter pelo menos 3 caracteres')
    .max(100, 'Nome do curso deve ter no máximo 100 caracteres')
    .trim(),
  duracao: duracaoValidator,
});

export const cursoDTOSchema = z.object({
  nome: z.string().min(3).max(100),
  duracao: z.number().min(1).max(60),
  id_secretaria: z.string().min(1),
  situacao: SituacaoTypeEnum.default('ATIVO'),
  data_alteracao: z.string().optional(),
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
  situacao: SituacaoTypeEnum,
  data_alteracao: z.string().optional(),
});

// ===== DISCIPLINA =====
export const disciplinaFormSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  ementa: z
    .string()
    .min(1, 'Ementa é obrigatória')
    .max(1000, 'Ementa deve ter no máximo 1000 caracteres'),
  cargaHoraria: cargaHorariaValidator
});

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
  situacao: SituacaoTypeEnum,
});

// =====  TURMA =====
export const turmaFormSchema = z.object({
  nome: z
    .string()
    .min(3, 'Nome da turma deve ter pelo menos 3 caracteres')
    .max(100, 'Nome da turma deve ter no máximo 100 caracteres')
    .trim(),
  id_curso: z.string().min(1, 'Curso é obrigatório'),
  ano: z
    .string()
    .min(1, 'Ano é obrigatório')
    .regex(/^\d{4}$/, 'Ano deve ter 4 dígitos'),
  turno: TurnoTypeEnum,
});

export const turmaDTOSchema = z.object({
  nome: z.string().min(3).max(100),
  ano: z.string().regex(/^\d{4}$/),
  turno: TurnoTypeEnum,
});

// ===== TIPOS DERIVADOS =====
export type SituacaoType = z.infer<typeof SituacaoTypeEnum>;
export type TurnoType = z.infer<typeof TurnoTypeEnum>;

export type LoginFormData = z.infer<typeof loginSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export type CursoFormData = z.infer<typeof cursoFormSchema>;
export type CursoDTO = z.infer<typeof cursoDTOSchema>;
export type CursoEditarDTO = z.infer<typeof cursoEditarDTOSchema>;
export type CursoResponse = z.infer<typeof cursoResponseSchema>;

export type DisciplinaFormData = z.infer<typeof disciplinaFormSchema>;
export type DisciplinaDTO = z.infer<typeof disciplinaDTO>;
export type DisciplinaResponse = z.infer<typeof disciplinaResponse>;

export type TurmaFormData = z.infer<typeof turmaFormSchema>;
export type TurmaDTO = z.infer<typeof turmaDTOSchema>;

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

// ===== FUNÇÕES UTILITÁRIAS =====
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