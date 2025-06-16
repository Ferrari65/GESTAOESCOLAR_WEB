import { useState, useContext, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthContext } from '@/contexts/AuthContext';
import { getAPIClient, handleApiError } from '@/services/api';
import { transformCursoFormToDTO } from '@/utils/transformers';
import {
  cursoFormSchema,
  type CursoFormData,
  type CursoResponse,
  type CursoEditarDTO,
  type SituacaoType,
} from '@/schemas/index';

// ===== CACHE LOCAL =====
const cursoCache = {
  data: [] as CursoResponse[],
  timestamp: 0,
  isLoading: false
};

const CACHE_DURATION = 3 * 60 * 1000; // 3 minutos

function isDataFresh(): boolean {
  return cursoCache.data.length > 0 && 
         Date.now() - cursoCache.timestamp < CACHE_DURATION;
}

// ===== INTERFACES =====
export interface CursoFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface UseCursoFormReturn {
  form: ReturnType<typeof useForm<CursoFormData>>;
  onSubmit: (data: CursoFormData) => Promise<void>;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  clearMessages: () => void;
}

interface UseCursoListReturn {
  cursos: CursoResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  clearError: () => void;
  updateCursoOptimistic: (cursoId: string, updates: Partial<CursoResponse>) => void;
  revertCursoOptimistic: (cursoId: string, originalData: CursoResponse) => void;
  adicionarCurso: (curso: CursoResponse) => void;
  removerCurso: (cursoId: string) => void;
  isDataFresh: boolean;
}

interface UseCursoActionsReturn {
  updateSituacao: (
    cursoId: string, 
    situacao: SituacaoType, 
    onOptimisticUpdate?: (revert: () => void) => void
  ) => Promise<void>;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  clearMessages: () => void;
}

// ===== FUNÇÕES UTILITÁRIAS =====
function handleCursoError(error: unknown, context: string): string {
  const { message, status } = handleApiError(error, context);
  
  switch (status) {
    case 400:
      if (message.includes('nome') || message.includes('name')) {
        return 'Nome do curso inválido ou já existe.';
      }
      if (message.includes('duracao') || message.includes('duration')) {
        return 'Duração do curso deve ser entre 1 e 60 meses.';
      }
      return message;
    case 401:
      return 'Sem autorização. Faça login novamente.';
    case 403:
      return 'Sem permissão para realizar esta ação.';
    case 404:
      return 'Curso não encontrado.';
    case 409:
      return 'Já existe um curso com este nome.';
    case 422:
      return 'Dados inconsistentes. Verifique as informações.';
    case 500:
      return 'Erro interno do servidor. Tente novamente.';
    default:
      return message;
  }
}

function mapCursoResponse(curso: any): CursoResponse {
  if (!curso) {
    throw new Error('Dados do curso inválidos');
  }

  const idCurso = curso.idCurso;
  const nome = curso.nome;
  const duracao = curso.duracao;
  const id_secretaria = curso.id_secretaria;
  const situacao = curso.situacao;

  if (!idCurso) throw new Error('ID do curso não encontrado');
  if (!nome || nome.trim() === '') throw new Error('Nome do curso não encontrado');
  if (!duracao || Number(duracao) <= 0) throw new Error('Duração do curso inválida');

  return {
    idCurso: String(idCurso),
    nome: String(nome).trim(),
    duracao: Number(duracao),
    id_secretaria: String(id_secretaria),
    situacao: situacao as SituacaoType
  };
}

function validateCursoData(curso: any): boolean {
  if (!curso) return false;
  try {
    mapCursoResponse(curso);
    return true;
  } catch {
    return false;
  }
}

// ===== HOOK: FORMULÁRIO DE CURSO =====
export const useCursoForm = ({
  onSuccess,
  initialData,
}: { onSuccess?: () => void; initialData?: Partial<CursoFormData> } = {}): UseCursoFormReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user } = useContext(AuthContext);

  const form = useForm<CursoFormData>({
    resolver: zodResolver(cursoFormSchema),
    mode: 'onBlur',
    defaultValues: {
      nome: initialData?.nome ?? '',
      duracao: initialData?.duracao ?? 1,
    },
  });

  const clearMessages = useCallback(() => {
    setSuccessMessage(null);
    setError(null);
  }, []);

  const onSubmit = useCallback(
    async (data: CursoFormData): Promise<void> => {
      if (!user?.id) {
        setError('ID da secretaria não encontrado. Faça login novamente.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const cursoDTO = transformCursoFormToDTO(data, user.id);
        
        const api = getAPIClient();
        const response = await api.post(`/curso/${user.id}`, cursoDTO);
        
        if (response.data) {
          try {
            const novoCurso = mapCursoResponse(response.data);
            cursoCache.data = [novoCurso, ...cursoCache.data];
            cursoCache.timestamp = Date.now();
            console.log(' [CURSO-FORM] Curso adicionado ao cache:', novoCurso.nome);
          } catch (err) {
            console.warn(' [CURSO-FORM] Erro ao mapear curso criado:', err);
          }
        }
        
        setSuccessMessage('Curso cadastrado com sucesso!');
        
        form.reset({
          nome: '',
          duracao: 1,
        });
        
        onSuccess?.();
        

        setTimeout(() => setSuccessMessage(null), 3000);
        
      } catch (err: unknown) {
        const errorMessage = handleCursoError(err, 'CreateCurso');
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [user?.id, form, onSuccess]
  );

  return {
    form,
    onSubmit,
    loading,
    error,
    successMessage,
    clearMessages,
  };
};

// ===== HOOK: LISTAGEM DE CURSOS =====
export const useCursoList = (): UseCursoListReturn => {
  const [cursos, setCursos] = useState<CursoResponse[]>(() => cursoCache.data);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(AuthContext);

  const clearError = useCallback(() => setError(null), []);

  // ===== ATUALIZAÇÕES OTIMISTAS =====
  const updateCursoOptimistic = useCallback((cursoId: string, updates: Partial<CursoResponse>) => {
    console.log(' [CURSO-LIST] Atualizando curso:', cursoId, updates);
    setCursos(prev => {
      const novosCursos = prev.map(curso => 
        curso.idCurso === cursoId 
          ? { ...curso, ...updates }
          : curso
      );
      cursoCache.data = novosCursos;
      return novosCursos;
    });
  }, []);

  const revertCursoOptimistic = useCallback((cursoId: string, originalData: CursoResponse) => {
    console.log('↩ [CURSO-LIST] Revertendo curso:', cursoId);
    setCursos(prev => {
      const novosCursos = prev.map(curso => 
        curso.idCurso === cursoId 
          ? originalData
          : curso
      );
      cursoCache.data = novosCursos;
      return novosCursos;
    });
  }, []);

  const adicionarCurso = useCallback((curso: CursoResponse) => {
    console.log(' [CURSO-LIST] Adicionando curso:', curso.nome);
    setCursos(prev => {
      const novosCursos = [curso, ...prev];
      cursoCache.data = novosCursos;
      cursoCache.timestamp = Date.now();
      return novosCursos;
    });
  }, []);

  const removerCurso = useCallback((cursoId: string) => {
    console.log('[CURSO-LIST] Removendo curso:', cursoId);
    setCursos(prev => {
      const novosCursos = prev.filter(curso => curso.idCurso !== cursoId);
      cursoCache.data = novosCursos;
      return novosCursos;
    });
  }, []);

  // ===== BUSCAR CURSOS =====
  const fetchCursos = useCallback(async (forceRefresh = false): Promise<void> => {
    if (!user?.id) {
      setError('ID da secretaria não encontrado. Faça login novamente.');
      return;
    }

    if (!forceRefresh && isDataFresh()) {
      console.log(' [CURSO-LIST] Usando dados do cache');
      setCursos(cursoCache.data);
      return;
    }


    if (cursoCache.isLoading) {
      console.log(' [CURSO-LIST] Já está carregando...');
      return;
    }

    cursoCache.isLoading = true;
    setLoading(true);
    setError(null);

    try {
      console.log(' [CURSO-LIST] Buscando cursos do servidor...');
      const api = getAPIClient();
      const response = await api.get(`/curso/${user.id}/secretaria`);
      
      if (!response.data) {
        setCursos([]);
        cursoCache.data = [];
        cursoCache.timestamp = Date.now();
        return;
      }

      let cursosData = response.data;
      
      if (!Array.isArray(cursosData)) {
        if (cursosData.cursos && Array.isArray(cursosData.cursos)) {
          cursosData = cursosData.cursos;
        } else if (cursosData.data && Array.isArray(cursosData.data)) {
          cursosData = cursosData.data;
        } else {
          cursosData = [cursosData];
        }
      }

      const cursosValidos: CursoResponse[] = [];
      
      for (const curso of cursosData) {
        try {
          if (validateCursoData(curso)) {
            const cursoMapeado = mapCursoResponse(curso);
            cursosValidos.push(cursoMapeado);
          }
        } catch {
        }
      }

      console.log(` [CURSO-LIST] ${cursosValidos.length} cursos carregados`);
      setCursos(cursosValidos);
      cursoCache.data = cursosValidos;
      cursoCache.timestamp = Date.now();
      
    } catch (err: unknown) {
      console.error(' [CURSO-LIST] Erro ao buscar cursos:', err);
      const errorMessage = handleCursoError(err, 'FetchCursos');
      setError(errorMessage);
      
      // Se deu erro mas tem cache, usa o cache
      if (cursoCache.data.length > 0) {
        console.log('[CURSO-LIST] Usando cache por erro de rede');
        setCursos(cursoCache.data);
      } else {
        setCursos([]);
      }
    } finally {
      setLoading(false);
      cursoCache.isLoading = false;
    }
  }, [user?.id]);

  const refetch = useCallback(() => {
    console.log(' [CURSO-LIST] Recarregamento forçado');
    clearError();
    fetchCursos(true);
  }, [fetchCursos, clearError]);

  // ===== EFEITO INICIAL =====
  useEffect(() => {
    if (user?.id) {
      fetchCursos();
    }
  }, [user?.id, fetchCursos]);

  return {
    cursos,
    loading,
    error,
    refetch,
    clearError,
    updateCursoOptimistic,
    revertCursoOptimistic,
    adicionarCurso,
    removerCurso,
    isDataFresh: isDataFresh()
  };
};

// ===== HOOK: AÇÕES DE CURSO =====
export const useCursoActions = (): UseCursoActionsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  const updateSituacao = useCallback(async (
    cursoId: string, 
    situacao: SituacaoType,
    onOptimisticUpdate?: (revert: () => void) => void
  ): Promise<void> => {
    if (!cursoId || cursoId.trim() === '') {
      setError('ID do curso é obrigatório');
      return;
    }

    if (!situacao || !['ATIVO', 'INATIVO'].includes(situacao)) {
      setError('Situação deve ser ATIVO ou INATIVO');
      return;
    }

    setLoading(true);
    setError(null);

    let revertFunction: (() => void) | null = null;

    try {
      console.log(` [CURSO-ACTION] Alterando curso ${cursoId} para ${situacao}`);
      
      if (onOptimisticUpdate) {
        onOptimisticUpdate((revert) => {
          revertFunction = revert;
        });
      }
      
      const editarDTO: CursoEditarDTO = { 
        situacao: situacao
      };
      
      const api = getAPIClient();
      await api.put(`/curso/${cursoId}/situacao`, editarDTO);
      
      console.log(`[CURSO-ACTION] Curso ${cursoId} alterado para ${situacao}`);
      setSuccessMessage(`Curso ${situacao.toLowerCase()} com sucesso!`);

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
    } catch (err: unknown) {
      console.error(' [CURSO-ACTION] Erro ao alterar situação:', err);

      if (revertFunction) {
        revertFunction();
      }
      
      const errorMessage = handleCursoError(err, 'UpdateCursoSituacao');
      setError(errorMessage);
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateSituacao,
    loading,
    error,
    successMessage,
    clearMessages,
  };
};