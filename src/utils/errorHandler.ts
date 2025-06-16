
import { AxiosError } from 'axios';
import { log } from './logger';

export interface ApiError {
  message: string;
  status?: number;
}

export type ErrorContext = 
  | 'Auth' | 'CreateProfessor' | 'EditProfessor' | 'FetchProfessores'
  | 'CreateCurso' | 'EditCurso' | 'FetchCursos' 
  | 'CreateDisciplina' | 'FetchDisciplinas'
  | 'CreateTurma' | 'FetchTurmas'
  | 'SecretariaData' | 'NetworkError' | 'Unknown';

export interface ErrorResult {
  message: string;
  status?: number;
  type: 'validation' | 'network' | 'unauthorized' | 'server' | 'unknown';
  context: ErrorContext;
}

// ===== MAPEAMENTOS DE ERRO =====
const STATUS_MESSAGES: Record<number, string> = {
  400: 'Dados inválidos fornecidos.',
  401: 'Sem autorização. Faça login novamente.',
  403: 'Sem permissão para realizar esta ação.',
  404: 'Recurso não encontrado.',
  409: 'Conflito: dados já existem.',
  422: 'Dados inconsistentes.',
  429: 'Muitas tentativas. Aguarde.',
  500: 'Erro interno do servidor.',
  502: 'Serviço indisponível.',
  503: 'Serviço temporariamente indisponível.',
  504: 'Timeout do servidor.',
};

const CONTEXT_SPECIFIC_MESSAGES: Record<ErrorContext, Record<number, string>> = {
  CreateProfessor: {
    400: 'Dados do professor inválidos.',
    409: 'CPF ou email já cadastrado.',
    422: 'Professor já existe no sistema.',
  },
  EditProfessor: {
    400: 'Dados de edição inválidos.',
    404: 'Professor não encontrado.',
    409: 'Email já usado por outro professor.',
  },
  FetchProfessores: {
    403: 'Sem permissão para ver professores.',
    404: 'Nenhum professor encontrado.',
  },
  CreateCurso: {
    400: 'Dados do curso inválidos.',
    409: 'Nome do curso já existe.',
    422: 'Duração inválida.',
  },
  EditCurso: {
    404: 'Curso não encontrado.',
    409: 'Nome do curso já usado.',
  },
  FetchCursos: {
    403: 'Sem permissão para ver cursos.',
  },
  CreateDisciplina: {
    400: 'Dados da disciplina inválidos.',
    409: 'Disciplina já cadastrada.',
  },
  FetchDisciplinas: {
    403: 'Sem permissão para ver disciplinas.',
  },
  CreateTurma: {
    400: 'Dados da turma inválidos.',
    404: 'Curso não encontrado.',
    409: 'Nome da turma já existe.',
  },
  FetchTurmas: {
    403: 'Sem permissão para ver turmas.',
  },
  Auth: {
    400: 'Email ou senha inválidos.',
    401: 'Credenciais incorretas.',
    403: 'Conta bloqueada ou inativa.',
    429: 'Muitas tentativas de login.',
  },
  SecretariaData: {
    403: 'Sem permissão para ver dados da secretaria.',
    404: 'Dados da secretaria não encontrados.',
  },
  NetworkError: {},
  Unknown: {},
};

// ===== FUNÇÕES UTILITÁRIAS =====
function isAxiosError(error: unknown): error is AxiosError {
  return error !== null && 
         typeof error === 'object' && 
         'isAxiosError' in error && 
         (error as AxiosError).isAxiosError === true;
}

function getErrorType(status?: number): ErrorResult['type'] {
  if (!status) return 'unknown';
  
  if (status >= 400 && status < 500) {
    if (status === 401 || status === 403) return 'unauthorized';
    if (status === 400 || status === 422) return 'validation';
    return 'validation';
  }
  
  if (status >= 500) return 'server';
  return 'unknown';
}

interface ServerErrorData {
  message?: string;
  error?: string;
  msg?: string;
  detail?: string;
  [key: string]: unknown;
}

function extractServerMessage(error: AxiosError): string | null {
  const data = error.response?.data as ServerErrorData;
  
  return data?.message || 
         data?.error || 
         data?.msg || 
         data?.detail || 
         null;
}

function getContextualMessage(
  context: ErrorContext, 
  status: number, 
  serverMessage?: string
): string {
  const contextMessages = CONTEXT_SPECIFIC_MESSAGES[context];
  if (contextMessages?.[status]) {
    return contextMessages[status];
  }
  
  if (serverMessage && serverMessage.length > 0 && serverMessage.length < 200) {
    return serverMessage;
  }
  
  return STATUS_MESSAGES[status] || 'Erro desconhecido.';
}

// ===== FUNÇÃO PRINCIPAL =====
export function handleError(
  error: unknown, 
  context: ErrorContext = 'Unknown'
): ErrorResult {
  log.error(context, 'Erro capturado', error);

  if (isAxiosError(error)) {
    const status = error.response?.status;
    const serverMessage = extractServerMessage(error) ?? undefined;
    
    if (error.response) {
      const message = getContextualMessage(context, status!, serverMessage);
      
      const result: ErrorResult = {
        message,
        type: getErrorType(status),
        context,
      };
      if (typeof status === 'number') {
        result.status = status;
      }
      return result;
    }
    
    if (error.request) {
      return {
        message: 'Erro de conexão. Verifique sua internet.',
        type: 'network',
        context,
      };
    }
  }
  
  if (error instanceof Error) {
    return {
      message: error.message || 'Erro inesperado.',
      type: 'unknown',
      context,
    };
  }
  
  return {
    message: 'Erro desconhecido. Tente novamente.',
    type: 'unknown',
    context,
  };
}

// ===== FUNÇÕES DE CONVENIÊNCIA =====
export const errorHandlers = {
  auth: (error: unknown) => handleError(error, 'Auth'),
  
  professor: {
    create: (error: unknown) => handleError(error, 'CreateProfessor'),
    edit: (error: unknown) => handleError(error, 'EditProfessor'),
    fetch: (error: unknown) => handleError(error, 'FetchProfessores'),
  },
  
  curso: {
    create: (error: unknown) => handleError(error, 'CreateCurso'),
    edit: (error: unknown) => handleError(error, 'EditCurso'),
    fetch: (error: unknown) => handleError(error, 'FetchCursos'),
  },
  
  disciplina: {
    create: (error: unknown) => handleError(error, 'CreateDisciplina'),
    fetch: (error: unknown) => handleError(error, 'FetchDisciplinas'),
  },
  
  turma: {
    create: (error: unknown) => handleError(error, 'CreateTurma'),
    fetch: (error: unknown) => handleError(error, 'FetchTurmas'),
  },
  
  secretaria: (error: unknown) => handleError(error, 'SecretariaData'),
};

// ===== HOOK COMPONENTES =====
import { useState, useCallback } from 'react';

export function useErrorHandler() {
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorResult['type'] | null>(null);

  const handleErrorWithState = useCallback((
    error: unknown, 
    context: ErrorContext = 'Unknown'
  ): ErrorResult => {
    const result = handleError(error, context);
    setError(result.message);
    setErrorType(result.type);
    return result;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setErrorType(null);
  }, []);

  const isNetworkError = errorType === 'network';
  const isValidationError = errorType === 'validation';
  const isUnauthorizedError = errorType === 'unauthorized';
  const isServerError = errorType === 'server';

  return {
    error,
    errorType,
    handleError: handleErrorWithState,
    clearError,
    isNetworkError,
    isValidationError,
    isUnauthorizedError,
    isServerError,
  };
}

export interface ErrorDisplayProps {
  error: ErrorResult;
  onRetry?: () => void;
  className?: string;
}