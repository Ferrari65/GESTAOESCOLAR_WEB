
export type { 
  DisciplinaFormData, 
  DisciplinaDTO, 
  DisciplinaResponse as Disciplina 
} from '@/schemas/secretaria/disciplina/disciplinaValidations';

import { UseFormReturn } from 'react-hook-form';
import { DisciplinaFormData, DisciplinaDTO } from '@/schemas/secretaria/disciplina/disciplinaValidations';

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

export interface DisciplinaListResponse {
  disciplinas: Disciplina[];
  total: number;
  page: number;
  limit: number;
}

export interface DisciplinaFilters {
  nome?: string;
  situacao?: 'ATIVO' | 'INATIVO';
  orderBy?: 'nome' | 'created_at';
  order?: 'asc' | 'desc';
}

export interface UseDisciplinaListReturn {
  disciplinas: Disciplina[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  filters: DisciplinaFilters;
  setFilters: (filters: DisciplinaFilters) => void;
}
