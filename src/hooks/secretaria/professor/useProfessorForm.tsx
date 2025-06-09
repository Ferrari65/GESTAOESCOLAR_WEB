import { useState, useContext, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthContext } from '@/contexts/AuthContext';
import { getAPIClient, handleApiError } from '@/services/api';
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
    console.log(` [${modoEdicao ? 'EDIÇÃO' : 'CADASTRO'}] Iniciando envio...`);
    
    if (!user?.id) {
      setErro('Sessão expirada. Faça login novamente.');
      return;
    }


    const isValid = await form.trigger();
    if (!isValid) {
      setErro('Por favor, corrija os erros no formulário.');
      return;
    }

    const data = form.getValues();
    console.log(`[${modoEdicao ? 'EDIÇÃO' : 'CADASTRO'}] Dados do formulário:`, data);


    if (modoEdicao) {
      if (!hasChangesToUpdate(data as ProfessorEdicaoData)) {
        setMensagemSucesso('Nenhum campo foi preenchido. Dados mantidos inalterados.');
        onSucesso?.();
        return;
      }
      
      const totalCampos = countFieldsToUpdate(data as ProfessorEdicaoData);
      console.log(` [EDIÇÃO] ${totalCampos} campo(s) serão atualizados`);
    }

    setCarregando(true);
    setErro(null);

    try {
      const api = getAPIClient();
      
      if (modoEdicao && professorId) {

        const updateDTO = transformProfessorEdicaoToDTO(data as ProfessorEdicaoData);

        if (Object.keys(updateDTO).length === 0) {
          setMensagemSucesso('Nenhuma alteração detectada.');
          onSucesso?.();
          return;
        }
        
        console.log(` [EDIÇÃO] Atualizando professor ${professorId}`);
        console.log(`[EDIÇÃO] DTO para backend:`, updateDTO);
        
        await api.put(`/professor/${professorId}`, updateDTO);
        
        const totalCamposAtualizados = Object.keys(updateDTO).length;
        setMensagemSucesso(`Professor atualizado com sucesso! ${totalCamposAtualizados} campo(s) alterado(s).`);

      } else {
        // =====  CADASTRO =====
        const createDTO = transformProfessorCadastroToDTO(
          data as ProfessorCadastroData, 
          user.id
        );
        
        console.log(`[CADASTRO] Criando professor`);
        console.log(`[CADASTRO] DTO para backend:`, createDTO);
        
        await api.post(`/professor/${user.id}`, createDTO);
        setMensagemSucesso('Professor cadastrado com sucesso!');

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
      console.error(` [${modoEdicao ? 'EDIÇÃO' : 'CADASTRO'}] Erro:`, err);
      
      const errorMessage = handleProfessorError(
        err, 
        modoEdicao ? 'EditProfessor' : 'CreateProfessor'
      );
      setErro(errorMessage);
    } finally {
      setCarregando(false);
    }
  }, [user?.id, form, onSucesso, modoEdicao, professorId]);

  const resetFormForNewEdit = useCallback(() => {
    if (modoEdicao) {
      form.reset(prepareEmptyFormForEdit());
      limparMensagens();
    }
  }, [modoEdicao, form, limparMensagens]);

  const getCurrentFormStats = useCallback(() => {
    if (!modoEdicao) return null;
    
    const data = form.getValues() as ProfessorEdicaoData;
    return {
      hasChanges: hasChangesToUpdate(data),
      fieldsCount: countFieldsToUpdate(data)
    };
  }, [modoEdicao, form]);

  return {
    form,
    enviarFormulario,
    carregando,
    erro,
    mensagemSucesso,
    limparMensagens,
    modoEdicao,

    resetFormForNewEdit,
    getCurrentFormStats
  } as UseProfessorFormReturn & {
    resetFormForNewEdit: () => void;
    getCurrentFormStats: () => { hasChanges: boolean; fieldsCount: number } | null;
  };
};