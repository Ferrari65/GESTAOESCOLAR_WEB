// utils/cursoTransformers.ts

import { 
  CursoFormData, 
  CursoDTO, 
  validateCursoForm, 
  validateCursoDTO 
} from '@/schemas/secretaria/curso/cursoValidations';

const generateDataAlteracao = (): string => {
  const now = new Date();

  return now.toISOString().split('T')[0];
};

export const formDataToCursoDTO = (
  data: CursoFormData, 
  secretariaId: string
): CursoDTO => {

  const formValidation = validateCursoForm(data);
  if (!formValidation.success) {
    throw new Error('Dados inválidos: ' + formValidation.error.issues[0].message);
  }

  const validData = formValidation.data;
  const duracao = parseInt(validData.duracao, 10);

  const dto: CursoDTO = {
    nome: validData.nome.trim(),
    duracao: duracao, 
    id_secretaria: secretariaId,
    turno: validData.turno, 
    situacao: 'ATIVO', 
    data_alteracao: generateDataAlteracao()
  };

  console.log(' Data de alteração gerada automaticamente:', dto.data_alteracao);
  console.log(' DTO criado conforme estrutura do banco:', dto);

  // Validar DTO antes de retornar
  const dtoValidation = validateCursoDTO(dto);
  if (!dtoValidation.success) {
    throw new Error('DTO inválido: ' + dtoValidation.error.issues[0].message);
  }

  return dtoValidation.data;
};

export const validateCursoFormData = (data: unknown): string[] => {
  const validation = validateCursoForm(data);
  
  if (validation.success) {
    return [];
  }

  return validation.error.issues.map(issue => {
    const field = issue.path.join('.');
    return `${field}: ${issue.message}`;
  });
};

export const formatZodErrors = (errors: any[]): Record<string, string> => {
  const formatted: Record<string, string> = {};
  
  errors.forEach(error => {
    const field = error.path.join('.');
    formatted[field] = error.message;
  });
  
  return formatted;
};