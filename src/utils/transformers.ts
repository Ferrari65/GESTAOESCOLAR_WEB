// src/utils/transformers.ts

import type { 
  ProfessorCadastroData,
  ProfessorEdicaoData,
  ProfessorCreateDTO,   
  ProfessorUpdateDTO,
  AlunoCadastroData,
  AlunoCreateDTO,
  TurmaListItem  
} from '@/schemas/professor';

import type { 
  TurmaFormData,
  TurmaDTO,
  CursoFormData,
  CursoDTO,
  DisciplinaFormData,
  DisciplinaDTO
} from '@/schemas/index';

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

// ===== ALUNO - CADASTRO =====
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

// ===== PROFESSOR - EDIÇÃO =====
export const transformProfessorEdicaoToDTO = (
  data: ProfessorEdicaoData
): ProfessorUpdateDTO => {
  
  const updateDTO: ProfessorUpdateDTO = {};
  
  console.log('🔄 [EDIT] Dados do formulário:', data);

  if (data.nome !== undefined && data.nome !== '') {
    updateDTO.nome = data.nome.trim();
  }

  if (data.email !== undefined && data.email !== '') {
    updateDTO.email = data.email.trim().toLowerCase();
  }

  if (data.telefone !== undefined && data.telefone !== '') {
    updateDTO.telefone = cleanPhone(data.telefone);
  }

  if (data.data_nasc !== undefined && data.data_nasc !== '') {
    updateDTO.data_nasc = data.data_nasc;
  }

  if (data.sexo !== undefined) {
    updateDTO.sexo = data.sexo;
  }

  if (data.logradouro !== undefined && data.logradouro !== '') {
    updateDTO.logradouro = data.logradouro.trim();
  }

  if (data.bairro !== undefined && data.bairro !== '') {
    updateDTO.bairro = data.bairro.trim();
  }

  if (data.numero !== undefined && data.numero !== '') {
    const numeroInt = parseInt(data.numero, 10);
    if (!isNaN(numeroInt)) {
      updateDTO.numero = numeroInt;
    }
  }

  if (data.cidade !== undefined && data.cidade !== '') {
    updateDTO.cidade = data.cidade.trim();
  }

  if (data.uf !== undefined && data.uf !== '') {
    updateDTO.UF = data.uf.toUpperCase();
  }

  if (data.senha !== undefined && data.senha !== '') {
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

// ===== TURMA - TRANSFORMADORES =====
export const transformTurmaFormToDTO = (data: TurmaFormData): TurmaDTO => {
  console.log('🔄 [TURMA-TRANSFORMER] Transformando dados do formulário:', data);
  
  const turmaDTO: TurmaDTO = {
    nome: data.nome.trim(),
    ano: data.ano,
    turno: data.turno,
  };
  
  console.log('✅ [TURMA-TRANSFORMER] DTO criado:', turmaDTO);
  return turmaDTO;
};

// ===== TURMA MAPPER COM LOOKUP DE CURSO =====
export const mapTurmaWithCurso = (turmaBackend: any, cursos: any[]): TurmaListItem | null => {
  try {
    console.log('🔄 [TURMA-CURSO] Mapeando turma com lookup de curso:', turmaBackend);

    const id = turmaBackend.idTurma || turmaBackend.id || turmaBackend.id_turma || '';
    const nome = turmaBackend.nome || '';
    const ano = turmaBackend.ano || '';
    const turno = turmaBackend.turno || 'DIURNO';
    
    // ✨ BUSCAR ID DO CURSO NA TURMA
    const idCurso = turmaBackend.idCurso || 
                   turmaBackend.id_curso || 
                   turmaBackend.curso_id ||
                   turmaBackend.cursoId || '';

    console.log('🔍 [TURMA-CURSO] ID do curso na turma:', idCurso);
    console.log('📚 [TURMA-CURSO] Cursos disponíveis:', cursos.length);

    // ✨ FAZER LOOKUP DO NOME DO CURSO
    let nomeCurso = '';
    if (idCurso && cursos.length > 0) {
      const cursoEncontrado = cursos.find(curso => 
        String(curso.idCurso) === String(idCurso)
      );
      
      if (cursoEncontrado) {
        nomeCurso = cursoEncontrado.nome;
        console.log('✅ [TURMA-CURSO] Curso encontrado:', nomeCurso);
      } else {
        console.log('❌ [TURMA-CURSO] Curso não encontrado para ID:', idCurso);
        console.log('📋 [TURMA-CURSO] IDs disponíveis:', cursos.map(c => c.idCurso));
      }
    } else {
      console.log('⚠️ [TURMA-CURSO] ID do curso não encontrado na turma');
    }

    if (!id || !nome) {
      console.log('❌ [TURMA-CURSO] Turma inválida - falta ID ou nome');
      return null;
    }

    const turmaMapeada: TurmaListItem = {
      id: String(id),
      nome: String(nome).trim(),
      ano: String(ano),
      turno: turno as 'DIURNO' | 'NOTURNO',
      nomeCurso: nomeCurso || 'Curso não encontrado'
    };

    console.log('✅ [TURMA-CURSO] Turma mapeada com curso:', turmaMapeada);
    return turmaMapeada;

  } catch (error) {
    console.error('❌ [TURMA-CURSO] Erro ao mapear turma:', error);
    return null;
  }
};

// ===== TURMA MAPPER ORIGINAL (FALLBACK) =====
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

// ===== CURSO - TRANSFORMADORES =====
export const transformCursoFormToDTO = (
  data: CursoFormData,
  secretariaId: string
): CursoDTO => {
  console.log('🔄 [CURSO-TRANSFORMER] Transformando dados do formulário:', data);
  
  const cursoDTO: CursoDTO = {
    nome: data.nome.trim(),
    duracao: Number(data.duracao),
    id_secretaria: secretariaId,
    situacao: 'ATIVO',
  };
  
  console.log('✅ [CURSO-TRANSFORMER] DTO criado:', cursoDTO);
  return cursoDTO;
};

// ===== DISCIPLINA - TRANSFORMADORES =====
export const formDataToDisciplinaDTO = (
  data: DisciplinaFormData, 
  secretariaId: string
): DisciplinaDTO => {
  console.log('🔄 [DISCIPLINA-TRANSFORMER] Transformando dados do formulário:', data);

  const disciplinaDTO: DisciplinaDTO = {
    nome: data.nome.trim(),
    ementa: data.ementa.trim(),
    cargaHoraria: data.cargaHoraria,
    id_secretaria: secretariaId
  };

  console.log('✅ [DISCIPLINA-TRANSFORMER] DTO criado:', disciplinaDTO);
  return disciplinaDTO;
};