import { useState, useCallback } from 'react';
import { getAPIClient, handleApiError } from '@/services/api';
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

  const limparMensagens = useCallback(() => {
    setErro(null);
    setMensagemSucesso(null);
  }, []);

  // ===== BUSCAR PROFESSOR POR ID =====
  const buscarProfessorPorId = useCallback(async (professorId: string): Promise<ProfessorResponse | null> => {
    if (!professorId) {
      setErro('ID do professor é obrigatório');
      return null;
    }

    setCarregando(true);
    setErro(null);

    try {
      const api = getAPIClient();
      const response = await api.get(`/professor/${professorId}`);
      
      console.log(' Professor encontrado:', response.data);
      return response.data;
      
    } catch (err: unknown) {
      console.error(' Erro ao buscar professor:', err);
      
      const { message } = handleApiError(err, 'BuscarProfessor');
      setErro(message);
      return null;
    } finally {
      setCarregando(false);
    }
  }, []);

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
      await api.put(`/professor/${professorId}`, { situacao: novaSituacao });
      
      console.log(` Professor ${professorId} agora está ${novaSituacao}`);
      setMensagemSucesso(`Professor ${novaSituacao.toLowerCase()} com sucesso!`);
      
    } catch (err: unknown) {
      console.error(' Erro ao alterar situação:', err);
      
      const { message } = handleApiError(err, 'AlterarSituacao');
      setErro(message);

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
      await api.delete(`/professor/${professorId}/situacao`);
      
      console.log(` Professor ${professorId} inativado`);
      setMensagemSucesso('Professor inativado com sucesso!');
      
    } catch (err: unknown) {
      console.error(' Erro ao inativar professor:', err);
      
      const { message } = handleApiError(err, 'InativarProfessor');
      setErro(message);
      
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