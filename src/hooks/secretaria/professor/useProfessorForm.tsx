import { useState, useContext, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthContext } from '@/contexts/AuthContext';
import { getAPIClient, handleApiError } from '@/services/api';
import { 
  professorFormSchema,
  type ProfessorFormData,
  type ProfessorResponse,
  cleanCPF,
  cleanPhone
} from '@/schemas/professor';

// ===== TIPOS PARA BACKEND =====
interface ProfessorCreateDTO {
  nome: string;
  CPF: string;
  situacao: 'ATIVO';
  logradouro: string;
  bairro: string;
  numero: number;
  cidade: string;
  UF: string;
  email: string;
  senha: string;
  telefone: string;
  sexo: string;
  data_nasc: string;
  id_secretaria: string;
}

interface ProfessorUpdateDTO {
  nome?: string;
  CPF?: string;
  situacao?: 'ATIVO' | 'INATIVO';
  logradouro?: string;
  bairro?: string;
  numero?: number;
  cidade?: string;
  UF?: string;
  email?: string;
  senha?: string;
  telefone?: string;
  sexo?: string;
  data_nasc?: string;
  id_secretaria?: string;
}

function transformFormToCreateDTO(data: ProfessorFormData, secretariaId: string): ProfessorCreateDTO {
  const cpfLimpo = cleanCPF(data.cpf);
  const telefoneLimpo = cleanPhone(data.telefone);
  const numeroInt = parseInt(data.numero, 10);

  if (isNaN(numeroInt) || numeroInt <= 0) {
    throw new Error('Número deve ser um valor válido maior que zero');
  }

  return {
    nome: data.nome.trim(),
    CPF: cpfLimpo,
    email: data.email.trim().toLowerCase(),
    senha: data.senha || '',
    logradouro: data.logradouro.trim(),
    bairro: data.bairro.trim(),
    numero: numeroInt,
    cidade: data.cidade.trim(),
    UF: data.uf.toUpperCase(),
    sexo: data.sexo,
    telefone: telefoneLimpo,
    data_nasc: data.data_nasc,
    situacao: 'ATIVO',
    id_secretaria: secretariaId
  };
}

function transformFormToUpdateDTO(
  data: ProfessorFormData, 
  originalData: ProfessorResponse
): ProfessorUpdateDTO {
  const updateDTO: ProfessorUpdateDTO = {};
  
  const cpfLimpo = cleanCPF(data.cpf);
  const telefoneLimpo = cleanPhone(data.telefone);
  const numeroInt = parseInt(data.numero, 10);

  
  if (data.nome.trim() !== originalData.nome) {
    updateDTO.nome = data.nome.trim();
  }

  if (cpfLimpo !== cleanCPF(originalData.cpf)) {
    updateDTO.CPF = cpfLimpo;
  }

  if (data.email.trim().toLowerCase() !== originalData.email.toLowerCase()) {
    updateDTO.email = data.email.trim().toLowerCase();
  }

  if (telefoneLimpo !== cleanPhone(originalData.telefone)) {
    updateDTO.telefone = telefoneLimpo;
  }

  if (data.data_nasc !== originalData.data_nasc) {
    updateDTO.data_nasc = data.data_nasc;
  }

  if (data.sexo !== originalData.sexo) {
    updateDTO.sexo = data.sexo;
  }

  if (data.logradouro.trim() !== originalData.logradouro) {
    updateDTO.logradouro = data.logradouro.trim();
  }

  if (data.bairro.trim() !== originalData.bairro) {
    updateDTO.bairro = data.bairro.trim();
  }

  if (numeroInt !== originalData.numero) {
    updateDTO.numero = numeroInt;
  }

  if (data.cidade.trim() !== originalData.cidade) {
    updateDTO.cidade = data.cidade.trim();
  }

  if (data.uf.toUpperCase() !== originalData.uf.toUpperCase()) {
    updateDTO.UF = data.uf.toUpperCase();
  }

  if (data.senha && data.senha.trim() !== '') {
    updateDTO.senha = data.senha;
  }

  console.log(' [UPDATE] Campos alterados:', updateDTO);
  console.log(' [UPDATE] Dados originais:', originalData);
  console.log(' [UPDATE] Dados do form:', data);

  return updateDTO;
}

function handleProfessorError(error: unknown, context: string): string {
  const { message, status } = handleApiError(error, context);
  
  switch (status) {
    case 400:
      if (message.toLowerCase().includes('cpf')) {
        return 'Este CPF já está sendo usado por outro professor.';
      }
      if (message.toLowerCase().includes('email')) {
        return 'Este email já está sendo usado por outro professor.';
      }
      if (message.toLowerCase().includes('constraint')) {
        return 'Dados duplicados: CPF ou email já existem no sistema.';
      }
      return 'Dados inválidos: ' + message;
    
    case 401:
      return 'Sessão expirada. Faça login novamente.';
    
    case 403:
      return 'Você não tem permissão para realizar esta ação.';
    
    case 404:
      return 'Professor não encontrado.';
    
    case 409:
      return 'Conflito: Já existe um professor com estes dados.';
    
    case 422:
      return 'Dados inconsistentes. Verifique todas as informações.';
    
    case 500:
      return 'Erro interno do servidor. Tente novamente em alguns minutos.';
    
    default:
      return message || 'Erro desconhecido. Tente novamente.';
  }
}


interface UseProfessorFormOptions {
  onSuccess?: () => void;
  professorId?: string;
  originalData?: ProfessorResponse; 
}

export interface UseProfessorFormReturn {
  form: ReturnType<typeof useForm<ProfessorFormData>>;
  onSubmit: (data: ProfessorFormData) => Promise<void>;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  clearMessages: () => void;
  modoEdicao: boolean;
}

export const useProfessorForm = ({ 
  onSuccess, 
  professorId,
  originalData
}: UseProfessorFormOptions = {}): UseProfessorFormReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user } = useContext(AuthContext);
  
  const modoEdicao = Boolean(professorId);

  const form = useForm<ProfessorFormData>({
    resolver: zodResolver(professorFormSchema),
    mode: 'onBlur',
    defaultValues: {
      nome: '',
      cpf: '',
      email: '',
      senha: '',
      telefone: '',
      data_nasc: '',
      sexo: 'M',
      logradouro: '',
      bairro: '',
      numero: '',
      cidade: '',
      uf: ''
    }
  });

  const clearMessages = useCallback(() => {
    setSuccessMessage(null);
    setError(null);
  }, []);

  const onSubmit = useCallback(async (data: ProfessorFormData) => {
    if (!user?.id) {
      setError('Sessão expirada. Faça login novamente.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const api = getAPIClient();
      
      if (modoEdicao && professorId && originalData) {

        const updateDTO = transformFormToUpdateDTO(data, originalData);
        

        if (Object.keys(updateDTO).length === 0) {
          setSuccessMessage('Nenhuma alteração detectada.');
          onSuccess?.();
          return;
        }
        
        console.log('📤 [PUT] Enviando para /professor/' + professorId, updateDTO);
        await api.put(`/professor/${professorId}`, updateDTO);
        setSuccessMessage('Professor atualizado com sucesso!');
        
      } else {

        const createDTO = transformFormToCreateDTO(data, user.id);
        console.log('📤 [POST] Enviando para /professor/' + user.id, createDTO);
        await api.post(`/professor/${user.id}`, createDTO);
        setSuccessMessage('Professor cadastrado com sucesso!');


        form.reset({
          nome: '',
          cpf: '',
          email: '',
          senha: '',
          telefone: '',
          data_nasc: '',
          sexo: 'M',
          logradouro: '',
          bairro: '',
          numero: '',
          cidade: '',
          uf: ''
        });
      }
      
      onSuccess?.();
      
    } catch (err: unknown) {
      console.error('❌ Erro na requisição:', err);
      const errorMessage = handleProfessorError(err, modoEdicao ? 'EditProfessor' : 'CreateProfessor');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.id, form, onSuccess, modoEdicao, professorId, originalData]);

  return {
    form,
    onSubmit,
    loading,
    error,
    successMessage,
    clearMessages,
    modoEdicao
  };
};