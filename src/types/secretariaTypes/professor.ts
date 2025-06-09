export type { 
  ProfessorFormData, 
  ProfessorDTO,
  ProfessorResponse,
  SituacaoType
} from '@/schemas/professor';

export interface ProfessorFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}