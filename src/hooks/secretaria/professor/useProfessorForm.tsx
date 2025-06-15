import { useState, useContext, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthContext } from '@/contexts/AuthContext';
import { getAPIClient, handleApiError } from '@/services/api';
import { log } from '@/utils/logger';
import { 
  professorCadastroSchema,
  professorEdicaoSchema,
  type ProfessorCadastroData,
  type ProfessorEdicaoData,
  type ProfessorResponse,
} from '@/schemas/professor';
import { 
  transformProfessorCadastroToDTO,
  transformProfessorEdicaoToDTO,
  prepareEmptyFormForEdit,
  hasChangesToUpdate,
  countFieldsToUpdate
} from '@/utils/transformers';

// ===== TIPOS =====
type ProfessorFormData = ProfessorCadastroData | ProfessorEdicaoData;

export interface UseProfessorFormOptions {
  modo?: 'cadastro' | 'edicao';
  onSucesso?: () => void;
  professorId?: string;
  dadosIniciais?: ProfessorResponse;
}

export interface UseProfessorFormReturn {
  form: ReturnType<typeof useForm<ProfessorFormData>>;
  enviarFormulario: () => Promise<void>;
  carregando: boolean;
  erro: string | null;
  mensagemSucesso: string | null;
  limparMensagens: () => void;
  modoEdicao: boolean;
}

// ===== TRATAMENTO DE ERROS =====
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
      return 'Dados inválidos: ' + message;
    
    case 401:
      return 'Sessão expirada. Faça login novamente.';
    
    case 403:
      return 'Você não tem permissão para realizar esta ação.';
    
    case 404:
      return 'Professor não encontrado.';
    
    case 409:
      return 'Conflito: Já existe um professor com estes dados.';
    
    case 500:
      return 'Erro interno do servidor. Tente novamente.';
    
    default:
      return message || 'Erro desconhecido. Tente novamente.';
  }
}

// ===== HOOK PRINCIPAL =====
export const useProfessorForm = ({ 
  modo = 'cadastro',
  onSucesso, 
  professorId,
  dadosIniciais
}: UseProfessorFormOptions = {}): UseProfessorFormReturn => {
  
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const { user } = useContext(AuthContext);
  
  const modoEdicao = modo === 'edicao' || Boolean(professorId);
  const schema = modoEdicao ? professorEdicaoSchema : professorCadastroSchema;

  const getDefaultValues = (): Partial<ProfessorFormData> => {
    if (modoEdicao) {
      return prepareEmptyFormForEdit();
    } else {
      return {
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
      };
    }
  };

  const form = useForm<ProfessorFormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: getDefaultValues()
  });

  const limparMensagens = useCallback(() => {
    setMensagemSucesso(null);
    setErro(null);
  }, []);

  const enviarFormulario = useCallback(async () => {
    if (!user?.id) {
      setErro('Sessão expirada. Faça login novamente.');
      return;
    }

    // Validar formulário
    const isValid = await form.trigger();
    if (!isValid) {
      setErro('Por favor, corrija os erros no formulário.');
      return;
    }

    const data = form.getValues();

    // Para edição, verificar se há mudanças
    if (modoEdicao) {
      if (!hasChangesToUpdate(data as ProfessorEdicaoData)) {
        setMensagemSucesso('Nenhum campo foi preenchido. Dados mantidos inalterados.');
        onSucesso?.();
        return;
      }
      
      const totalCampos = countFieldsToUpdate(data as ProfessorEdicaoData);
      
      // ✅ Log apenas em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        log.info('PROFESSOR', `${totalCampos} campo(s) serão atualizados`);
      }
    }

    setCarregando(true);
    setErro(null);

    try {
      const api = getAPIClient();
      
      if (modoEdicao && professorId) {
        // =====  EDIÇÃO =====
        const updateDTO = transformProfessorEdicaoToDTO(data as ProfessorEdicaoData);

        if (Object.keys(updateDTO).length === 0) {
          setMensagemSucesso('Nenhuma alteração detectada.');
          onSucesso?.();
          return;
        }
        
        await api.put(`/professor/${professorId}`, updateDTO);
        
        const totalCamposAtualizados = Object.keys(updateDTO).length;
        setMensagemSucesso(`Professor atualizado com sucesso! ${totalCamposAtualizados} campo(s) alterado(s).`);

        // ✅ Log apenas em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          log.success('PROFESSOR', `Professor ${professorId} atualizado com ${totalCamposAtualizados} campos`);
        }

      } else {
        // =====  CADASTRO =====
        const createDTO = transformProfessorCadastroToDTO(
          data as ProfessorCadastroData, 
          user.id
        );
        
        await api.post(`/professor/${user.id}`, createDTO);
        setMensagemSucesso('Professor cadastrado com sucesso!');

        // ✅ Log apenas em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          log.success('PROFESSOR', 'Professor cadastrado com sucesso');
        }

        // Limpar formulário após cadastro
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
      
      onSucesso?.();
      
    } catch (err: unknown) {
      const errorMessage = handleProfessorError(
        err, 
        modoEdicao ? 'EditProfessor' : 'CreateProfessor'
      );
      setErro(errorMessage);
      
      // ✅ Log de erro apenas em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        log.error('PROFESSOR', `Erro no ${modoEdicao ? 'edição' : 'cadastro'}`, err);
      }
    } finally {
      setCarregando(false);
    }
  }, [user?.id, form, onSucesso, modoEdicao, professorId]);

  return {
    form,
    enviarFormulario,
    carregando,
    erro,
    mensagemSucesso,
    limparMensagens,
    modoEdicao,
  };
};