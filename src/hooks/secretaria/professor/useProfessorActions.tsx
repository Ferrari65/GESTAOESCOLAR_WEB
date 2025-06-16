import { useState, useCallback, useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { getAPIClient, handleApiError } from '@/services/api';
import { log } from '@/utils/logger';
import type { ProfessorResponse, SituacaoType } from '@/schemas/professor';

// ===== INTERFACES =====
interface UseProfessorActionsReturn {
  alterarSituacao: (professorId: string, novaSituacao: SituacaoType) => Promise<void>;
  inativarProfessor: (professorId: string) => Promise<void>;
  buscarProfessorPorId: (professorId: string) => Promise<ProfessorResponse | null>;
  carregando: boolean;
  erro: string | null;
  mensagemSucesso: string | null;
  limparMensagens: () => void;
  processandoProfessor: string | null;
}

// ===== HOOK PRINCIPAL =====
export const useProfessorActions = (): UseProfessorActionsReturn => {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [processandoProfessor, setProcessandoProfessor] = useState<string | null>(null);
  const { user } = useContext(AuthContext);

  const limparMensagens = useCallback(() => {
    setErro(null);
    setMensagemSucesso(null);
  }, []);

  // ===== BUSCAR PROFESSOR POR ID =====
  const buscarProfessorPorId = useCallback(async (professorId: string): Promise<ProfessorResponse | null> => {
    if (!professorId || professorId.trim() === '') {
      setErro('ID do professor é obrigatório');
      return null;
    }

    if (!user?.id) {
      setErro('ID da secretaria não encontrado. Faça login novamente.');
      return null;
    }

    setCarregando(true);
    setErro(null);

    try {
      const api = getAPIClient();
      
      // Buscar na lista da secretaria (estratégia que funciona)
      const response = await api.get(`/professor/secretaria/${user.id}`);
      
      let professoresList = response.data;
      
      // Garantir que é um array
      if (!Array.isArray(professoresList)) {
        if (professoresList.professores) {
          professoresList = professoresList.professores;
        } else if (professoresList.data) {
          professoresList = professoresList.data;
        } else if (professoresList.content) {
          professoresList = professoresList.content;
        } else {
          professoresList = [professoresList];
        }
      }
      
      // Buscar o professor específico na lista
      const professorEncontrado = professoresList.find((prof: Record<string, unknown>) => { // ✅ CORRIGIDO: any → Record<string, unknown>
        const id = prof.id_professor || prof.idProfessor || prof.id || prof.CPF;
        return id === professorId;
      });
      
      if (!professorEncontrado) {
        throw new Error(`Professor com ID ${professorId} não encontrado na sua secretaria`);
      }

      // Mapear os dados para o formato esperado
      const professor = professorEncontrado as Record<string, unknown>; // ✅ CORRIGIDO: Cast seguro
      const professorMapeado: ProfessorResponse = {
        id_professor: String(professor.id_professor || professor.idProfessor || professor.id || professorId),
        nome: String(professor.nome || ''),
        email: String(professor.email || ''),
        cpf: String(professor.cpf || professor.CPF || ''),
        telefone: String(professor.telefone || ''),
        data_nasc: String(professor.data_nasc || ''),
        sexo: String(professor.sexo || 'M'),
        logradouro: String(professor.logradouro || ''),
        bairro: String(professor.bairro || ''),
        numero: Number(professor.numero || 0),
        cidade: String(professor.cidade || ''),
        uf: String(professor.uf || professor.UF || ''),
        situacao: (professor.situacao as SituacaoType) || 'ATIVO'
      };

      // Validação final
      if (!professorMapeado.nome || !professorMapeado.email) {
        throw new Error('Dados essenciais do professor estão faltando');
      }

      return professorMapeado;
      
    } catch (err: unknown) {
      const { message } = handleApiError(err, 'BuscarProfessor');
      setErro(message);
      
      // ✅ Log apenas em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        log.error('PROFESSOR', 'Erro ao buscar professor por ID', err);
      }
      
      return null;
    } finally {
      setCarregando(false);
    }
  }, [user?.id]);

  // ===== ALTERAR SITUAÇÃO =====
  const alterarSituacao = useCallback(async (professorId: string, novaSituacao: SituacaoType): Promise<void> => {
    if (!professorId) {
      setErro('ID do professor é obrigatório');
      return;
    }

    if (!['ATIVO', 'INATIVO'].includes(novaSituacao)) {
      setErro('Situação deve ser ATIVO ou INATIVO');
      return;
    }

    setProcessandoProfessor(professorId);
    setCarregando(true);
    setErro(null);

    try {
      const api = getAPIClient();
      
      await api.put(`/professor/${professorId}`, { 
        situacao: novaSituacao 
      });
      
      setMensagemSucesso(`Professor ${novaSituacao.toLowerCase()} com sucesso!`);
      
      // ✅ Log apenas em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        log.success('PROFESSOR', `Professor ${professorId} agora está ${novaSituacao}`);
      }
      
    } catch (err: unknown) {
      const { message } = handleApiError(err, 'AlterarSituacao');
      setErro(message);

      // ✅ Log de erro apenas em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        log.error('PROFESSOR', 'Erro ao alterar situação', err);
      }

      throw err;
    } finally {
      setCarregando(false);
      setProcessandoProfessor(null);
    }
  }, []);

  // ===== INATIVAR PROFESSOR =====
  const inativarProfessor = useCallback(async (professorId: string): Promise<void> => {
    if (!professorId) {
      setErro('ID do professor é obrigatório');
      return;
    }
    
    setProcessandoProfessor(professorId);
    setCarregando(true);
    setErro(null);

    try {
      const api = getAPIClient();
      
      await api.put(`/professor/${professorId}`, { 
        situacao: 'INATIVO' 
      });
      
      setMensagemSucesso('Professor inativado com sucesso!');
      
      // ✅ Log apenas em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        log.success('PROFESSOR', `Professor ${professorId} inativado`);
      }
      
    } catch (err: unknown) {
      const { message } = handleApiError(err, 'InativarProfessor');
      setErro(message);
      
      // ✅ Log de erro apenas em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        log.error('PROFESSOR', 'Erro ao inativar professor', err);
      }
      
      throw err;
    } finally {
      setCarregando(false);
      setProcessandoProfessor(null);
    }
  }, []);

  return {
    alterarSituacao,
    inativarProfessor,
    buscarProfessorPorId,
    carregando,
    erro,
    mensagemSucesso,
    limparMensagens,
    processandoProfessor
  };
};