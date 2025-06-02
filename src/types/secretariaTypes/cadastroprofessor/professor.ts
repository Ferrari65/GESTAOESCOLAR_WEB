// types/professor.ts

export interface Professor {
  id_professor: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  situacao: 'ATIVO' | 'INATIVO';
  logradouro: string;
  bairro: string;
  numero: number;
  cidade: string;
  uf: string;
  sexo: 'M' | 'F';
  data_nasc: string;
}

export interface ProfessorFormData {
  nome: string;
  cpf: string;
  logradouro: string;
  bairro: string;
  numero: string;
  cidade: string;
  uf: string;
  email: string;
  senha: string;
  sexo: string;
  data_nasc: string;
  telefone: string;
}

export interface ProfessorDTO {
  nome: string;
  CPF: string;
  logradouro: string;
  bairro: string;
  numero: number;
  cidade: string;
  UF: string;
  email: string;
  senha: string;
  sexo: string;
  data_nasc: string;
  telefone: string;
  situacao: 'ATIVO' | 'INATIVO';
  id_secretaria: string;
}

export interface ProfessorFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export interface UseProfessorFormReturn {
  form: any; // react-hook-form
  onSubmit: (data: ProfessorFormData) => Promise<void>;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  clearMessages: () => void;
}