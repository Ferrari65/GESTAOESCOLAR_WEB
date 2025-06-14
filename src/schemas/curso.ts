import { z } from 'zod';
import { SituacaoEnum, duracaoValidator, type SituacaoType } from './shared';

// ===== SCHEMAS DE CURSO =====

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
  situacao: SituacaoEnum.default('ATIVO'),
  data_alteracao: z.string().optional(),
});

export const cursoEditarDTOSchema = z.object({
  nome: z.string().optional(),
  duracao: z.number().optional(), 
  situacao: SituacaoEnum.optional(),
  id_secretaria: z.string().optional(),
});

export const cursoResponseSchema = z.object({
  idCurso: z.string(),
  nome: z.string(),
  duracao: z.number(),  
  id_secretaria: z.string(), 
  situacao: SituacaoEnum,
  data_alteracao: z.string().optional(),
});

// ===== TIPOS DE CURSO =====
export type CursoFormData = z.infer<typeof cursoFormSchema>;
export type CursoDTO = z.infer<typeof cursoDTOSchema>;
export type CursoEditarDTO = z.infer<typeof cursoEditarDTOSchema>;
export type CursoResponse = z.infer<typeof cursoResponseSchema>;

// ===== VALIDADORES =====
export const validateCursoForm = (data: unknown) => {
  return cursoFormSchema.safeParse(data);
};

export const validateCursoDTO = (data: unknown) => {
  return cursoDTOSchema.safeParse(data);
};

export const validateCursoResponse = (data: unknown) => {
  return cursoResponseSchema.safeParse(data);
};