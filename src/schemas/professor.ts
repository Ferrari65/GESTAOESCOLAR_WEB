import { z } from 'zod';

const validateCPF = (cpf: string): boolean => {
  if (!cpf || typeof cpf !== 'string') return false;
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
  if (!phone || typeof phone !== 'string') return false;
  const cleanPhone = phone.replace(/[^\d]/g, '');
  if (cleanPhone.length !== 10 && cleanPhone.length !== 11) return false;
  const areaCode = parseInt(cleanPhone.substring(0, 2));
  if (areaCode < 11 || areaCode > 99) return false;
  if (cleanPhone.length === 11 && cleanPhone.charAt(2) !== '9') return false;
  return true;
};

const validateBirthDate = (dateString: string): boolean => {
  if (!dateString || typeof dateString !== 'string') return false;
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;
  
  const today = new Date();
  const minAge = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
  const maxAge = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
  
  return date >= minAge && date <= maxAge;
};

export const SituacaoTypeEnum = z.enum(['ATIVO', 'INATIVO'], {
  errorMap: () => ({ message: 'Situação deve ser ATIVO ou INATIVO' }),
});

export const SexoEnum = z.enum(['M', 'F'], {
  errorMap: () => ({ message: 'Selecione o sexo' }),
});

const professorBaseFields = {
  nome: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo')
    .trim(),
  email: z.string()
    .trim()
    .min(1, 'Email é obrigatório')
    .email('Digite um email válido')
    .max(254, 'Email muito longo')
    .toLowerCase(),
  telefone: z.string()
    .min(1, 'Telefone é obrigatório')
    .refine(validatePhone, 'Telefone inválido'),
  data_nasc: z.string()
    .min(1, 'Data de nascimento é obrigatória')
    .refine(validateBirthDate, 'Data de nascimento inválida (deve ter entre 16 e 120 anos)'),
  sexo: SexoEnum,
  logradouro: z.string().min(1, 'Logradouro é obrigatório').trim(),
  bairro: z.string().min(1, 'Bairro é obrigatório').trim(),
  numero: z.string().min(1, 'Número é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória').trim(),
  uf: z.string().length(2, 'UF deve ter 2 caracteres').toUpperCase(),
};

export const professorCadastroSchema = z.object({
  ...professorBaseFields,
  cpf: z.string()
    .min(1, 'CPF é obrigatório')
    .refine(validateCPF, 'CPF inválido'),
  senha: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(50, 'Senha muito longa'),
});

export const professorEdicaoSchema = z.object({
  ...professorBaseFields,
  cpf: z.string().optional(),
  senha: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(50, 'Senha muito longa')
    .optional()
    .or(z.literal('')), 
});

// ===== SCHEMAS PARA DTOs DO BACKEND JAVA =====
export const professorCreateDTOSchema = z.object({
  nome: z.string(),
  CPF: z.string(),
  situacao: SituacaoTypeEnum,           //
  logradouro: z.string(),
  bairro: z.string(),
  numero: z.number().positive(),
  cidade: z.string(),
  UF: z.string(),
  email: z.string(),
  senha: z.string(),
  telefone: z.string(),
  sexo: z.string(),
  data_nasc: z.string(),             
  id_secretaria: z.string(),
});

// DTO para EDITAR professor (campos opcionais)
export const professorUpdateDTOSchema = z.object({
  nome: z.string().optional(),
  // CPF: não incluímos - não pode ser alterado
  situacao: SituacaoTypeEnum.optional(),
  logradouro: z.string().optional(),
  bairro: z.string().optional(),
  numero: z.number().optional(),
  cidade: z.string().optional(),
  UF: z.string().optional(),
  email: z.string().optional(),
  senha: z.string().optional(),
  telefone: z.string().optional(),
  sexo: z.string().optional(),
  data_nasc: z.string().optional(),  
  id_secretaria: z.string().optional(),
});

export const professorResponseSchema = z.object({
  id_professor: z.string(),
  nome: z.string(),
  email: z.string(),
  cpf: z.string(),
  telefone: z.string(),
  situacao: SituacaoTypeEnum,
  logradouro: z.string(),
  bairro: z.string(),
  numero: z.number(),
  cidade: z.string(),
  uf: z.string(),
  sexo: z.string(),
  data_nasc: z.string(),
});

// ===== TIPOS =====
export type ProfessorCadastroData = z.infer<typeof professorCadastroSchema>;
export type ProfessorEdicaoData = z.infer<typeof professorEdicaoSchema>;
export type ProfessorFormData = ProfessorCadastroData | ProfessorEdicaoData;

export type ProfessorCreateDTO = z.infer<typeof professorCreateDTOSchema>;
export type ProfessorUpdateDTO = z.infer<typeof professorUpdateDTOSchema>;
export type ProfessorResponse = z.infer<typeof professorResponseSchema>;
export type SituacaoType = z.infer<typeof SituacaoTypeEnum>;

export type ProfessorDTO = ProfessorCreateDTO;     
export type ProfessorEditarDTO = ProfessorUpdateDTO; 

// ===== FUNÇÕES UTILITÁRIAS =====
export const cleanCPF = (cpf: string): string => {
  if (!cpf || typeof cpf !== 'string') return '';
  return cpf.replace(/[^\d]/g, '');
};

export const cleanPhone = (phone: string): string => {
  if (!phone || typeof phone !== 'string') return '';
  return phone.replace(/[^\d]/g, '');
};

export const formatCPF = (cpf: string): string => {
  if (!cpf || typeof cpf !== 'string') return '';
  const clean = cleanCPF(cpf);
  if (clean.length !== 11) return cpf;
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatPhone = (phone: string): string => {
  if (!phone || typeof phone !== 'string') return '';
  const clean = cleanPhone(phone);
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
};

// ===== FUNÇÕES DE VALIDAÇÃO =====
export const validateProfessorCreateDTO = (data: unknown) => {
  return professorCreateDTOSchema.safeParse(data);
};

export const validateProfessorUpdateDTO = (data: unknown) => {
  return professorUpdateDTOSchema.safeParse(data);
};