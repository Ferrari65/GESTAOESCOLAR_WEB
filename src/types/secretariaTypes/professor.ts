
export type { 
  ProfessorCadastroData as ProfessorFormData, 
  ProfessorCreateDTO as ProfessorDTO,
  ProfessorResponse,
  SituacaoType
} from '@/schemas/professor';

export interface ProfessorFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}