// src/types/secretariaTypes/cadastroDisciplina/disciplina.ts
// Este arquivo estava faltando e é importado pelos hooks de disciplina

import type { UseFormReturn } from 'react-hook-form';
import type { DisciplinaFormData, DisciplinaDTO } from '@/schemas';

// ===== TIPOS PARA DISCIPLINA =====

export interface Disciplina {
  idDisciplina?: string;
  nome: string;
  ementa: string;
  cargaHoraria: number;
  situacao: 'ATIVO' | 'INATIVO';
  id_secretaria?: string;
}

export interface DisciplinaFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export interface UseDisciplinaFormReturn {
  form: UseFormReturn<DisciplinaFormData>;
  onSubmit: (data: DisciplinaFormData) => Promise<void>;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  clearMessages: () => void;
}

export interface UseDisciplinaAPIReturn {
  createDisciplina: (data: DisciplinaDTO) => Promise<DisciplinaDTO>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export interface DisciplinaFilters {
  orderBy?: 'nome' | 'cargaHoraria';
  order?: 'asc' | 'desc';
  situacao?: 'ATIVO' | 'INATIVO';
}

export interface UseDisciplinaListReturn {
  disciplinas: Disciplina[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  filters: DisciplinaFilters;
  setFilters: (filters: DisciplinaFilters) => void;
}