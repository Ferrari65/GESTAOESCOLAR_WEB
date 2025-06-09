// src/hooks/secretaria/turma/useTurmaForm.ts

import { useState, useContext, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthContext } from '@/contexts/AuthContext';
import { getAPIClient, handleApiError } from '@/services/api';
import { transformTurmaFormToDTO } from '@/utils/transformers';
import { turmaFormSchema, type TurmaFormData } from '@/schemas';

export interface TurmaFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export interface UseTurmaFormReturn {
  form: ReturnType<typeof useForm<TurmaFormData>>;
  onSubmit: (data: TurmaFormData) => Promise<void>;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  clearMessages: () => void;
}

interface UseTurmaFormOptions {
  onSuccess?: () => void;
  initialData?: Partial<TurmaFormData>;
}

export const useTurmaForm = ({
  onSuccess,
  initialData,
}: UseTurmaFormOptions = {}): UseTurmaFormReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user } = useContext(AuthContext);

  const form = useForm<TurmaFormData>({
    resolver: zodResolver(turmaFormSchema),
    mode: 'onBlur',
    defaultValues: {
      nome: initialData?.nome ?? '',
      id_curso: initialData?.id_curso ?? '',
      ano: initialData?.ano ?? new Date().getFullYear().toString(),
      turno: initialData?.turno ?? 'DIURNO',
    },
  });

  const clearMessages = useCallback(() => {
    setSuccessMessage(null);
    setError(null);
  }, []);

  const onSubmit = useCallback(
    async (data: TurmaFormData): Promise<void> => {
      if (!user?.id) {
        setError('ID da secretaria não encontrado. Faça login novamente.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const turmaDTO = transformTurmaFormToDTO(data);
        const api = getAPIClient();
        const endpoint = `/turma/criar/${user.id}/${data.id_curso}`;
        
        await api.post(endpoint, turmaDTO);

        setSuccessMessage('Turma cadastrada com sucesso!');
        
        form.reset({
          nome: '',
          id_curso: '',
          ano: new Date().getFullYear().toString(),
          turno: 'DIURNO',
        });
        
        onSuccess?.();
        
      } catch (err: unknown) {
        const { message, status } = handleApiError(err, 'CreateTurma');
        
        let errorMessage = message;
        if (status === 400) {
          errorMessage = 'Dados inválidos. Verifique as informações.';
        } else if (status === 404) {
          errorMessage = 'Curso não encontrado.';
        } else if (status === 409) {
          errorMessage = 'Já existe uma turma com esse nome.';
        }
        
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