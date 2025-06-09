// src/hooks/secretaria/professor/index.ts - HOOKS CORRIGIDOS

import { useState, useContext, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthContext } from '@/contexts/AuthContext';
import { getAPIClient, handleApiError } from '@/services/api';
import { 
  professorFormSchema,
  professorCadastroSchema,
  professorEdicaoSchema,
  type ProfessorCadastroData,
  type ProfessorEdicaoData,
  type ProfessorResponse,
  type ProfessorEditarDTO,
  type SituacaoType,
  cleanCPF,
  cleanPhone
} from '@/schemas/professor';

// ===== INTERFACES =====
export interface ProfessorFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  professorParaEditar?: ProfessorResponse;
  modoEdicao?: boolean;
}

interface UseProfessorFormOptions {
  onSuccess?: () => void;
  initialData?: Partial<ProfessorCadastroData | ProfessorEdicaoData>;
  professorId?: string;
}

interface UseProfessorFormReturn {
  form: ReturnType<typeof useForm<ProfessorCadastroData | ProfessorEdicaoData>>;
  onSubmit: (data: ProfessorCadastroData | ProfessorEdicaoData) => Promise<void>;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  clearMessages: () => void;
  modoEdicao: boolean;
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
  editarProfessor: (professorId: string, dados: ProfessorEditarDTO) => Promise<void>;
  buscarProfessor: (professorId: string) => Promise<ProfessorResponse | null>;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  clearMessages: () => void;
}

// ===== ✅ HELPER FUNCTIONS MELHORADAS =====
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
      if (message.toLowerCase().includes('telefone')) {
        return 'Telefone inválido.';
      }
      if (message.toLowerCase().includes('data')) {
        return 'Data de nascimento inválida.';
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

// ✅ FUNÇÃO PARA TRANSFORMAR DADOS DO FORMULÁRIO EM DTO
function transformFormToDTO(data: ProfessorCadastroData, secretariaId: string) {
  const cpfLimpo = cleanCPF(data.cpf || '');
  const telefoneLimpo = cleanPhone(data.telefone || '');
  const numeroInt = parseInt(data.numero || '0', 10);

  if (isNaN(numeroInt) || numeroInt <= 0) {
    throw new Error('Número deve ser um valor válido maior que zero');
  }

  if (cpfLimpo.length !== 11) {
    throw new Error('CPF deve ter exatamente 11 dígitos');
  }

  if (telefoneLimpo.length !== 10 && telefoneLimpo.length !== 11) {
    throw new Error('Telefone deve ter 10 ou 11 dígitos');
  }

  return {
    nome: (data.nome || '').trim(),
    CPF: cpfLimpo,
    email: (data.email || '').trim().toLowerCase(),
    senha: data.senha || '',
    logradouro: (data.logradouro || '').trim(),
    bairro: (data.bairro || '').trim(),
    numero: numeroInt,
    cidade: (data.cidade || '').trim(),
    UF: (data.uf || '').toUpperCase(),
    sexo: data.sexo || 'M',
    telefone: telefoneLimpo,
    data_nasc: data.data_nasc || '',
    situacao: 'ATIVO' as const,
    id_secretaria: secretariaId
  };
}

// ✅ FUNÇÃO PARA TRANSFORMAR DADOS DE EDIÇÃO EM DTO
function transformEditFormToDTO(data: ProfessorEdicaoData): ProfessorEditarDTO {
  const dadosEdicao: ProfessorEditarDTO = {
    nome: (data.nome || '').trim(),
    CPF: cleanCPF(data.cpf || ''),
    email: (data.email || '').trim().toLowerCase(),
    telefone: cleanPhone(data.telefone || ''),
    logradouro: (data.logradouro || '').trim(),
    bairro: (data.bairro || '').trim(),
    numero: parseInt(data.numero || '0', 10),
    cidade: (data.cidade || '').trim(),
    UF: (data.uf || '').toUpperCase(),
    sexo: data.sexo || 'M',
    data_nasc: data.data_nasc || '',
  };

  // ✅ SÓ INCLUIR SENHA SE FOI PREENCHIDA
  if (data.senha && data.senha.trim() !== '') {
    dadosEdicao.senha = data.senha;
  }

  return dadosEdicao;
}

// ===== ✅ 1. HOOK: FORMULÁRIO DE PROFESSOR CORRIGIDO =====
export const useProfessorForm = ({ 
  onSuccess, 
  initialData,
  professorId
}: UseProfessorFormOptions = {}): UseProfessorFormReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user } = useContext(AuthContext);
  
  const modoEdicao = Boolean(professorId);

  // ✅ USAR O SCHEMA CORRETO BASEADO NO MODO
  const form = useForm<ProfessorCadastroData | ProfessorEdicaoData>({
    resolver: zodResolver(modoEdicao ? professorEdicaoSchema : professorCadastroSchema),
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

  const onSubmit = useCallback(async (data: ProfessorCadastroData | ProfessorEdicaoData) => {
    if (!user?.id) {
      setError('Sessão expirada. Faça login novamente.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const api = getAPIClient();
      
      if (modoEdicao && professorId) {
        // ✅ MODO EDIÇÃO: PUT /professor/{id_professor}
        const dadosEdicao = transformEditFormToDTO(data as ProfessorEdicaoData);
        
        await api.put(`/professor/${professorId}`, dadosEdicao);
        setSuccessMessage('Professor atualizado com sucesso!');
      } else {
        // ✅ MODO CADASTRO: POST /professor/{id_secretaria}
        const professorDTO = transformFormToDTO(data as ProfessorCadastroData, user.id);
        await api.post(`/professor/${user.id}`, professorDTO);
        setSuccessMessage('Professor cadastrado com sucesso!');
        
        // ✅ LIMPAR FORMULÁRIO APENAS NO CADASTRO
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
      
      // ✅ CHAMAR CALLBACK DE SUCESSO
      onSuccess?.();
      
    } catch (err: unknown) {
      const errorMessage = handleProfessorError(err, modoEdicao ? 'EditProfessor' : 'CreateProfessor');
      setError(errorMessage);
      console.error('Erro no professor:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, form, onSuccess, modoEdicao, professorId]);

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

// ===== 2. HOOK: LISTAGEM DE PROFESSORES (MANTIDO IGUAL) =====
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

// ===== 3. HOOK: AÇÕES DE PROFESSOR (MANTIDO IGUAL) =====
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

  const editarProfessor = useCallback(async (professorId: string, dados: ProfessorEditarDTO): Promise<void> => {
    if (!professorId) {
      setError('ID do professor é obrigatório');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const api = getAPIClient();
      await api.put(`/professor/${professorId}`, dados);
      setSuccessMessage('Professor atualizado com sucesso!');
    } catch (err: unknown) {
      const errorMessage = handleProfessorError(err, 'EditarProfessor');
      setError(errorMessage);
      throw err;
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
    editarProfessor,
    buscarProfessor,
    loading,
    error,
    successMessage,
    clearMessages
  };
};

// ===== TIPOS EXPORTADOS =====
export type { 
  ProfessorResponse, 
  ProfessorFormProps, 
  UseProfessorFormReturn, 
  UseProfessorListReturn,
  UseProfessorActionsReturn
};