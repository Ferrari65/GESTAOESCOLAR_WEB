export type { 
  CursoFormData, 
  CursoDTO, 
  CursoResponse as Curso 
} from '@/schemas/secretaria/curso/cursoValidations';

import { UseFormReturn } from 'react-hook-form';
import { CursoFormData, CursoDTO } from '@/schemas/secretaria/curso/cursoValidations';

export interface CursoFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export interface UseCursoFormReturn {
  form: UseFormReturn<CursoFormData>;
  onSubmit: (data: CursoFormData) => Promise<void>;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  clearMessages: () => void;
}


export interface UseCursoAPIReturn {
  createCurso: (data: CursoDTO) => Promise<CursoDTO>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}


export interface CursoListResponse {
  cursos: Curso[];
  total: number;
  page: number;
  limit: number;
}


export interface CursoFilters {
  nome?: string;
  situacao?: 'ATIVO' | 'INATIVO';
  orderBy?: 'nome' | 'created_at';
  order?: 'asc' | 'desc';
}

export interface UseCursoListReturn {
  cursos: Curso[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  filters: CursoFilters;
  setFilters: (filters: CursoFilters) => void;
}