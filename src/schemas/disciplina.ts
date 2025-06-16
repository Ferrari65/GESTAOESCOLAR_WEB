import { z } from 'zod';
import { SituacaoEnum, cargaHorariaValidator } from './shared';

// ===== SCHEMAS DE DISCIPLINA =====

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

export const disciplinaDTOSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  ementa: z.string().min(1, 'Ementa é obrigatória'),
  cargaHoraria: z.number().int().positive().min(1, 'Carga horária é obrigatória'),
  id_secretaria: z.string()
});

export const disciplinaResponseSchema = z.object({
  idDisciplina: z.string(),
  nome: z.string(),
  ementa: z.string(),
  cargaHoraria: z.number().int().positive(),
  idSecretaria: z.string(),
  situacao: SituacaoEnum,
});

// ===== TIPOS DE DISCIPLINA =====
export type DisciplinaFormData = z.infer<typeof disciplinaFormSchema>;
export type DisciplinaDTO = z.infer<typeof disciplinaDTOSchema>;
export type DisciplinaResponse = z.infer<typeof disciplinaResponseSchema>;

// ===== VALIDADORES =====
export const validateDisciplinaForm = (data: unknown) => {
  return disciplinaFormSchema.safeParse(data);
};

export const validateDisciplinaDTO = (data: unknown) => {
  return disciplinaDTOSchema.safeParse(data);
};

export const validateDisciplinaResponse = (data: unknown) => {
  return disciplinaResponseSchema.safeParse(data);
};