import { z } from 'zod';

export const StatusEntregaEnum = z.enum(['PENDENTE', 'ENTREGUE', 'AVALIADO'], {
  errorMap: () => ({ message: 'Status deve ser PENDENTE, ENTREGUE ou AVALIADO' }),
});

const nomeAtividadeValidator = z
  .string()
  .min(3, 'Nome da atividade deve ter pelo menos 3 caracteres')
  .max(200, 'Nome da atividade deve ter no máximo 200 caracteres')
  .trim();

const descricaoValidator = z
  .string()
  .min(10, 'Descrição deve ter pelo menos 10 caracteres')
  .max(2000, 'Descrição deve ter no máximo 2000 caracteres')
  .trim();

const pesoValidator = z
  .union([
    z.string().min(1, 'Peso é obrigatório'),
    z.number().min(0.1).max(10),
  ])
  .transform((val) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num) || num < 0.1 || num > 10) {
      throw new Error('Peso deve ser um número entre 0.1 e 10');
    }
    return num;
  });

const notaValidator = z
  .number()
  .min(0, 'Nota não pode ser negativa')
  .max(10, 'Nota não pode ser maior que 10');

const dataEntregaValidator = z
  .string()
  .min(1, 'Data de entrega é obrigatória')
  .refine((date) => {
    const dataEntrega = new Date(date);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return dataEntrega >= hoje;
  }, 'Data de entrega não pode ser no passado');

// ===== SCHEMA DO FORMULÁRIO =====
export const atividadeFormSchema = z.object({
  nome: nomeAtividadeValidator,
  descricao: descricaoValidator,
  dataEntrega: dataEntregaValidator,
  peso: pesoValidator,
  idTurma: z.string().min(1, 'Turma é obrigatória'),
  idDisciplina: z.string().min(1, 'Disciplina é obrigatória'),
});

// ===== SCHEMA DO DTO PARA CRIAÇÃO =====
export const atividadeCreateDTOSchema = z.object({
  nome: z.string().min(3).max(200),
  descricao: z.string().min(10).max(2000),
  dataEntrega: z.string(),
  peso: z.number().min(0.1).max(10),
});

// ===== SCHEMA DA ENTREGA DO ALUNO =====
export const entregaAlunoSchema = z.object({
  idAluno: z.string(),
  nomeAluno: z.string(),
  nota: z.number().optional(),
  dataEntrega: z.string().optional(),
  status: StatusEntregaEnum,
});

// ===== SCHEMA DA ATIVIDADE COMPLETA =====
export const atividadeResponseSchema = z.object({
  idAtividade: z.string(),
  nome: z.string(),
  descricao: z.string(),
  dataEntrega: z.string(),
  peso: z.number(),
  turma: z.object({
    idTurma: z.string(),
    nome: z.string(),
  }),
  disciplina: z.object({
    idDisciplina: z.string(),
    nome: z.string(),
  }),
  entregas: z.array(entregaAlunoSchema).optional(),
});

// ===== SCHEMA PARA AVALIAÇÃO =====
export const avaliacaoEntregaSchema = z.object({
  idAtividade: z.string().min(1, 'ID da atividade é obrigatório'),
  idAluno: z.string().min(1, 'ID do aluno é obrigatório'),
  nota: notaValidator,
});

// ===== SCHEMA DA TURMA (SIMPLIFICADO) =====
export const turmaOptionSchema = z.object({
  idTurma: z.string(),
  nome: z.string(),
  curso: z.string().optional(),
});

// ===== SCHEMA DA DISCIPLINA (SIMPLIFICADO) =====
export const disciplinaOptionSchema = z.object({
  idDisciplina: z.string(),
  nome: z.string(),
});

// ===== TIPOS DERIVADOS =====
export type StatusEntregaType = z.infer<typeof StatusEntregaEnum>;
export type AtividadeFormData = z.infer<typeof atividadeFormSchema>;
export type AtividadeCreateDTO = z.infer<typeof atividadeCreateDTOSchema>;
export type EntregaAluno = z.infer<typeof entregaAlunoSchema>;
export type AtividadeResponse = z.infer<typeof atividadeResponseSchema>;
export type AvaliacaoEntregaData = z.infer<typeof avaliacaoEntregaSchema>;
export type TurmaOption = z.infer<typeof turmaOptionSchema>;
export type DisciplinaOption = z.infer<typeof disciplinaOptionSchema>;

// ===== INTERFACES ADICIONAIS =====
export interface AtividadeFilters {
  turmaId?: string;
  disciplinaId?: string;
  status?: StatusEntregaType;
  dataInicio?: string;
  dataFim?: string;
}

export interface AtividadeStats {
  totalAtividades: number;
  atividadesPendentes: number;
  atividadesAvaliadas: number;
  mediaNotas: number;
}

export interface EntregaStats {
  totalAlunos: number;
  entregasRecebidas: number;
  entregasAvaliadas: number;
  entregasPendentes: number;
  mediaGeral: number;
}

// ===== FUNÇÕES DE VALIDAÇÃO =====
export const validateAtividadeForm = (data: unknown) => {
  return atividadeFormSchema.safeParse(data);
};

export const validateAtividadeCreateDTO = (data: unknown) => {
  return atividadeCreateDTOSchema.safeParse(data);
};

export const validateAvaliacaoEntrega = (data: unknown) => {
  return avaliacaoEntregaSchema.safeParse(data);
};

// ===== TRANSFORMADORES =====
export const transformAtividadeFormToDTO = (
  formData: AtividadeFormData
): AtividadeCreateDTO => {
  return {
    nome: formData.nome.trim(),
    descricao: formData.descricao.trim(),
    dataEntrega: formData.dataEntrega,
    peso: typeof formData.peso === 'string' ? parseFloat(formData.peso) : formData.peso,
  };
};

// ===== UTILITÁRIOS =====
export const getStatusColor = (status: StatusEntregaType): string => {
  const colors = {
    PENDENTE: 'text-gray-600',
    ENTREGUE: 'text-blue-600',
    AVALIADO: 'text-green-600',
  };
  return colors[status];
};

export const getStatusBadgeColor = (status: StatusEntregaType): string => {
  const colors = {
    PENDENTE: 'bg-gray-100 text-gray-800',
    ENTREGUE: 'bg-blue-100 text-blue-800',
    AVALIADO: 'bg-green-100 text-green-800',
  };
  return colors[status];
};

export const formatDataEntrega = (data: string): string => {
  return new Date(data).toLocaleDateString('pt-BR');
};

export const isDataEntregaVencida = (dataEntrega: string): boolean => {
  return new Date(dataEntrega) < new Date();
};

export const calcularEstatisticasEntregas = (entregas: EntregaAluno[]): EntregaStats => {
  const totalAlunos = entregas.length;
  const entregasRecebidas = entregas.filter(e => e.status !== 'PENDENTE').length;
  const entregasAvaliadas = entregas.filter(e => e.status === 'AVALIADO').length;
  const entregasPendentes = entregas.filter(e => e.status === 'PENDENTE').length;
  
  const notasValidas = entregas
    .filter(e => e.nota !== undefined && e.nota !== null)
    .map(e => e.nota!);
  
  const mediaGeral = notasValidas.length > 0 
    ? notasValidas.reduce((acc, nota) => acc + nota, 0) / notasValidas.length 
    : 0;

  return {
    totalAlunos,
    entregasRecebidas,
    entregasAvaliadas,
    entregasPendentes,
    mediaGeral: Math.round(mediaGeral * 100) / 100, // 2 casas decimais
  };
};