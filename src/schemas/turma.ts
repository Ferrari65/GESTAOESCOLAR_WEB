import { z } from 'zod';
import { SituacaoEnum, TurnoEnum} from './shared';

// ===== SCHEMAS DE TURMA =====

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
  turno: TurnoEnum,
});

export const turmaDTOSchema = z.object({
  nome: z.string().min(3).max(100),
  ano: z.string().regex(/^\d{4}$/),
  turno: TurnoEnum,
});

export const turmaResponseSchema = z.object({
  idTurma: z.string(),
  nome: z.string(),
  ano: z.string(),
  turno: TurnoEnum,
  idCurso: z.string(),
  idSecretaria: z.string(),
  situacao: SituacaoEnum,
  dataCreacao: z.string().optional(),
});

// ===== TIPOS DE TURMA =====
export type TurmaFormData = z.infer<typeof turmaFormSchema>;
export type TurmaDTO = z.infer<typeof turmaDTOSchema>;
export type TurmaResponse = z.infer<typeof turmaResponseSchema>;

// ===== VALIDADORES =====
export const validateTurmaForm = (data: unknown) => {
  return turmaFormSchema.safeParse(data);
};

export const validateTurmaDTO = (data: unknown) => {
  return turmaDTOSchema.safeParse(data);
};

export const validateTurmaResponse = (data: unknown) => {
  return turmaResponseSchema.safeParse(data);
};