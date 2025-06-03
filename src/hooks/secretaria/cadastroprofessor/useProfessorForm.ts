import { useState, useContext, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { AuthContext } from '@/contexts/AuthContext';
import { useProfessorAPI } from './useProfessorAPI';
import { formDataToDTO, validateFormData } from '@/utils/transformers'; // ✅ IMPORT UNIFICADO
import type { ProfessorFormData, UseProfessorFormReturn } from '@/types/secretariaTypes/cadastroprofessor/professor';

interface UseProfessorFormOptions {
  onSuccess?: () => void;
}

export const useProfessorForm = ({ onSuccess }: UseProfessorFormOptions = {}): UseProfessorFormReturn => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user } = useContext(AuthContext);
  const { createProfessor, loading, error } = useProfessorAPI();

  const form = useForm<ProfessorFormData>({
    mode: 'onBlur',
    defaultValues: {
      nome: '',
      cpf: '',
      email: '',
      senha: '',
      telefone: '',
      data_nasc: '',
      sexo: '',
      logradouro: '',
      bairro: '',
      numero: '',
      cidade: '',
      uf: ''
    }
  });

  const clearMessages = useCallback(() => {
    setSuccessMessage(null);
  }, []);

  const onSubmit = useCallback(async (data: ProfessorFormData) => {
    try {
  
      if (!user?.id) {
        throw new Error('ID da secretaria não encontrado. Por favor, faça login novamente.');
      }


      const validationErrors = validateFormData(data);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const professorDTO = formDataToDTO(data, user.id);

      await createProfessor(professorDTO);

      form.reset();
      setSuccessMessage('Professor cadastrado com sucesso!');
      

      if (onSuccess) {
        onSuccess();
      }

    } catch (err: any) {
    }
  }, [user?.id, createProfessor, form, onSuccess]);

  return {
    form,
    onSubmit,
    loading,
    error,
    successMessage,
    clearMessages
  };
};