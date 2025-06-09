import { 
    DisciplinaDTO,
    DisciplinaFormData, 
    validateDisciplinaDTO, 
    validateDisciplinaForm 
} from '@/schemas/secretaria/disciplina/disciplinaValidations';


export const formDataToDisciplinaDTO = (
  data: DisciplinaFormData, 
  secretariaId: string
): DisciplinaDTO => {

  const formValidation = validateDisciplinaDTO(data);
  if (!formValidation.success) {
    throw new Error('Dados inválidos: ' + formValidation.error.issues[0].message);
  }

  const validData = formValidation.data;

  const dto: DisciplinaDTO = {
    nome: validData.nome.trim(),
    ementa: validData.ementa.trim(),
    cargaHoraria: validData.cargaHoraria,
    id_secretaria: secretariaId
  };


  const dtoValidation = validateDisciplinaDTO(dto);
  if (!dtoValidation.success) {
    throw new Error('DTO inválido: ' + dtoValidation.error.issues[0].message);
  }

  return dtoValidation.data;
};

export const validateDisciplinaFormData = (data: unknown): string[] => {
  const validation = validateDisciplinaForm(data);

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