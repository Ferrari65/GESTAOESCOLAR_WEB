export type { 
  CursoFormData, 
  CursoDTO, 
  CursoResponse as Curso 
} from '@/schemas/secretaria/curso/cursoValidations';

export interface CursoFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export interface UseCursoFormReturn {
  form: any;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  clearMessages: () => void;
}

export interface UseCursoAPIReturn {
  createCurso: (data: any) => Promise<any>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}