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
  cleanCPF,
  cleanPhone
} from '@/schemas/professor';

// =====  BACKEND =====
interface ProfessorCreateDTO {
  nome: string;
  CPF: string;
  situacao: 'ATIVO';
  logradouro: string;
  bairro: string;
  numero: number;
  cidade: string;
  UF: string;
  email: string;
  senha: string;
  telefone: string;
  sexo: string;
  data_nasc: string;
  id_secretaria: string;
}

interface ProfessorUpdateDTO {
  nome?: string;
  CPF?: string;
  situacao?: 'ATIVO' | 'INATIVO';
  logradouro?: string;
  bairro?: string;
  numero?: number;
  cidade?: string;
  UF?: string;
  email?: string;
  senha?: string;
  telefone?: string;
  sexo?: string;
  data_nasc?: string;
  id_secretaria?: string;
}

type ProfessorFormData = ProfessorCadastroData | ProfessorEdicaoData;

function transformFormToCreateDTO(data: ProfessorCadastroData, secretariaId: string): ProfessorCreateDTO {
  const cpfLimpo = cleanCPF(data.cpf);
  const telefoneLimpo = cleanPhone(data.telefone);
  const numeroInt = parseInt(data.numero, 10);

  if (isNaN(numeroInt) || numeroInt <= 0) {
    throw new Error('Número deve ser um valor válido maior que zero');
  }

  return {
    nome: data.nome.trim(),
    CPF: cpfLimpo,
    email: data.email.trim().toLowerCase(),
    senha: data.senha || '',
    logradouro: data.logradouro.trim(),
    bairro: data.bairro.trim(),
    numero: numeroInt,
    cidade: data.cidade.trim(),
    UF: data.uf.toUpperCase(),
    sexo: data.sexo,
    telefone: telefoneLimpo,
    data_nasc: data.data_nasc,
    situacao: 'ATIVO',
    id_secretaria: secretariaId
  };
}

function transformFormToUpdateDTO(
  data: ProfessorFormData, 
  dadosOriginais: ProfessorResponse
): ProfessorUpdateDTO {
  const updateDTO: ProfessorUpdateDTO = {};
  
  const cpfLimpo = cleanCPF((data as any).cpf || '');
  const telefoneLimpo = cleanPhone(data.telefone);
  const numeroInt = parseInt(data.numero, 10);

  // Só adiciona campos que foram alterados
  if (data.nome.trim() !== dadosOriginais.nome) {
    updateDTO.nome = data.nome.trim();
  }

  if (cpfLimpo && cpfLimpo !== cleanCPF(dadosOriginais.cpf)) {
    updateDTO.CPF = cpfLimpo;
  }

  if (data.email.trim().toLowerCase() !== dadosOriginais.email.toLowerCase()) {
    updateDTO.email = data.email.trim().toLowerCase();
  }

  if (telefoneLimpo !== cleanPhone(dadosOriginais.telefone)) {
    updateDTO.telefone = telefoneLimpo;
  }

  if (data.data_nasc !== dadosOriginais.data_nasc) {
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
    updateDTO.senha = senha;
  }

  console.log(' [UPDATE] Campos alterados:', updateDTO);
  console.log(' [UPDATE] Dados originais:', dadosOriginais);
  console.log(' [UPDATE] Dados do form:', data);

  return updateDTO;
}

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

        const updateDTO = transformFormToUpdateDTO(data, dadosIniciais);
        
        if (Object.keys(updateDTO).length === 0) {
          setMensagemSucesso('Nenhuma alteração detectada.');
          onSucesso?.();
          return;
        }
        
        console.log(' [PUT] Enviando para /professor/' + professorId, updateDTO);
        await api.put(`/professor/${professorId}`, updateDTO);
        setMensagemSucesso('Professor atualizado com sucesso!');
        
      } else {
        
        const createDTO = transformFormToCreateDTO(data as ProfessorCadastroData, user.id);
        console.log(' [POST] Enviando para /professor/' + user.id, createDTO);
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
      console.error(' Erro na requisição:', err);
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