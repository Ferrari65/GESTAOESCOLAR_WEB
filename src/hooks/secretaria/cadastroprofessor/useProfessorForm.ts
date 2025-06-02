// hooks/useProfessorForm.ts

import { useState, useContext, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { AuthContext } from '@/contexts/AuthContext';
import { useProfessorAPI } from './useProfessorAPI';
import { formDataToDTO, validateFormData } from '@/utils/secretaria/dataTransformers';
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
      // Debug - log dos dados do formulário
      console.log('📝 Dados do formulário recebidos:', {
        ...data,
        senha: '[REDACTED]'
      });

      // Verificar se temos o ID da secretaria
      if (!user?.id) {
        console.error('❌ ID da secretaria não encontrado:', { user });
        throw new Error('ID da secretaria não encontrado. Por favor, faça login novamente.');
      }

      console.log('👤 ID da secretaria encontrado:', user.id);

      // Validações básicas
      const validationErrors = validateFormData(data);
      if (validationErrors.length > 0) {
        console.error('❌ Erros de validação:', validationErrors);
        throw new Error(validationErrors.join(', '));
      }

      console.log('✅ Validações passaram, transformando dados...');

      // Transformar dados para DTO
      const professorDTO = formDataToDTO(data, user.id);

      console.log('🔄 DTO criado:', {
        ...professorDTO,
        senha: '[REDACTED]'
      });

      // Enviar para API
      console.log('🚀 Enviando dados para API...');
      await createProfessor(professorDTO);

      // Limpar formulário e mostrar sucesso
      console.log('✅ Professor cadastrado com sucesso!');
      form.reset();
      setSuccessMessage('Professor cadastrado com sucesso!');
      
      // Callback de sucesso
      if (onSuccess) {
        console.log('🎉 Executando callback de sucesso...');
        onSuccess();
      }

    } catch (err: any) {
      // O erro já é tratado no hook da API
      console.error('❌ Erro no formulário:', err.message);
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