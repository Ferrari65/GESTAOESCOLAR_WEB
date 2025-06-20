import type { 
  ProfessorCadastroData,
  ProfessorEdicaoData,
  ProfessorCreateDTO,   
  ProfessorUpdateDTO,
  AlunoCadastroData,
  AlunoCreateDTO,
  TurmaListItem  // ← ADICIONADO
} from '@/schemas/professor';


// ===== UTILITÁRIOS =====
export const cleanCPF = (cpf: string): string => cpf.replace(/[^\d]/g, '');
export const cleanPhone = (phone: string): string => phone.replace(/[^\d]/g, '');

// ===== PROFESSOR - CADASTRO =====
export const transformProfessorCadastroToDTO = (
  data: ProfessorCadastroData,
  secretariaId: string
): ProfessorCreateDTO => {
  
  const cpfLimpo = cleanCPF(data.cpf);
  const telefoneLimpo = cleanPhone(data.telefone);
  const numeroInt = parseInt(data.numero, 10);

  if (cpfLimpo.length !== 11) throw new Error('CPF deve ter 11 dígitos');
  if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) throw new Error('Telefone inválido');
  if (isNaN(numeroInt) || numeroInt <= 0) throw new Error('Número deve ser válido');

  return {
    nome: data.nome.trim(),
    CPF: cpfLimpo,
    situacao: 'ATIVO',
    logradouro: data.logradouro.trim(),
    bairro: data.bairro.trim(),
    numero: numeroInt,
    cidade: data.cidade.trim(),
    UF: data.uf.toUpperCase(),
    email: data.email.trim().toLowerCase(),
    senha: data.senha,
    telefone: telefoneLimpo,
    sexo: data.sexo,
    data_nasc: data.data_nasc,
    id_secretaria: secretariaId
  };
};

// ===== ALUNO - CADASTRO (CORRIGIDO) =====
export const transformAlunoCadastroToDTO = (
  data: AlunoCadastroData
): AlunoCreateDTO => {
  
  // Reutiliza toda a lógica do professor
  const professorDTO = transformProfessorCadastroToDTO(data, 'fake-id');
  
  // Remove campo do professor e adiciona do aluno
  const { id_secretaria, ...baseDTO } = professorDTO; 

  return {
    ...baseDTO,
    matricula: data.matricula, // Já processado pelo schema (.trim() + .toUpperCase())
  };
};

// ===== TURMA MAPPER (CORRIGIDO) =====
export const mapTurmaFromBackend = (turmaBackend: any): TurmaListItem | null => {
  try {
    console.log('🔄 [TURMA-MAPPER] Mapeando turma:', turmaBackend);

    const id = turmaBackend.idTurma || turmaBackend.id || turmaBackend.id_turma || '';
    const nome = turmaBackend.nome || '';
    const ano = turmaBackend.ano || '';
    const turno = turmaBackend.turno || 'DIURNO';

    // Buscar nome do curso em diferentes estruturas
    let nomeCurso = '';
    if (turmaBackend.curso?.nome) {
      nomeCurso = turmaBackend.curso.nome;
    } else if (turmaBackend.nomeCurso) {
      nomeCurso = turmaBackend.nomeCurso;
    } else if (turmaBackend.curso_nome) {
      nomeCurso = turmaBackend.curso_nome;
    }

    if (!id || !nome) {
      console.log('❌ [TURMA-MAPPER] Turma inválida - falta ID ou nome');
      return null;
    }

    const turmaMapeada: TurmaListItem = {
      id: String(id),
      nome: String(nome).trim(),
      ano: String(ano),
      turno: turno as 'DIURNO' | 'NOTURNO',
      nomeCurso: nomeCurso || 'Curso não informado'
    };

    console.log('✅ [TURMA-MAPPER] Turma mapeada:', turmaMapeada);
    return turmaMapeada;

  } catch (error) {
    console.error('❌ [TURMA-MAPPER] Erro ao mapear turma:', error);
    return null;
  }
};

// ===== HELPER PARA VALIDAÇÃO =====
export const validateTurmaData = (turma: any): boolean => {
  if (!turma) return false;
  try {
    mapTurmaFromBackend(turma);
    return true;
  } catch {
    return false;
  }
};

// ===== PROFESSOR - EDIÇÃO =====
export const transformProfessorEdicaoToDTO = (
  data: ProfessorEdicaoData
): ProfessorUpdateDTO => {
  
  const updateDTO: ProfessorUpdateDTO = {};
  
  console.log('🔄 [EDIT] Dados do formulário:', data);

  if (data.nome !== undefined) {
    updateDTO.nome = data.nome.trim();
  }

  if (data.email !== undefined) {
    updateDTO.email = data.email.trim().toLowerCase();
  }

  if (data.telefone !== undefined) {
    updateDTO.telefone = cleanPhone(data.telefone);
  }

  if (data.data_nasc !== undefined) {
    updateDTO.data_nasc = data.data_nasc;
  }

  if (data.sexo !== undefined) {
    updateDTO.sexo = data.sexo;
  }

  if (data.logradouro !== undefined) {
    updateDTO.logradouro = data.logradouro.trim();
  }

  if (data.bairro !== undefined) {
    updateDTO.bairro = data.bairro.trim();
  }

  if (data.numero !== undefined) {
    const numeroInt = parseInt(data.numero, 10);
    if (!isNaN(numeroInt)) {
      updateDTO.numero = numeroInt;
    }
  }

  if (data.cidade !== undefined) {
    updateDTO.cidade = data.cidade.trim();
  }

  if (data.uf !== undefined) {
    updateDTO.UF = data.uf.toUpperCase();
  }

  if (data.senha !== undefined) {
    updateDTO.senha = data.senha.trim();
  }

  console.log('✅ [EDIT] DTO final (só campos alterados):', updateDTO);
  console.log('📊 [EDIT] Total de campos que serão atualizados:', Object.keys(updateDTO).length);
  
  return updateDTO;
};

export const prepareEmptyFormForEdit = (): ProfessorEdicaoData => {
  return {
    nome: '',
    email: '',
    telefone: '',
    data_nasc: '',
    sexo: undefined,
    logradouro: '',
    bairro: '',
    numero: '',
    cidade: '',
    uf: '',
    senha: '',
    cpf: '', 
  };
};

export const hasChangesToUpdate = (data: ProfessorEdicaoData): boolean => {
  const fieldsToCheck = [
    'nome', 'email', 'telefone', 'data_nasc', 'sexo',
    'logradouro', 'bairro', 'numero', 'cidade', 'uf', 'senha'
  ] as const;

  return fieldsToCheck.some(field => {
    const value = data[field];
    return value !== undefined && value !== '';
  });
};

export const countFieldsToUpdate = (data: ProfessorEdicaoData): number => {
  const fieldsToCheck = [
    'nome', 'email', 'telefone', 'data_nasc', 'sexo',
    'logradouro', 'bairro', 'numero', 'cidade', 'uf', 'senha'
  ] as const;

  return fieldsToCheck.filter(field => {
    const value = data[field];
    return value !== undefined && value !== '';
  }).length;
};

export const getFieldsToUpdate = (data: ProfessorEdicaoData): string[] => {
  const fieldNames: Record<string, string> = {
    nome: 'Nome',
    email: 'Email', 
    telefone: 'Telefone',
    data_nasc: 'Data de Nascimento',
    sexo: 'Sexo',
    logradouro: 'Logradouro',
    bairro: 'Bairro',
    numero: 'Número',
    cidade: 'Cidade',
    uf: 'UF',
    senha: 'Senha'
  };

  return Object.entries(data)
    .filter(([key, value]) => value !== undefined && value !== '' && key !== 'cpf')
    .map(([key]) => fieldNames[key] || key);
};