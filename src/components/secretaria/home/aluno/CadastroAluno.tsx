import React, { useCallback } from 'react';
import { useAlunoForm } from '@/hooks/secretaria/aluno/useAlunoForm';
import { useTurmaList } from '@/hooks/secretaria/aluno/useTurmaList';
import { FormularioAluno } from './FormularioAluno';

interface CadastroAlunoProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CadastroAluno: React.FC<CadastroAlunoProps> = ({
  onSuccess,
  onCancel
}) => {
  
  const {
    form,
    enviarFormulario,
    carregando,
    erro,
    mensagemSucesso,
    limparMensagens
  } = useAlunoForm({
    onSucess: useCallback(() => {
      console.log('[CADASTRO-ALUNO] Aluno cadastrado com sucesso');
      onSuccess?.();
    }, [onSuccess])
  });

  // Hook da lista de turmas
  const {
    turmas,
    loading: turmasLoading,
    error: turmasError,
    refetch: refetchTurmas
  } = useTurmaList();

  const handleCancelar = useCallback(() => {
    // Reset do formulário
    form.reset({
      nome: '',
      cpf: '',
      email: '',
      senha: '',
      telefone: '',
      matricula: '',
      data_nasc: '',
      sexo: 'M',
      logradouro: '',
      bairro: '',
      numero: '',
      cidade: '',
      uf: '',
      id_turma: '',
    });
    limparMensagens();
    onCancel?.();
  }, [form, limparMensagens, onCancel]);

  return (
    <div className="space-y-8">
      <FormularioAluno
        form={form}
        onEnviar={enviarFormulario}
        onCancelar={handleCancelar}
        carregando={carregando}
        erro={erro}
        mensagemSucesso={mensagemSucesso}
        limparMensagens={limparMensagens}
        turmas={turmas}
        turmasLoading={turmasLoading}
        turmasError={turmasError}
        onRefreshTurmas={refetchTurmas}
      />

      {/* Loading overlay global para formulário */}
      {carregando && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50"
          aria-hidden="true"
        >
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4 shadow-xl">
            <svg 
              className="animate-spin h-6 w-6 text-green-600" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-gray-700 font-medium">
              Processando cadastro do aluno...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};