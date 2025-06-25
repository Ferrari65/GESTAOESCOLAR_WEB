import { z } from 'zod';

// ===== SENHAS  BLOQUEADAS =====
const COMMON_PASSWORDS = [
  '123456', 'password', '123456789', '12345678', '12345',
  '1234567', '1234567890', 'qwerty', 'abc123', '111111',
  'password1', 'admin', 'letmein', 'welcome', 'monkey'
];

// ===== VALIDADORES  =====
const validateCPF = (cpf: string): boolean => {
  const clean = cpf.replace(/[^\d]/g, '');
  if (clean.length !== 11 || /^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(clean.charAt(i)) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(clean.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(clean.charAt(i)) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(clean.charAt(10));
};

const validatePhone = (phone: string): boolean => {
  const clean = phone.replace(/[^\d]/g, '');
  if (clean.length !== 10 && clean.length !== 11) return false;
  if (clean.length === 11 && clean.charAt(2) !== '9') return false;
  return true;
};

// ===== ENUMS  =====
export const SituacaoTypeEnum = z.enum(['ATIVO', 'INATIVO'], {
  errorMap: () => ({ message: 'Situação deve ser ATIVO ou INATIVO' }),
});

export const TurnoTypeEnum = z.enum(['DIURNO', 'NOTURNO'], {
  errorMap: () => ({ message: 'Turno deve ser DIURNO ou NOTURNO' }),
});

// ===== VALIDAÇÕES REUTILIZÁVEIS =====
export const nameValidator = z.string()
  .trim()
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(100, 'Nome muito longo');

export const cpfValidator = z.string()
  .trim()
  .refine(validateCPF, 'CPF inválido');

export const phoneValidator = z.string()
  .trim()
  .refine(validatePhone, 'Telefone inválido');

export const emailValidator = z.string()
  .trim()
  .toLowerCase()
  .min(5, 'Email é obrigatório')
  .max(254, 'Email muito longo')
  .email('Digite um email válido');

export const passwordValidator = z.string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .max(50, 'Senha muito longa')
  .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
  .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
  .regex(/\d/, 'A senha deve conter pelo menos um número')
  .refine(pwd => !COMMON_PASSWORDS.includes(pwd.toLowerCase()), 'Esta senha é muito comum, escolha outra');

export const duracaoValidator = z.number()
  .int()
  .min(1, 'Duração deve ser no mínimo 1 mês')
  .max(60, 'Duração máxima de 60 meses');

export const cargaHorariaValidator = z.number()
  .int()
  .positive('Carga horária deve ser um número positivo')
  .max(1000, 'Carga horária excessiva');

// ===== AUTENTICAÇÃO =====
export const loginSchema = z.object({
  email: emailValidator,
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const developmentLoginSchema = loginSchema;

export const resetPasswordSchema = z.object({
  email: emailValidator,
  password: passwordValidator,
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

// ===== CURSO =====
export const cursoFormSchema = z.object({
  nome: nameValidator.min(3, 'Nome do curso deve ter pelo menos 3 caracteres'),
  duracao: duracaoValidator,
});

export const cursoDTOSchema = cursoFormSchema.extend({
  id_secretaria: z.string().min(1, 'ID da secretaria é obrigatório'),
  situacao: SituacaoTypeEnum.default('ATIVO'),
  data_alteracao: z.string().optional(),
});

export const cursoEditarDTOSchema = cursoDTOSchema.partial();

export const cursoResponseSchema = cursoDTOSchema.extend({
  idCurso: z.string(),
});

// ===== DISCIPLINA =====
export const disciplinaFormSchema = z.object({
  nome: nameValidator,
  ementa: z.string().trim().min(1, 'Ementa é obrigatória').max(1000, 'Ementa muito longa'),
  cargaHoraria: cargaHorariaValidator,
});

export const disciplinaDTO = disciplinaFormSchema.extend({
  id_secretaria: z.string().min(1, 'ID da secretaria é obrigatório'),
});

export const disciplinaResponse = disciplinaDTO.extend({
  idDisciplina: z.string(),
  situacao: SituacaoTypeEnum,
});

// ===== TURMA =====
export const turmaFormSchema = z.object({
  nome: nameValidator.min(3, 'Nome da turma deve ter pelo menos 3 caracteres'),
  id_curso: z.string().min(1, 'Curso é obrigatório'),
  ano: z.string().regex(/^\d{4}$/, 'Ano deve conter 4 dígitos'),
  turno: TurnoTypeEnum,
});

export const turmaDTOSchema = turmaFormSchema.omit({ id_curso: true });

export const turmaListItemSchema = z.object({
  id: z.string(),
  idTurma: z.string().optional(),
  nome: z.string(),
  ano: z.string(),
  turno: TurnoTypeEnum,
  nomeCurso: z.string().optional(),
  curso: z.object({
    nome: z.string(),
  }).optional(),
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
export type TurmaListItem = z.infer<typeof turmaListItemSchema>;

// ===== FUNÇÕES DE VALIDAÇÃO =====
export const validateSchema = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  const result = schema.safeParse(data);
  return {
    success: result.success,
    data: result.success ? result.data : undefined,
    errors: !result.success ? result.error.errors.map(e => e.message) : undefined,
  };
};

// ===== VERIFICAÇÃO DE SENHA =====
export const checkPasswordStrength = (password: string) => {
  const checks = {
    length: password.length >= 8,
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    notCommon: !COMMON_PASSWORDS.includes(password.toLowerCase()),
  };

  const score = Object.values(checks).filter(Boolean).length;
  const level = score <= 2 ? 'fraca' : score <= 4 ? 'média' : 'forte';

  return { score, level, isStrong: score >= 4 };
};
