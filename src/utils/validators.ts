import { z } from 'zod';

// ===== FUNÇÕES DE VALIDAÇÃO BASE =====

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
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
};

const validatePhone = (phone: string): boolean => {
  if (!phone) return false;
  
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  if (cleanPhone.length !== 10 && cleanPhone.length !== 11) return false;
  
  const areaCode = cleanPhone.substring(0, 2);
  const areaCodeNum = parseInt(areaCode);
  if (areaCodeNum < 11 || areaCodeNum > 99) return false;
  
  if (cleanPhone.length === 11) {
    if (cleanPhone.charAt(2) !== '9') return false;
  }
  
  return true;
};

// ===== SCHEMAS BASE =====

export const cpfSchema = z
  .string()
  .min(1, 'CPF é obrigatório')
  .refine(validateCPF, 'CPF inválido');

export const phoneSchema = z
  .string()
  .min(1, 'Telefone é obrigatório')
  .refine(validatePhone, 'Telefone deve ter 10 ou 11 dígitos e ser válido');

export const emailSchema = z
  .string()
  .min(1, 'E-mail é obrigatório')
  .email('E-mail inválido')
  .max(254, 'E-mail muito longo')
  .transform(val => val.toLowerCase()); 

export const passwordSchema = z
  .string()
  .min(1, 'Senha é obrigatória')
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número');

export const nameSchema = z
  .string()
  .min(1, 'Nome é obrigatório')
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços')
  .transform(val => val.trim());

// SCHEMA PARA NÚMEROS QUE PERMANECEM COMO STRING
export const numeroStringSchema = z
  .string()
  .min(1, 'Número é obrigatório')
  .regex(/^\d+$/, 'Número deve conter apenas dígitos')
  .refine(val => {
    const num = parseInt(val, 10);
    return num > 0 && num <= 99999;
  }, 'Número deve ser entre 1 e 99999')
  .transform(val => val.trim());

// SCHEMA PARA NÚMEROS QUE VIRAM NUMBER (para outros usos)
export const numberSchema = z
  .string()
  .min(1, 'Número é obrigatório')
  .regex(/^\d+$/, 'Número deve conter apenas dígitos')
  .transform(val => parseInt(val, 10))
  .refine(val => val > 0 && val <= 99999, 'Número deve ser entre 1 e 99999');

export const dateSchema = z
  .string()
  .min(1, 'Data é obrigatória')
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
  .refine(date => {
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime()) && dateObj.toISOString().startsWith(date);
  }, 'Data inválida');

export const ufSchema = z
  .string()
  .min(1, 'UF é obrigatória')
  .length(2, 'UF deve ter 2 caracteres')
  .regex(/^[A-Z]{2}$/, 'UF deve conter apenas letras maiúsculas')
  .transform(val => val.toUpperCase());

export const sexoSchema = z
  .enum(['M', 'F'], {
    errorMap: () => ({ message: 'Sexo deve ser M ou F' })
  })
  .transform(val => val.toUpperCase() as 'M' | 'F');

// ===== SCHEMAS COMPOSTOS =====

export const enderecoSchema = z.object({
  logradouro: z.string().min(1, 'Logradouro é obrigatório').transform(val => val.trim()),
  bairro: z.string().min(1, 'Bairro é obrigatório').transform(val => val.trim()),
  numero: numeroStringSchema, // <- MUDANÇA AQUI: usa o schema que mantém string
  cidade: z.string().min(1, 'Cidade é obrigatória').transform(val => val.trim()),
  uf: ufSchema
});

// ===== SCHEMAS DE PROFESSOR =====

export const professorFormSchema = z.object({
  nome: nameSchema,
  cpf: cpfSchema,
  email: emailSchema,
  senha: passwordSchema,
  telefone: phoneSchema,
  data_nasc: dateSchema,
  sexo: sexoSchema,
  ...enderecoSchema.shape
});

export const professorDTOSchema = professorFormSchema
  .omit({ cpf: true, telefone: true, email: true })
  .extend({
    CPF: z.string().length(11).regex(/^\d{11}$/),
    telefone: z.string().min(10).max(11).regex(/^\d+$/),
    email: emailSchema, 
    situacao: z.literal('ATIVO'),
    id_secretaria: z.string().uuid('ID da secretaria deve ser um UUID válido')
  });

// ===== SCHEMAS DE AUTENTICAÇÃO =====

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória')
});

export const resetPasswordSchema = z.object({
  email: emailSchema
});

export const newPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword']
});

// ===== TIPOS DERIVADOS =====

export type ProfessorFormData = z.infer<typeof professorFormSchema>;
export type ProfessorDTO = z.infer<typeof professorDTOSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type NewPasswordFormData = z.infer<typeof newPasswordSchema>;

// ===== FUNÇÕES DE VALIDAÇÃO =====

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

export const validateProfessorForm = (data: unknown) => {
  return validateSchema(professorFormSchema, data);
};

export const validateProfessorDTO = (data: unknown) => {
  return validateSchema(professorDTOSchema, data);
};

// ===== EXPORTS DE CONVENIÊNCIA =====

export { validateCPF, validatePhone };

// ===== CONSTANTES DE VALIDAÇÃO PARA REACT HOOK FORM =====

export const cpfValidation = {
  required: 'CPF é obrigatório',
  validate: (value: string) => validateCPF(value) || 'CPF inválido'
};

export const phoneValidation = {
  required: 'Telefone é obrigatório',
  validate: (value: string) => validatePhone(value) || 'Telefone deve ter 10 ou 11 dígitos e ser válido'
};

export const emailValidation = {
  required: 'E-mail é obrigatório',
  pattern: {
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'E-mail inválido'
  },
  maxLength: {
    value: 254,
    message: 'E-mail muito longo'
  }
};