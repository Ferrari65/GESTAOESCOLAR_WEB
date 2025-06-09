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
  type ProfessorCreateDTO,
  type ProfessorUpdateDTO,
  type ProfessorResponse,
  cleanCPF,
  cleanPhone
} from '@/schemas/professor';

// ===== TIPOS =====
type ProfessorFormData = ProfessorCadastroData | ProfessorEdicaoData;

// ===== FUNÇÃO PARA CRIAR PROFESSOR =====
function transformFormToCreateDTO(data: ProfessorCadastroData, secretariaId: string): ProfessorCreateDTO {
  const cpfLimpo = cleanCPF(data.cpf);
  const telefoneLimpo = cleanPhone(data.telefone);
  const numeroInt = parseInt(data.numero, 10);

  if (isNaN(numeroInt) || numeroInt <= 0) {
    throw new Error('Número deve ser um valor válido maior que zero');
  }

  if (cpfLimpo.length !== 11) {
    throw new Error('CPF deve ter 11 dígitos');
  }

  if (telefoneLimpo.length !== 10 && telefoneLimpo.length !== 11) {
    throw new Error('Telefone deve ter 10 ou 11 dígitos');
  }

  // Validar formato da data (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.data_nasc)) {
    throw new Error('Data de nascimento deve estar no formato YYYY-MM-DD');
  }


  return {
    nome: data.nome.trim(),
    CPF: cpfLimpo,
    situacao: 'ATIVO',                  
    logradouro: data.logradouro.trim(),
    bairro: data.bairro.trim(),
    numero: numeroInt,                   
    UF: data.uf.toUpperCase(),
    email: data.email.trim().toLowerCase(),
    senha: data.senha,
    telefone: telefoneLimpo,
    sexo: data.sexo,
    data_nasc: data.data_nasc,        
    id_secretaria: secretariaId
  };
}

// =====  EDITAR PROFESSOR =====
function transformFormToUpdateDTO(
  data: ProfessorFormData, 
  dadosOriginais: ProfessorResponse
): ProfessorUpdateDTO {
  const updateDTO: ProfessorUpdateDTO = {};
  
  const telefoneLimpo = cleanPhone(data.telefone);
  const numeroInt = parseInt(data.numero, 10);
  
  if (data.nome.trim() !== dadosOriginais.nome) {
    updateDTO.nome = data.nome.trim();
  }

  if (data.email.trim().toLowerCase() !== dadosOriginais.email.toLowerCase()) {
    updateDTO.email = data.email.trim().toLowerCase();
  }

  if (telefoneLimpo !== cleanPhone(dadosOriginais.telefone)) {
    updateDTO.telefone = telefoneLimpo;
  }

  if (data.data_nasc !== dadosOriginais.data_nasc) {
  
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.data_nasc)) {
      throw new Error('Data de nascimento deve estar no formato YYYY-MM-DD');
    }
    updateDTO.data_nasc = data.data_nasc; 
  }

  if (data.sexo !== dadosOriginais.sexo) {
    updateDTO.sexo = data.sexo;
  }

  if (data.logradouro.trim() !== dadosOriginais.logradouro) {
    updateDTO.logradouro = data.logradouro.trim();
  }

  if (data.bairro.trim() !== dadosOriginais.bairro) {
    updateDTO.bairro = data.bairro.trim();
  }

  if (numeroInt !== dadosOriginais.numero) {
    updateDTO.numero = numeroInt; 
  }

  if (data.cidade.trim() !== dadosOriginais.cidade) {
    updateDTO.cidade = data.cidade.trim();
  }

  if (data.uf.toUpperCase() !== dadosOriginais.uf.toUpperCase()) {
    updateDTO.UF = data.uf.toUpperCase();
  }

  const senha = (data as any).senha;
  if (senha && senha.trim() !== '') {
    updateDTO.senha = senha.trim();
  }

  return updateDTO;
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
      if (message.toLowerCase().includes('constraint')) {
        return 'Dados duplicados: CPF ou email já existem no sistema.';
      }
      if (message.toLowerCase().includes('data_nasc') || message.toLowerCase().includes('date')) {
        return 'Formato de data inválido. Use o formato YYYY-MM-DD.';
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
    
    case 422:
      return 'Dados inconsistentes. Verifique todas as informações.';
    
    case 500:
      return 'Erro interno do servidor. Tente novamente em alguns minutos.';
    
    default:
      return message || 'Erro desconhecido. Tente novamente.';
  }
}

// ===== INTERFACES =====
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

  const form = useForm<ProfessorFormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      nome: dadosIniciais?.nome || '',
      cpf: dadosIniciais?.cpf || '',
      email: dadosIniciais?.email || '',
      senha: '', // Sempre vazio inicialmente
      telefone: dadosIniciais?.telefone || '',
      data_nasc: dadosIniciais?.data_nasc || '',
      sexo: (dadosIniciais?.sexo as 'M' | 'F') || 'M',
      logradouro: dadosIniciais?.logradouro || '',
      bairro: dadosIniciais?.bairro || '',
      numero: dadosIniciais?.numero?.toString() || '',
      cidade: dadosIniciais?.cidade || '',
      uf: dadosIniciais?.uf || ''
    }
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

    const isValid = await form.trigger();
    if (!isValid) {
      setErro('Por favor, corrija os erros no formulário.');
      return;
    }

    const data = form.getValues();

    setCarregando(true);
    setErro(null);

    try {
      const api = getAPIClient();
      
      if (modoEdicao && professorId && dadosIniciais) {
        // ===== MODO EDIÇÃO =====
        const updateDTO = transformFormToUpdateDTO(data, dadosIniciais);

        if (Object.keys(updateDTO).length === 0) {
          setMensagemSucesso('Nenhuma alteração detectada.');
          onSucesso?.();
          return;
        }
        
        console.log(' [EDIÇÃO] Dados do formulário:', data);
        console.log(' [EDIÇÃO] DTO para backend:', updateDTO);
        console.log(' [EDIÇÃO] Endpoint:', `/professor/${professorId}`);
        
        await api.put(`/professor/${professorId}`, updateDTO);
        setMensagemSucesso('Professor atualizado com sucesso!');
        
      } else {
        // ===== MODO CADASTRO =====
        const createDTO = transformFormToCreateDTO(data as ProfessorCadastroData, user.id);
        

        console.log(' [CADASTRO] Dados do formulário:', data);
        console.log(' [CADASTRO] DTO para backend:', createDTO);
        console.log(' [CADASTRO] Endpoint:', `/professor/${user.id}`);
        console.log(' [CADASTRO] Validações críticas:', {
          nomeOk: !!createDTO.nome && createDTO.nome.length > 0,
          cpfOk: createDTO.CPF?.length === 11,
          emailOk: createDTO.email?.includes('@'),
          senhaOk: createDTO.senha?.length >= 6,
          telefoneOk: createDTO.telefone?.length >= 10,
          dataNascOk: /^\d{4}-\d{2}-\d{2}$/.test(createDTO.data_nasc),
          sexoOk: ['M', 'F'].includes(createDTO.sexo),
          numeroOk: !isNaN(createDTO.numero) && createDTO.numero > 0,
          ufOk: createDTO.UF?.length === 2,
          situacaoOk: createDTO.situacao === 'ATIVO',
          secretariaIdOk: !!createDTO.id_secretaria
        });
        
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
      console.error(' [ERRO] Detalhes completos:', err);
 
      if ((err as any).response) {
        console.error(' [ERRO] Response data:', (err as any).response.data);
        console.error(' [ERRO] Response status:', (err as any).response.status);
        console.error(' [ERRO] Response headers:', (err as any).response.headers);
      }
      
      const errorMessage = handleProfessorError(err, modoEdicao ? 'EditProfessor' : 'CreateProfessor');
      setErro(errorMessage);
    } finally {
      setCarregando(false);
    }
  }, [user?.id, form, onSucesso, modoEdicao, professorId, dadosIniciais]);

  return {
    form,
    enviarFormulario,
    carregando,
    erro,
    mensagemSucesso,
    limparMensagens,
    modoEdicao
  };
};