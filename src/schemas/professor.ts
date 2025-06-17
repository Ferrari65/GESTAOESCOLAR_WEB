import { z } from 'zod';

// ===== VALIDADORES =====
const validateCPF = (cpf: string): boolean => {
  if (!cpf || typeof cpf !== 'string') return false;
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  return true; // simplified
};

const validatePhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  const cleanPhone = phone.replace(/[^\d]/g, '');
  return cleanPhone.length === 10 || cleanPhone.length === 11;
};

const optionalField = <T extends z.ZodType>(
  schema: T, 
  emptyMessage?: string
) => 
  schema
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? undefined : val);

const optionalStringField = (
  minLength: number = 1,
  maxLength: number = 255,
  emptyMessage?: string
) => 
  optionalField(
    z.string()
      .min(minLength, `Deve ter pelo menos ${minLength} caracteres`)
      .max(maxLength, `Deve ter no máximo ${maxLength} caracteres`)
      .trim(),
    emptyMessage
  );

const optionalValidatedField = <T>(
  validator: (val: T) => boolean,
  errorMessage: string,
  transformer?: z.ZodType<T>
) => 
  (transformer || z.string())
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? undefined : val)
    .refine(val => val === undefined || validator(val as T), {
      message: errorMessage + ' (quando preenchido)'
    });

// ===== ENUMS =====
export const SituacaoTypeEnum = z.enum(['ATIVO', 'INATIVO']);
export const SexoEnum = z.enum(['M', 'F']);

// ===== SCHEMA PARA CADASTRO ====
export const professorCadastroSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100).trim(),
  cpf: z.string().min(1, 'CPF é obrigatório').refine(validateCPF, 'CPF inválido'),
  email: z.string().email('Email inválido').max(254).toLowerCase().trim(),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').max(50),
  telefone: z.string().min(1, 'Telefone é obrigatório').refine(validatePhone, 'Telefone inválido'),
  data_nasc: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)'),
  sexo: SexoEnum,
  logradouro: z.string().min(1, 'Logradouro é obrigatório').trim(),
  bairro: z.string().min(1, 'Bairro é obrigatório').trim(),
  numero: z.string().min(1, 'Número é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória').trim(),
  uf: z.string().length(2, 'UF deve ter 2 caracteres').toUpperCase(),
});

export const alunoCadastroSchema = professorCadastroSchema.extend({
  matricula: z.string()
    .min(1, 'Matrícula é obrigatória')
    .max(20, 'Matrícula deve ter no máximo 20 caracteres')
    .trim()
    .regex(/^[0-9]+$/, 'Matrícula deve conter apenas números')
    .transform(val => val.toUpperCase()),

    id_turma: z.string()
    .min(1, 'turma é obrigatório')
    
})

// ===== SCHEMA PARA EDIÇÃO =====
export const professorEdicaoSchema = z.object({

  nome: optionalStringField(2, 100),
  email: optionalField(
    z.string().email('Email inválido').max(254).toLowerCase().trim()
  ),
  telefone: optionalValidatedField(validatePhone, 'Telefone inválido'),
  data_nasc: optionalField(
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)')
  ),
  sexo: optionalField(SexoEnum),
  

  logradouro: optionalStringField(1, 255),
  bairro: optionalStringField(1, 255),
  numero: optionalStringField(1, 10),
  cidade: optionalStringField(1, 255),
  uf: optionalField(
    z.string().length(2, 'UF deve ter 2 caracteres').toUpperCase()
  ),
  
  cpf: z.string().optional(), 
  senha: optionalField(
    z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').max(50)
  ),
});

// ===== DTOs  BACKEND =====
export const professorCreateDTOSchema = z.object({
  nome: z.string(),
  CPF: z.string(),
  situacao: SituacaoTypeEnum,
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

export const professorUpdateDTOSchema = z.object({
  nome: z.string().optional(),
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

export const alunoCreateDTOSchema = professorCreateDTOSchema
 .omit({ id_secretaria: true})
 .extend({
  matricula: z.string(),
 });

 export const alunoResponseSchema = professorResponseSchema
 .omit({ id_professor: true})
 .extend({
  id_aluno: z.string(),
  matricula: z.string(),
  id_turma: z.string(),
 });

// ===== TIPOS =====
export type ProfessorCadastroData = z.infer<typeof professorCadastroSchema>;
export type ProfessorEdicaoData = z.infer<typeof professorEdicaoSchema>;
export type ProfessorCreateDTO = z.infer<typeof professorCreateDTOSchema>;
export type ProfessorUpdateDTO = z.infer<typeof professorUpdateDTOSchema>;
export type ProfessorResponse = z.infer<typeof professorResponseSchema>;
export type SituacaoType = z.infer<typeof SituacaoTypeEnum>;

export type AlunoCadastroData = z.infer<typeof alunoCadastroSchema>;
export type AlunoCreateDTO = z.infer<typeof alunoCreateDTOSchema>;

// ===== UTILITÁRIOS =====
export const cleanCPF = (cpf: string): string => cpf.replace(/[^\d]/g, '');
export const cleanPhone = (phone: string): string => phone.replace(/[^\d]/g, '');
export type AlunoResponse = z.infer<typeof alunoResponseSchema>;

export const formatCPF = (cpf: string): string => {
  const clean = cleanCPF(cpf);
  if (clean.length !== 11) return cpf;
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatPhone = (phone: string): string => {
  const clean = cleanPhone(phone);
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
};