import { UseFormReturn } from 'react-hook-form';

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
  created_at?: string;
  updated_at?: string;
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
  sexo: 'M' | 'F';
  data_nasc: string;
  telefone: string;
}

export interface ProfessorDTO {
  nome: string;
  CPF: string; // Backend espera maiúsculo
  logradouro: string;
  bairro: string;
  numero: number; // Convertido de string para number
  cidade: string;
  UF: string; // Backend espera maiúsculo
  email: string;
  senha: string;
  sexo: 'M' | 'F';
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
  form: UseFormReturn<ProfessorFormData>;
  onSubmit: (data: ProfessorFormData) => Promise<void>;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  clearMessages: () => void;
}

export interface UseProfessorAPIReturn {
  createProfessor: (data: ProfessorDTO) => Promise<Professor>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

// Tipos para futuro desenvolvimento (quando tiver endpoints)
// TODO: Implementar quando tiver endpoints de listagem
// export interface ProfessorListResponse {
//   professores: Professor[];
//   total: number;
//   page: number;
//   limit: number;
// }

// TODO: Implementar quando tiver endpoint de busca/filtros
// export interface ProfessorFilters {
//   nome?: string;
//   email?: string;
//   cpf?: string;
//   situacao?: 'ATIVO' | 'INATIVO';
//   cidade?: string;
//   uf?: string;
//   orderBy?: 'nome' | 'email' | 'created_at';
//   order?: 'asc' | 'desc';
// }

export function convertProfessorFormToDTO(
  formData: ProfessorFormData, 
  secretariaId: string
): ProfessorDTO {
  return {
    nome: formData.nome,
    CPF: formData.cpf,
    logradouro: formData.logradouro,
    bairro: formData.bairro,
    numero: parseInt(formData.numero, 10),
    cidade: formData.cidade,
    UF: formData.uf,
    email: formData.email,
    senha: formData.senha,
    sexo: formData.sexo,
    data_nasc: formData.data_nasc,
    telefone: formData.telefone,
    situacao: 'ATIVO',
    id_secretaria: secretariaId
  };
}