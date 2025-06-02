import { z } from 'zod';

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
  .max(254, 'E-mail muito longo');

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

export const enderecoSchema = z.object({
  logradouro: z.string().min(1, 'Logradouro é obrigatório').transform(val => val.trim()),
  bairro: z.string().min(1, 'Bairro é obrigatório').transform(val => val.trim()),
  numero: numberSchema,
  cidade: z.string().min(1, 'Cidade é obrigatória').transform(val => val.trim()),
  uf: ufSchema
});

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
    email: z.string().email().transform(val => val.toLowerCase()),
    situacao: z.literal('ATIVO'),
    id_secretaria: z.string().uuid('ID da secretaria deve ser um UUID válido')
  });

export type ProfessorFormData = z.infer<typeof professorFormSchema>;
export type ProfessorDTO = z.infer<typeof professorDTOSchema>;

export const strongPasswordSchema = passwordSchema
  .min(6, 'Senha deve ter pelo menos 6 caracteres')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
    'Senha deve conter pelo menos uma letra minúscula, uma maiúscula, um número e um caractere especial'
  );