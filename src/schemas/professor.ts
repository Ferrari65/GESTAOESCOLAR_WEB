import { z } from 'zod';
import { 
  SituacaoEnum, 
  SexoEnum,
  nomeValidator,
  cpfValidator,
  emailValidator,
  passwordValidator,
  phoneValidator,
  dataValidator,
  ufValidator,
  validateCPF,
  validatePhone,
  formatCPF,
  formatPhone,
  cleanCPF,
  cleanPhone,
  type SituacaoType,
  type SexoType
} from './shared';

// ===== VALIDADORES OPCIONAIS PARA EDIÇÃO =====
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

// ===== SCHEMAS DE PROFESSOR =====

export const professorCadastroSchema = z.object({
  nome: nomeValidator,
  cpf: cpfValidator,
  email: emailValidator,
  senha: passwordValidator,
  telefone: phoneValidator,
  data_nasc: dataValidator,
  sexo: SexoEnum,
  logradouro: z.string().min(1, 'Logradouro é obrigatório').trim(),
  bairro: z.string().min(1, 'Bairro é obrigatório').trim(),
  numero: z.string().min(1, 'Número é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória').trim(),
  uf: ufValidator,
});

export const professorEdicaoSchema = z.object({
  // Campos opcionais para edição
  nome: optionalStringField(2, 100),
  email: optionalField(emailValidator),
  telefone: optionalValidatedField(validatePhone, 'Telefone inválido'),
  data_nasc: optionalField(dataValidator),
  sexo: optionalField(SexoEnum),
  
  // Endereço opcional
  logradouro: optionalStringField(1, 255),
  bairro: optionalStringField(1, 255),
  numero: optionalStringField(1, 10),
  cidade: optionalStringField(1, 255),
  uf: optionalField(ufValidator),
  
  // Campos que não podem ser editados ou são opcionais
  cpf: z.string().optional(), 
  senha: optionalField(passwordValidator),
});

// ===== DTOs PARA BACKEND =====
export const professorCreateDTOSchema = z.object({
  nome: z.string(),
  CPF: z.string(),
  situacao: SituacaoEnum,
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
  situacao: SituacaoEnum.optional(),
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
  situacao: SituacaoEnum,
  logradouro: z.string(),
  bairro: z.string(),
  numero: z.number(),
  cidade: z.string(),
  uf: z.string(),
  sexo: z.string(),
  data_nasc: z.string(),
});

// ===== TIPOS DE PROFESSOR =====
export type ProfessorCadastroData = z.infer<typeof professorCadastroSchema>;
export type ProfessorEdicaoData = z.infer<typeof professorEdicaoSchema>;
export type ProfessorCreateDTO = z.infer<typeof professorCreateDTOSchema>;
export type ProfessorUpdateDTO = z.infer<typeof professorUpdateDTOSchema>;
export type ProfessorResponse = z.infer<typeof professorResponseSchema>;

// ===== VALIDADORES =====
export const validateProfessorCadastro = (data: unknown) => {
  return professorCadastroSchema.safeParse(data);
};

export const validateProfessorEdicao = (data: unknown) => {
  return professorEdicaoSchema.safeParse(data);
};

export const validateProfessorResponse = (data: unknown) => {
  return professorResponseSchema.safeParse(data);
};

// ===== RE-EXPORTAR UTILITÁRIOS =====
export { 
  validateCPF, 
  validatePhone, 
  cleanCPF, 
  cleanPhone, 
  formatCPF, 
  formatPhone,
  type SituacaoType,
  type SexoType
};