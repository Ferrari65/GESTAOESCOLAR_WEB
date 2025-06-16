// ===== IMPORTS DOS SCHEMAS =====
import type { 
  // Professor
  ProfessorCadastroData,
  ProfessorEdicaoData,
  ProfessorCreateDTO,   
  ProfessorUpdateDTO,
  ProfessorResponse,
  
  // Curso
  CursoFormData,
  CursoDTO,
  
  // Disciplina
  DisciplinaFormData,
  DisciplinaDTO,
  
  // Turma
  TurmaFormData,
  TurmaDTO,
} from '@/schemas';

import { cleanCPF, cleanPhone } from '@/schemas/shared';

// ===== UTILITÁRIOS BÁSICOS =====
export { cleanCPF, cleanPhone };

// ===== 1. TRANSFORMERS DE PROFESSOR =====

export const transformProfessorCadastroToDTO = (
  data: ProfessorCadastroData,
  secretariaId: string
): ProfessorCreateDTO => {
  
  const cpfLimpo = cleanCPF(data.cpf);
  const telefoneLimpo = cleanPhone(data.telefone);
  const numeroInt = parseInt(data.numero, 10);

  // Validações
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

export const transformProfessorEdicaoToDTO = (
  data: ProfessorEdicaoData
): ProfessorUpdateDTO => {
  
  const updateDTO: ProfessorUpdateDTO = {};
  
  console.log('🔄 [EDIT] Dados do formulário:', data);

  // Só incluir campos que foram preenchidos (não undefined e não string vazia)
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

  if (data.sexo !== undefined && data.sexo !== '') {
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

// ===== 2. TRANSFORMERS DE CURSO =====

export const transformCursoFormToDTO = (
  data: CursoFormData,
  secretariaId: string
): CursoDTO => {
  
  // Validações básicas
  if (!data.nome || data.nome.trim().length < 3) {
    throw new Error('Nome do curso deve ter pelo menos 3 caracteres');
  }
  
  if (!data.duracao || data.duracao < 1 || data.duracao > 60) {
    throw new Error('Duração deve ser entre 1 e 60 meses');
  }

  if (!secretariaId || secretariaId.trim() === '') {
    throw new Error('ID da secretaria é obrigatório');
  }

  return {
    nome: data.nome.trim(),
    duracao: data.duracao,
    id_secretaria: secretariaId,
    situacao: 'ATIVO',
    data_alteracao: new Date().toISOString(),
  };
};

// ===== 3. TRANSFORMERS DE DISCIPLINA =====

export const transformDisciplinaFormToDTO = (
  data: DisciplinaFormData,
  secretariaId: string
): DisciplinaDTO => {
  
  // Validações básicas
  if (!data.nome || data.nome.trim().length < 1) {
    throw new Error('Nome da disciplina é obrigatório');
  }
  
  if (!data.ementa || data.ementa.trim().length < 1) {
    throw new Error('Ementa da disciplina é obrigatória');
  }
  
  if (!data.cargaHoraria || data.cargaHoraria <= 0) {
    throw new Error('Carga horária deve ser maior que zero');
  }

  if (!secretariaId || secretariaId.trim() === '') {
    throw new Error('ID da secretaria é obrigatório');
  }

  return {
    nome: data.nome.trim(),
    ementa: data.ementa.trim(),
    cargaHoraria: data.cargaHoraria,
    id_secretaria: secretariaId,
  };
};

// Alias para compatibilidade com hooks existentes
export const formDataToDisciplinaDTO = transformDisciplinaFormToDTO;

// ===== 4. TRANSFORMERS DE TURMA =====

export const transformTurmaFormToDTO = (
  data: TurmaFormData
): TurmaDTO => {
  
  // Validações básicas
  if (!data.nome || data.nome.trim().length < 3) {
    throw new Error('Nome da turma deve ter pelo menos 3 caracteres');
  }
  
  if (!data.ano || !/^\d{4}$/.test(data.ano)) {
    throw new Error('Ano deve ter 4 dígitos');
  }
  
  if (!data.turno || !['DIURNO', 'NOTURNO'].includes(data.turno)) {
    throw new Error('Turno deve ser DIURNO ou NOTURNO');
  }

  return {
    nome: data.nome.trim(),
    ano: data.ano,
    turno: data.turno,
  };
};

// ===== 5. UTILITÁRIOS DE VALIDAÇÃO =====

export const validateFormData = <T>(
  data: T,
  requiredFields: (keyof T)[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  for (const field of requiredFields) {
    const value = data[field];
    if (value === undefined || value === null || value === '') {
      errors.push(`Campo ${String(field)} é obrigatório`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeStringField = (value: string | undefined): string => {
  if (!value || typeof value !== 'string') return '';
  return value.trim();
};

export const sanitizeNumberField = (value: string | number | undefined): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// ===== 6. MAPEADORES DE RESPOSTA (Backend -> Frontend) =====

export const mapProfessorResponse = (backendData: any): ProfessorResponse => {
  return {
    id_professor: backendData.id_professor || backendData.idProfessor || backendData.id || backendData.CPF || '',
    nome: sanitizeStringField(backendData.nome),
    email: sanitizeStringField(backendData.email),
    cpf: sanitizeStringField(backendData.CPF || backendData.cpf),
    telefone: sanitizeStringField(backendData.telefone),
    data_nasc: sanitizeStringField(backendData.data_nasc),
    sexo: backendData.sexo || 'M',
    logradouro: sanitizeStringField(backendData.logradouro),
    bairro: sanitizeStringField(backendData.bairro),
    numero: sanitizeNumberField(backendData.numero),
    cidade: sanitizeStringField(backendData.cidade),
    uf: sanitizeStringField(backendData.UF || backendData.uf),
    situacao: backendData.situacao || 'ATIVO'
  };
};

// ===== 7. VALIDADORES DE INTEGRIDADE =====

export const validateProfessorIntegrity = (professor: any): boolean => {
  if (!professor) return false;
  
  const requiredFields = ['nome', 'email'];
  for (const field of requiredFields) {
    if (!professor[field] || professor[field].trim() === '') {
      return false;
    }
  }
  
  return true;
};

export const validateCursoIntegrity = (curso: any): boolean => {
  if (!curso) return false;
  
  const requiredFields = ['nome', 'duracao'];
  for (const field of requiredFields) {
    if (!curso[field]) {
      return false;
    }
  }
  
  if (typeof curso.duracao !== 'number' || curso.duracao <= 0) {
    return false;
  }
  
  return true;
};

// ===== 8. DEBUGGERS E HELPERS =====

export const logTransformation = (
  operation: string,
  input: any,
  output: any
): void => {
  if (process.env.NODE_ENV === 'development') {
    console.group(` [TRANSFORMER] ${operation}`);
    console.log('Input:', input);
    console.log(' Output:', output);
    console.log(' Campos no output:', Object.keys(output).length);
    console.groupEnd();
  }
};

export const createTransformError = (
  operation: string,
  field: string,
  value: any,
  expectedType: string
): Error => {
  return new Error(
    `Erro na transformação [${operation}]: Campo '${field}' com valor '${value}' não é do tipo ${expectedType}`
  );
};