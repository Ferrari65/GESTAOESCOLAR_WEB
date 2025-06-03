import { z } from 'zod';

export const cursoFormSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),

  duracao: z
    .string()
    .min(1, 'Duração é obrigatória')
    .refine((val) => {
      const num = parseInt(val, 10);
      return !isNaN(num) && num > 0;
    }, 'Duração deve ser um número positivo')
    .refine((val) => {
      const num = parseInt(val, 10);
      return num <= 60;
    }, 'Duração deve ser menor que 60 meses')
    .refine((val) => {
      const num = parseInt(val, 10);
      return num >= 1;
    }, 'Duração deve ser maior que 0'),
    
  turno: z
    .string()
    .min(1, 'Turno é obrigatório')
    .refine((val) => 
      val === 'DIURNO' || val === 'NOTURNO', 
      'Turno deve ser DIURNO ou NOTURNO'
    )
});

export const cursoDTOSchema = z.object({
  nome: z.string().min(1).max(100),
  duracao: z.number().int().positive().max(60),  
  id_secretaria: z.string().min(1, 'ID da secretaria é obrigatório'),
  turno: z.string().min(1),
  situacao: z.string().default('ATIVO'),
  data_alteracao: z.string()
});

export const cursoResponseSchema = z.object({
  id_curso: z.string(), 
  nome: z.string(),
  duracao: z.number(),  
  id_secretaria: z.string(), 
  turno: z.string(), 
  situacao: z.string(), 
  data_alteracao: z.string()
});

export type CursoFormData = z.infer<typeof cursoFormSchema>;
export type CursoDTO = z.infer<typeof cursoDTOSchema>;
export type CursoResponse = z.infer<typeof cursoResponseSchema>;

export const validateCursoForm = (data: unknown) => {
  return cursoFormSchema.safeParse(data);
};

export const validateCursoDTO = (data: unknown) => {
  return cursoDTOSchema.safeParse(data);
};