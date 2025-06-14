import { UseFormReturn } from 'react-hook-form';
import { DisciplinaFormData, DisciplinaDTO, DisciplinaResponse } from '@/schemas';

export type { 
  DisciplinaFormData, 
  DisciplinaDTO, 
  DisciplinaResponse as Disciplina 
} from '@/schemas';

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
  disciplinas: DisciplinaResponse[];
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
  disciplinas: DisciplinaResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  filters: DisciplinaFilters;
  setFilters: (filters: DisciplinaFilters) => void;
}