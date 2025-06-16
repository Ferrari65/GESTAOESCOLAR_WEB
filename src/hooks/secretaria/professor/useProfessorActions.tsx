import { useState, useCallback, useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
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
      console.log(' [BUSCA] Buscando professor ID:', professorId);
      console.log(' [BUSCA] Secretaria ID:', user.id);
      
      const api = getAPIClient();
      
      console.log(' [BUSCA] Buscando na lista da secretaria...');
      
      const response = await api.get(`/professor/secretaria/${user.id}`);
      console.log(' [BUSCA] Lista da secretaria obtida:', response.data);
      
      let professoresList = response.data;
      
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
      
      console.log(` [BUSCA] Procurando professor ${professorId} em ${professoresList.length} registros...`);
      
      const professorEncontrado = professoresList.find((prof: any) => {
        const id = prof.id_professor || prof.idProfessor || prof.id || prof.CPF;
        console.log(` [BUSCA] Comparando: ${id} === ${professorId}`);
        return id === professorId;
      });
      
      if (!professorEncontrado) {
        console.error(' [BUSCA] Professor não encontrado na lista da secretaria');
        throw new Error(`Professor com ID ${professorId} não encontrado na sua secretaria`);
      }
      
      console.log('[BUSCA] Professor encontrado:', professorEncontrado);

      const professorMapeado: ProfessorResponse = {
        id_professor: professorEncontrado.id_professor || professorEncontrado.idProfessor || professorEncontrado.id || professorId,
        nome: professorEncontrado.nome || '',
        email: professorEncontrado.email || '',
        cpf: professorEncontrado.cpf || professorEncontrado.CPF || '',
        telefone: professorEncontrado.telefone || '',
        data_nasc: professorEncontrado.data_nasc || '',
        sexo: professorEncontrado.sexo || 'M',
        logradouro: professorEncontrado.logradouro || '',
        bairro: professorEncontrado.bairro || '',
        numero: professorEncontrado.numero || 0,
        cidade: professorEncontrado.cidade || '',
        uf: professorEncontrado.uf || professorEncontrado.UF || '',
        situacao: professorEncontrado.situacao || 'ATIVO'
      };

      if (!professorMapeado.nome || !professorMapeado.email) {
        console.error(' [BUSCA] Dados essenciais faltando:', {
          nome: professorMapeado.nome,
          email: professorMapeado.email
        });
        throw new Error('Dados essenciais do professor estão faltando');
      }

      console.log(' [BUSCA] Professor mapeado com sucesso:', {
        id: professorMapeado.id_professor,
        nome: professorMapeado.nome,
        email: professorMapeado.email
      });

      return professorMapeado;
      
    } catch (err: unknown) {
      console.error(' [BUSCA] Erro detalhado:', err);
      
      const { message } = handleApiError(err, 'BuscarProfessor');
      setErro(message);
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
      console.log(` [SITUACAO] Alterando situação de ${professorId} para ${novaSituacao}`);
      
      const api = getAPIClient();
      
      await api.put(`/professor/${professorId}`, { 
        situacao: novaSituacao 
      });
    
      console.log(`[SITUACAO] Professor ${professorId} agora está ${novaSituacao}`);
      setMensagemSucesso(`Professor ${novaSituacao.toLowerCase()} com sucesso!`);
      
    } catch (err: unknown) {
      console.error(' [SITUACAO] Erro ao alterar situação:', err);
      
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
      console.log(` [INATIVAR] Inativando professor ${professorId}`);
      
      const api = getAPIClient();
      
      await api.put(`/professor/${professorId}`, { 
        situacao: 'INATIVO' 
      });
      
      console.log(`✅ [INATIVAR] Professor ${professorId} inativado`);
      setMensagemSucesso('Professor inativado com sucesso!');
      
    } catch (err: unknown) {
      console.error(' [INATIVAR] Erro ao inativar professor:', err);
      
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