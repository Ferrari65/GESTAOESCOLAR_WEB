import { useState, useContext, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthContext } from '@/contexts/AuthContext';
import { useCursoAPI } from './useCursoAPI';
import { formDataToCursoDTO } from '@/utils/transformers'; 
import { cursoFormSchema } from '@/schemas/secretaria/curso/cursoValidations';
import type { UseCursoFormReturn, CursoFormData } from '@/types/secretariaTypes/cadastroCurso/curso';

interface UseCursoFormOptions {
  onSuccess?: () => void;
}

export const useCursoForm = ({ onSuccess }: UseCursoFormOptions = {}): UseCursoFormReturn => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user } = useContext(AuthContext);
  const { createCurso, loading, error, clearError } = useCursoAPI();

  const form = useForm<CursoFormData>({
    resolver: zodResolver(cursoFormSchema),
    mode: 'onBlur',
    defaultValues: {
      nome: '',
      duracao: '',
    }
  });

  const clearMessages = useCallback(() => {
    setSuccessMessage(null);
    clearError();
  }, [clearError]);

  const onSubmit = useCallback(async (data: CursoFormData) => {
    try {
      if (!user?.id) {
        throw new Error('ID da secretaria não encontrado. Por favor, faça login novamente.');
      }

      const cursoDTO = formDataToCursoDTO(data, user.id);

      await createCurso(cursoDTO);

      form.reset();
      setSuccessMessage('Curso cadastrado com sucesso!');

      if (onSuccess) {
        onSuccess();
      }

    } catch (err: unknown) {
    }
  }, [user?.id, createCurso, form, onSuccess]);

  return {
    form,
    onSubmit,
    loading,
    error,
    successMessage,
    clearMessages
  };
};