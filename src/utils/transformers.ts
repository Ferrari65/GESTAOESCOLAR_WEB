import type { 
  ProfessorFormData, 
  ProfessorDTO 
} from '@/types/secretariaTypes/cadastroprofessor/professor';
import type { 
  CursoFormData, 
  CursoDTO 
} from '@/schemas/secretaria/curso/cursoValidations';

// ===== UTILITÁRIOS BASE

export const cleanCPF = (cpf: string): string => {
  return cpf.replace(/[^\d]/g, '');
};

export const cleanPhone = (phone: string): string => {
  return phone.replace(/[^\d]/g, '');
};

export const formatCPF = (cpf: string): string => {
  const clean = cleanCPF(cpf);
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatPhone = (phone: string): string => {
  const clean = cleanPhone(phone);
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
};

const generateDataAlteracao = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

// ===== TRANSFORMER PARA PROFESSOR 

export const formDataToDTO = (
  data: ProfessorFormData, 
  secretariaId: string
): ProfessorDTO => {
  const cpfLimpo = cleanCPF(data.cpf);
  const telefoneLimpo = cleanPhone(data.telefone);
  const numeroInt = parseInt(data.numero, 10);
  const dataNasc = new Date(data.data_nasc).toISOString().split('T')[0];

  return {
    nome: data.nome.trim(),
    CPF: cpfLimpo,
    email: data.email.trim().toLowerCase(),
    senha: data.senha,
    logradouro: data.logradouro.trim(),
    bairro: data.bairro.trim(),
    numero: numeroInt,
    cidade: data.cidade.trim(),
    UF: data.uf.toUpperCase(),
    sexo: data.sexo.toUpperCase(),
    telefone: telefoneLimpo,
    data_nasc: dataNasc,
    situacao: 'ATIVO' as const,
    id_secretaria: secretariaId
  };
};

export const validateFormData = (data: ProfessorFormData): string[] => {
  const errors: string[] = [];

  if (!data.nome?.trim()) errors.push('Nome é obrigatório');
  if (!data.email?.trim()) errors.push('Email é obrigatório');
  if (!data.senha) errors.push('Senha é obrigatória');
  if (!data.cpf) errors.push('CPF é obrigatório');
  if (!data.telefone) errors.push('Telefone é obrigatório');
  if (!data.data_nasc) errors.push('Data de nascimento é obrigatória');
  if (!data.sexo) errors.push('Sexo é obrigatório');
  if (!data.logradouro?.trim()) errors.push('Logradouro é obrigatório');
  if (!data.bairro?.trim()) errors.push('Bairro é obrigatório');
  if (!data.numero) errors.push('Número é obrigatório');
  if (!data.cidade?.trim()) errors.push('Cidade é obrigatória');
  if (!data.uf) errors.push('UF é obrigatória');

  return errors;
};


export const formDataToCursoDTO = (
  data: CursoFormData, 
  secretariaId: string
): CursoDTO => {
  
  const duracao = parseInt(data.duracao, 10);

  const dto: CursoDTO = {
    nome: data.nome.trim(),
    duracao: duracao, 
    id_secretaria: secretariaId,
    situacao: 'ATIVO', 
    data_alteracao: generateDataAlteracao()
  };


  return dto;
};

export const validateCursoFormData = (data: unknown): string[] => {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cursoData = data as any;
  const errors: string[] = [];

  if (!cursoData?.nome?.trim()) errors.push('Nome do curso é obrigatório');
  if (!cursoData?.duracao) errors.push('Duração é obrigatória');

  return errors;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatZodErrors = (errors: any[]): Record<string, string> => {
  const formatted: Record<string, string> = {};
  
  errors.forEach(error => {
    const field = error.path.join('.');
    formatted[field] = error.message;
  });
  
  return formatted;
};


export const dtoToFormData = (dto: ProfessorDTO): Partial<ProfessorFormData> => {
  return {
    nome: dto.nome,
    cpf: formatCPF(dto.CPF),
    email: dto.email,
    telefone: formatPhone(dto.telefone),
    data_nasc: dto.data_nasc,
    sexo: dto.sexo as 'M' | 'F',
    logradouro: dto.logradouro,
    bairro: dto.bairro,
    numero: dto.numero.toString(),
    cidade: dto.cidade,
    uf: dto.UF
  };
};


export const cursoDtoToFormData = (dto: CursoDTO): Partial<CursoFormData> => {
  return {
    nome: dto.nome,
    duracao: dto.duracao.toString(),
  };
};