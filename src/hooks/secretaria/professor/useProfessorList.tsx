import { useState, useContext, useCallback, useEffect } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { getAPIClient, handleApiError } from '@/services/api';
import { log } from '@/utils/logger';
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

// ===== BACKEND MAPPING =====
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
    const id = professorBackend.id_professor || 
               professorBackend.idProfessor || 
               professorBackend.id ||
               professorBackend.CPF || 
               '';

    const professorMapeado: ProfessorResponse = {
      id_professor: id,
      nome: professorBackend.nome || '',
      email: professorBackend.email || '',
      cpf: professorBackend.CPF || '',
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

    // Validações essenciais
    const temNome = professorMapeado.nome && professorMapeado.nome.trim() !== '';
    const temEmail = professorMapeado.email && professorMapeado.email.trim() !== '';
    const temId = professorMapeado.id_professor && professorMapeado.id_professor.trim() !== '';

    if (!temNome || !temEmail) {
      return null;
    }

    // Se não tem ID mas tem CPF, usar CPF como ID
    if (!temId && professorMapeado.cpf) {
      professorMapeado.id_professor = professorMapeado.cpf;
    }

    return professorMapeado;

  } catch (error) {
    // ✅ Log apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      log.warn('PROFESSOR', 'Erro ao mapear professor do backend', error);
    }
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
    setProfessores(prev => 
      prev.map(professor => 
        professor.id_professor === professorId 
          ? { ...professor, ...novosDados }
          : professor
      )
    );
  }, []);

  const buscarProfessores = useCallback(async () => {
    if (!user?.id) {
      setErro('ID da secretaria não encontrado. Faça login novamente.');
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      const api = getAPIClient();

      // Lista de endpoints para testar
      const endpointsParaTestar = [
        `/professor/secretaria/${user.id}`,
        `/professor/${user.id}/secretaria` 
      ];

      let response = null;


      for (const endpoint of endpointsParaTestar) {
        try {
          response = await api.get(endpoint);
          break; 
        } catch (_: unknown) {
          
          if (endpoint === endpointsParaTestar[endpointsParaTestar.length - 1]) {
            throw new Error('Nenhum endpoint de professores funcionou. Verifique a API.');
          }
          continue; 
        }
      }

      if (!response) {
        throw new Error('Nenhum endpoint de professores funcionou. Verifique a API.');
      }

      let professoresData = response.data;
      
      // Normalizar estrutura de dados
      if (!Array.isArray(professoresData)) {
        if (professoresData.professores && Array.isArray(professoresData.professores)) {
          professoresData = professoresData.professores;
        } else if (professoresData.data && Array.isArray(professoresData.data)) {
          professoresData = professoresData.data;
        } else if (professoresData.content && Array.isArray(professoresData.content)) {
          professoresData = professoresData.content;
        } else {
          // Se for um objeto único, transformar em array
          professoresData = [professoresData];
        }
      }

      const professoresValidos: ProfessorResponse[] = [];
      
      // Mapear e validar cada professor
      for (const professorBackend of professoresData) {
        const professorMapeado = mapearProfessorDoBackend(professorBackend);
        
        if (professorMapeado) {
          professoresValidos.push(professorMapeado);
        }
      }

      setProfessores(professoresValidos);
  
      if (process.env.NODE_ENV === 'development') {
        log.success('PROFESSOR', `${professoresValidos.length} professores carregados`);
      }
      
    } catch (err: unknown) {
      const { message } = handleApiError(err, 'FetchProfessores');
      setErro(message);
      setProfessores([]);
      
      // ✅ Log de erro apenas em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        log.error('PROFESSOR', 'Erro ao buscar professores', err);
      }
    } finally {
      setCarregando(false);
    }
  }, [user?.id]);

  const recarregar = useCallback(() => {
    limparErro();
    buscarProfessores();
  }, [buscarProfessores, limparErro]);

  // Efeito inicial
  useEffect(() => {
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