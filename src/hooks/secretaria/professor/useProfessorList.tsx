import { useState, useContext, useCallback, useEffect } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { getAPIClient, handleApiError } from '@/services/api';
import type { ProfessorResponse } from '@/schemas/professor';

// ===== INTERFACES =====
interface UseProfessorListReturn {
  professores: ProfessorResponse[];
  carregando: boolean;
  erro: string | null;
  recarregar: () => void;
  limparErro: () => void;
  atualizarProfessor: (professorId: string, novosDados: Partial<ProfessorResponse>) => void;
}

// ===== BACKEND =====
interface ProfessorBackendDTO {
  nome: string;
  CPF: string;
  situacao: 'ATIVO' | 'INATIVO';
  logradouro: string;
  bairro: string;
  numero: number;
  cidade: string;
  UF: string;
  email: string;
  senha?: string | null;
  telefone: string;
  sexo: string;
  data_nasc: string; 
  id_secretaria: string;

  id?: string;
  idProfessor?: string;
  id_professor?: string;
}


function mapearProfessorDoBackend(professorBackend: ProfessorBackendDTO): ProfessorResponse | null {
  try {
    console.log(' [MAPPER] Mapeando professor:', professorBackend);

    const id = professorBackend.id_professor || 
               professorBackend.idProfessor || 
               professorBackend.id ||
               professorBackend.CPF || 
               '';

    console.log(' [MAPPER] ID encontrado:', id);

    const professorMapeado: ProfessorResponse = {
      id_professor: id,
      nome: professorBackend.nome || '',
      email: professorBackend.email || '',
      cpf: professorBackend.CPF || '', // 
      telefone: professorBackend.telefone || '',
      data_nasc: professorBackend.data_nasc || '',
      sexo: professorBackend.sexo || 'M',
      logradouro: professorBackend.logradouro || '',
      bairro: professorBackend.bairro || '',
      numero: professorBackend.numero || 0,
      cidade: professorBackend.cidade || '',
      uf: professorBackend.UF || '', 
      situacao: professorBackend.situacao || 'ATIVO'
    };

    const temNome = professorMapeado.nome && professorMapeado.nome.trim() !== '';
    const temCPF = professorMapeado.cpf && professorMapeado.cpf.trim() !== '';
    const temEmail = professorMapeado.email && professorMapeado.email.trim() !== '';
    const temId = professorMapeado.id_professor && professorMapeado.id_professor.trim() !== '';

    console.log(' [MAPPER] Validação:', {
      nome: professorMapeado.nome,
      cpf: professorMapeado.cpf,
      email: professorMapeado.email,
      id: professorMapeado.id_professor,
      temNome,
      temCPF,
      temEmail,
      temId
    });


    if (!temNome || !temEmail) {
      console.log(' [MAPPER] Professor inválido - falta nome ou email');
      return null;
    }

    if (!temId && temCPF) {
      professorMapeado.id_professor = professorMapeado.cpf;
      console.log(' [MAPPER] Usando CPF como ID:', professorMapeado.cpf);
    }

    console.log(' [MAPPER] Professor válido:', professorMapeado);
    return professorMapeado;

  } catch (error) {
    console.error(' [MAPPER] Erro ao mapear professor:', error);
    return null;
  }
}

// ===== HOOK PRINCIPAL =====
export const useProfessorList = (): UseProfessorListReturn => {
  const [professores, setProfessores] = useState<ProfessorResponse[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const { user } = useContext(AuthContext);

  const limparErro = useCallback(() => setErro(null), []);

  const atualizarProfessor = useCallback((professorId: string, novosDados: Partial<ProfessorResponse>) => {
    console.log(' [LIST] Atualizando professor na lista:', { professorId, novosDados });
    setProfessores(prev => 
      prev.map(professor => 
        professor.id_professor === professorId 
          ? { ...professor, ...novosDados }
          : professor
      )
    );
  }, []);

  const buscarProfessores = useCallback(async () => {
    console.log(' [LIST] Iniciando busca de professores...');
    
    if (!user?.id) {
      const erroMsg = 'ID da secretaria não encontrado. Faça login novamente.';
      console.error(' [LIST] Erro:', erroMsg);
      setErro(erroMsg);
      return;
    }

    console.log(' [LIST] User ID encontrado:', user.id);

    setCarregando(true);
    setErro(null);

    try {
      const api = getAPIClient();

      const endpointsParaTestar = [
        `/professor/secretaria/${user.id}`,
        `/professor/${user.id}/secretaria`, 
        `/professor/lista/${user.id}`,
        `/professor/all/${user.id}`,
        `/professor`,
        `/professores`, // Plural
        `/professores/secretaria/${user.id}`
      ];

      let response = null;
      let endpointUsado = '';

      for (const endpoint of endpointsParaTestar) {
        try {
          console.log(` [LIST] Tentando endpoint: ${endpoint}`);
          response = await api.get(endpoint);
          endpointUsado = endpoint;
          console.log(` [LIST] Sucesso com endpoint: ${endpoint}`);
          break;
        } catch (err: any) {
          console.log(` [LIST] Falhou endpoint ${endpoint}:`, err.response?.status);
          continue;
        }
      }

      if (!response) {
        throw new Error('Nenhum endpoint de professores funcionou. Verifique a API.');
      }

      console.log(' [LIST] Resposta da API:', response.data);

      let professoresData = response.data;
      
      if (!Array.isArray(professoresData)) {
        console.log(' [LIST] Dados não são array, tentando extrair...');
        
        if (professoresData.professores && Array.isArray(professoresData.professores)) {
          professoresData = professoresData.professores;
          console.log(' [LIST] Encontrado em .professores');
        } else if (professoresData.data && Array.isArray(professoresData.data)) {
          professoresData = professoresData.data;
          console.log(' [LIST] Encontrado em .data');
        } else if (professoresData.content && Array.isArray(professoresData.content)) {
          professoresData = professoresData.content;
          console.log(' [LIST] Encontrado em .content (paginação Spring)');
        } else {

          professoresData = [professoresData];
          console.log(' [LIST] Convertendo objeto único em array');
        }
      }

      console.log(` [LIST] Processando ${professoresData.length} professores...`);

      const professoresValidos: ProfessorResponse[] = [];
      
      for (let i = 0; i < professoresData.length; i++) {
        const professorBackend = professoresData[i];
        console.log(` [LIST] Processando professor ${i + 1}:`, professorBackend);
        
        const professorMapeado = mapearProfessorDoBackend(professorBackend);
        
        if (professorMapeado) {
          professoresValidos.push(professorMapeado);
          console.log(` [LIST] Professor ${professorMapeado.nome} adicionado`);
        } else {
          console.log(` [LIST] Professor ${i + 1} rejeitado`);
        }
      }

      console.log(` [LIST] Total de professores válidos: ${professoresValidos.length}`);
      setProfessores(professoresValidos);
      
    } catch (err: unknown) {
      console.error(' [LIST] Erro ao buscar professores:', err);
      
      const { message } = handleApiError(err, 'FetchProfessores');
      setErro(message);
      setProfessores([]);
    } finally {
      setCarregando(false);
    }
  }, [user?.id]);


  const recarregar = useCallback(() => {
    console.log(' [LIST] Recarregando lista...');
    limparErro();
    buscarProfessores();
  }, [buscarProfessores, limparErro]);


  useEffect(() => {
    console.log(' [LIST] Efeito inicial - User ID:', user?.id);
    if (user?.id) {
      buscarProfessores();
    }
  }, [user?.id, buscarProfessores]);

  return {
    professores,
    carregando,
    erro,
    recarregar,
    limparErro,
    atualizarProfessor
  };
};