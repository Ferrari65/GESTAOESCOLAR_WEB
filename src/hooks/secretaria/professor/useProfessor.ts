import { useState, useContext, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthContext } from '@/contexts/AuthContext';
import { getAPIClient, handleApiError } from '@/services/api';


import { z } from 'zod';


const validateCPF = (cpf: string): boolean => {
  if (!cpf) return false;
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cleanCPF.charAt(10));
};

const validatePhone = (phone: string): boolean => {
  if (!phone) return false;
  const cleanPhone = phone.replace(/[^\d]/g, '');
  return cleanPhone.length === 10 || cleanPhone.length === 11;
};

const validateBirthDate = (dateString: string): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;
  const today = new Date();
  const minAge = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
  const maxAge = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
  return date >= minAge && date <= maxAge;
};

export const SituacaoEnum = z.enum(['ATIVO', 'INATIVO']);
export const SexoEnum = z.enum(['M', 'F']);

// ===== SCHEMAS =====
export const professorFormSchema = z.object({
  nome: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo')
    .trim(),
  cpf: z.string()
    .min(1, 'CPF é obrigatório')
    .refine(validateCPF, 'CPF inválido'),
  email: z.string()
    .trim()
    .min(1, 'Email é obrigatório')
    .email('Digite um email válido')
    .max(254, 'Email muito longo')
    .toLowerCase(),
  senha: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(50, 'Senha muito longa')
    .optional()
    .or(z.literal('')),
  telefone: z.string()
    .min(1, 'Telefone é obrigatório')
    .refine(validatePhone, 'Telefone inválido'),
  data_nasc: z.string()
    .min(1, 'Data de nascimento é obrigatória')
    .refine(validateBirthDate, 'Data de nascimento inválida'),
  sexo: SexoEnum,
  logradouro: z.string().min(1, 'Logradouro é obrigatório').trim(),
  bairro: z.string().min(1, 'Bairro é obrigatório').trim(),
  numero: z.string().min(1, 'Número é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória').trim(),
  uf: z.string().length(2, 'UF deve ter 2 caracteres').toUpperCase(),
});


export const professorEditSchema = professorFormSchema.extend({
  senha: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(50, 'Senha muito longa')
    .optional()
    .or(z.literal(''))
});

// ===== TIPOS =====
export type ProfessorFormData = z.infer<typeof professorFormSchema>;
export type ProfessorEditData = z.infer<typeof professorEditSchema>;
export type SituacaoType = z.infer<typeof SituacaoEnum>;

export interface ProfessorResponse {
  id_professor: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  situacao: SituacaoType;
  logradouro: string;
  bairro: string;
  numero: number;
  cidade: string;
  uf: string;
  sexo: string;
  data_nasc: string;
}


export interface ProfessorCreateDTO {
  nome: string;
  CPF: string;
  situacao?: SituacaoType;
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


export interface ProfessorUpdateDTO {
  nome?: string;
  CPF?: string;
  situacao?: SituacaoType;
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

export const cleanCPF = (cpf: string): string => cpf.replace(/[^\d]/g, '');
export const cleanPhone = (phone: string): string => phone.replace(/[^\d]/g, '');

export const formatCPF = (cpf: string): string => {
  const clean = cleanCPF(cpf);
  if (clean.length !== 11) return cpf;
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatPhone = (phone: string): string => {
  const clean = cleanPhone(phone);
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
};


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

function transformFormToUpdateDTO(data: ProfessorEditData): ProfessorUpdateDTO {
  const updateDTO: ProfessorUpdateDTO = {
    nome: data.nome.trim(),
    CPF: cleanCPF(data.cpf),
    email: data.email.trim().toLowerCase(),
    telefone: cleanPhone(data.telefone),
    logradouro: data.logradouro.trim(),
    bairro: data.bairro.trim(),
    numero: parseInt(data.numero, 10),
    cidade: data.cidade.trim(),
    UF: data.uf.toUpperCase(),
    sexo: data.sexo,
    data_nasc: data.data_nasc,
  };

  if (data.senha && data.senha.trim() !== '') {
    updateDTO.senha = data.senha;
  }

  return updateDTO;
}

// ===== ERROR  =====
function handleProfessorError(error: unknown, context: string): string {
  const { message, status } = handleApiError(error, context);
  
  switch (status) {
    case 400:
      if (message.toLowerCase().includes('cpf')) {
        return 'CPF inválido ou já está sendo usado por outro professor.';
      }
      if (message.toLowerCase().includes('email')) {
        return 'Email inválido ou já está sendo usado por outro professor.';
      }
      return 'Dados inválidos: ' + message;
    
    case 401:
      return 'Sessão expirada. Faça login novamente.';
    
    case 403:
      return 'Você não tem permissão para realizar esta ação.';
    
    case 404:
      return 'Professor não encontrado.';
    
    case 409:
      return 'Já existe um professor com estes dados (CPF ou email).';
    
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
  initialData?: Partial<ProfessorEditData>;
}

interface UseProfessorFormReturn {
  form: ReturnType<typeof useForm<ProfessorFormData | ProfessorEditData>>;
  onSubmit: (data: ProfessorFormData | ProfessorEditData) => Promise<void>;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  clearMessages: () => void;
  isEditMode: boolean;
}

interface UseProfessorListReturn {
  professores: ProfessorResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  clearError: () => void;
  updateProfessorOptimistic: (professorId: string, updates: Partial<ProfessorResponse>) => void;
  revertProfessorOptimistic: (professorId: string, originalData: ProfessorResponse) => void;
}

interface UseProfessorActionsReturn {
  updateSituacao: (professorId: string, situacao: SituacaoType) => Promise<void>;
  deleteProfessor: (professorId: string) => Promise<void>;
  buscarProfessor: (professorId: string) => Promise<ProfessorResponse | null>;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  clearMessages: () => void;
}


export const useProfessorForm = ({ 
  onSuccess, 
  professorId,
  initialData
}: UseProfessorFormOptions = {}): UseProfessorFormReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user } = useContext(AuthContext);
  
  const isEditMode = Boolean(professorId);

  const form = useForm<ProfessorFormData | ProfessorEditData>({
    resolver: zodResolver(isEditMode ? professorEditSchema : professorFormSchema),
    mode: 'onBlur',
    defaultValues: {
      nome: initialData?.nome || '',
      cpf: initialData?.cpf || '',
      email: initialData?.email || '',
      senha: initialData?.senha || '',
      telefone: initialData?.telefone || '',
      data_nasc: initialData?.data_nasc || '',
      sexo: initialData?.sexo || 'M',
      logradouro: initialData?.logradouro || '',
      bairro: initialData?.bairro || '',
      numero: initialData?.numero || '',
      cidade: initialData?.cidade || '',
      uf: initialData?.uf || ''
    }
  });

  const clearMessages = useCallback(() => {
    setSuccessMessage(null);
    setError(null);
  }, []);

  const onSubmit = useCallback(async (data: ProfessorFormData | ProfessorEditData) => {
    if (!user?.id) {
      setError('Sessão expirada. Faça login novamente.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const api = getAPIClient();
      
      if (isEditMode && professorId) {
        // EDIÇÃO: PUT /professor/{id_professor}
        const updateDTO = transformFormToUpdateDTO(data as ProfessorEditData);
        await api.put(`/professor/${professorId}`, updateDTO);
        setSuccessMessage('Professor atualizado com sucesso!');
      } else {
        // CADASTRO: POST /professor/{id_secretaria}
        const createDTO = transformFormToCreateDTO(data as ProfessorFormData, user.id);
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
      const errorMessage = handleProfessorError(err, isEditMode ? 'EditProfessor' : 'CreateProfessor');
      setError(errorMessage);
      console.error('Erro no professor:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, form, onSuccess, isEditMode, professorId]);

  return {
    form,
    onSubmit,
    loading,
    error,
    successMessage,
    clearMessages,
    isEditMode
  };
};


export const useProfessorList = (): UseProfessorListReturn => {
  const [professores, setProfessores] = useState<ProfessorResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(AuthContext);

  const clearError = useCallback(() => setError(null), []);

  const updateProfessorOptimistic = useCallback((professorId: string, updates: Partial<ProfessorResponse>) => {
    setProfessores(prev => 
      prev.map(professor => 
        professor.id_professor === professorId 
          ? { ...professor, ...updates }
          : professor
      )
    );
  }, []);

  const revertProfessorOptimistic = useCallback((professorId: string, originalData: ProfessorResponse) => {
    setProfessores(prev => 
      prev.map(professor => 
        professor.id_professor === professorId 
          ? originalData
          : professor
      )
    );
  }, []);

  const fetchProfessores = useCallback(async () => {
    if (!user?.id) {
      setError('ID da secretaria não encontrado. Faça login novamente.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const api = getAPIClient();
      const response = await api.get(`/professor/secretaria/${user.id}`);
      
      let professoresData = response.data;
      
      if (!Array.isArray(professoresData)) {
        if (professoresData.professores && Array.isArray(professoresData.professores)) {
          professoresData = professoresData.professores;
        } else if (professoresData.data && Array.isArray(professoresData.data)) {
          professoresData = professoresData.data;
        } else {
          professoresData = [professoresData];
        }
      }

      setProfessores(professoresData || []);
      
    } catch (err: unknown) {
      const errorMessage = handleProfessorError(err, 'FetchProfessores');
      setError(errorMessage);
      setProfessores([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const refetch = useCallback(() => {
    clearError();
    fetchProfessores();
  }, [fetchProfessores, clearError]);

  useEffect(() => {
    if (user?.id) {
      fetchProfessores();
    }
  }, [user?.id, fetchProfessores]);

  return {
    professores,
    loading,
    error,
    refetch,
    clearError,
    updateProfessorOptimistic,
    revertProfessorOptimistic
  };
};

export const useProfessorActions = (): UseProfessorActionsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  const buscarProfessor = useCallback(async (professorId: string): Promise<ProfessorResponse | null> => {
    if (!professorId) {
      setError('ID do professor é obrigatório');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const api = getAPIClient();
      const response = await api.get(`/professor/${professorId}`);
      return response.data;
    } catch (err: unknown) {
      const errorMessage = handleProfessorError(err, 'BuscarProfessor');
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSituacao = useCallback(async (professorId: string, situacao: SituacaoType): Promise<void> => {
    if (!professorId) {
      setError('ID do professor é obrigatório');
      return;
    }

    if (!['ATIVO', 'INATIVO'].includes(situacao)) {
      setError('Situação deve ser ATIVO ou INATIVO');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const api = getAPIClient();
      await api.put(`/professor/${professorId}`, { situacao });
      setSuccessMessage(`Professor ${situacao.toLowerCase()} com sucesso!`);
    } catch (err: unknown) {
      const errorMessage = handleProfessorError(err, 'UpdateSituacao');
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProfessor = useCallback(async (professorId: string): Promise<void> => {
    if (!professorId) {
      setError('ID do professor é obrigatório');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const api = getAPIClient();
      await api.delete(`/professor/${professorId}/situacao`);
      setSuccessMessage('Professor inativado com sucesso!');
    } catch (err: unknown) {
      const errorMessage = handleProfessorError(err, 'DeleteProfessor');
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateSituacao,
    deleteProfessor,
    buscarProfessor,
    loading,
    error,
    successMessage,
    clearMessages
  };
};