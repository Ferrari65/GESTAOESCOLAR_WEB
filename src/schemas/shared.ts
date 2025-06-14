import { z } from 'zod';

// ===== VALIDADORES REUTILIZÁVEIS =====

export const validateCPF = (cpf: string): boolean => {
  if (!cpf) return false;
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cleanCPF.charAt(10));
};

export const validatePhone = (phone: string): boolean => {
  if (!phone) return false;
  const cleanPhone = phone.replace(/[^\d]/g, '');
  if (cleanPhone.length !== 10 && cleanPhone.length !== 11) return false;
  const areaCode = parseInt(cleanPhone.substring(0, 2));
  if (areaCode < 11 || areaCode > 99) return false;
  if (cleanPhone.length === 11 && cleanPhone.charAt(2) !== '9') return false;
  return true;
};

// ===== SENHAS COMUNS (para validação) =====
const COMMON_PASSWORDS = [
  '123456', 'password', '123456789', '12345678', '12345',
  '1234567', '1234567890', 'qwerty', 'abc123', '111111',
  'password1', 'admin', 'letmein', 'welcome', 'monkey'
];

// ===== ENUMS COMPARTILHADOS =====
export const SituacaoEnum = z.enum(['ATIVO', 'INATIVO'], {
  errorMap: () => ({ message: 'Situação deve ser ATIVO ou INATIVO' }),
});

export const TurnoEnum = z.enum(['DIURNO', 'NOTURNO'], {
  errorMap: () => ({ message: 'Turno deve ser DIURNO ou NOTURNO' }),
});

export const SexoEnum = z.enum(['M', 'F'], {
  errorMap: () => ({ message: 'Sexo deve ser M ou F' }),
});

// ===== VALIDADORES ZOD REUTILIZÁVEIS =====

export const nomeValidator = z
  .string()
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(100, 'Nome muito longo')
  .trim();

export const cpfValidator = z
  .string()
  .min(1, 'CPF é obrigatório')
  .refine(validateCPF, 'CPF inválido');

export const phoneValidator = z
  .string()
  .min(1, 'Telefone é obrigatório')
  .refine(validatePhone, 'Telefone inválido');

export const emailValidator = z
  .string()
  .trim()
  .min(1, 'Email é obrigatório')
  .email('Digite um email válido')
  .max(254, 'Email muito longo')
  .toLowerCase();

export const passwordValidator = z
  .string()
  .min(6, 'Senha deve ter pelo menos 6 caracteres')
  .max(50, 'Senha muito longa')
  .refine(
    (password) => !COMMON_PASSWORDS.includes(password.toLowerCase()),
    'Esta senha é muito comum, escolha outra'
  );

export const ufValidator = z
  .string()
  .length(2, 'UF deve ter 2 caracteres')
  .toUpperCase();

export const numeroValidator = z
  .string()
  .min(1, 'Número é obrigatório')
  .transform((val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num <= 0) {
      throw new Error('Número deve ser válido');
    }
    return num;
  });

export const dataValidator = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)');

export const duracaoValidator = z
  .union([
    z.string().min(1, 'Duração é obrigatória'),
    z.number().min(1).max(60),
  ])
  .transform((val) => {
    const num = typeof val === 'string' ? parseInt(val, 10) : val;
    if (isNaN(num) || num < 1 || num > 60) {
      throw new Error('Duração deve ser um número entre 1 e 60 meses');
    }
    return num;
  });

export const cargaHorariaValidator = z
  .string()
  .min(1, 'Carga horária é obrigatória')
  .transform((val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num <= 0) {
      throw new Error('Carga horária deve ser um número positivo');
    }
    return num;
  });

// ===== TIPOS BÁSICOS =====
export type SituacaoType = z.infer<typeof SituacaoEnum>;
export type TurnoType = z.infer<typeof TurnoEnum>;
export type SexoType = z.infer<typeof SexoEnum>;

// ===== UTILITÁRIOS =====
export const cleanCPF = (cpf: string): string => cpf.replace(/[^\d]/g, '');
export const cleanPhone = (phone: string): string => phone.replace(/[^\d]/g, '');

export const formatCPF = (cpf: string): string => {
  const clean = cleanCPF(cpf);
  if (clean.length !== 11) return cpf;
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatPhone = (phone: string): string => {
  const clean = cleanPhone(phone);
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
};

// ===== FUNÇÕES DE VALIDAÇÃO =====
export function checkPasswordStrength(password: string) {
  const checks = {
    length: password.length >= 8,
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    notCommon: !COMMON_PASSWORDS.includes(password.toLowerCase()),
  };

  const score = Object.values(checks).filter(Boolean).length;
  
  let level: 'fraca' | 'média' | 'forte';
  if (score <= 2) level = 'fraca';
  else if (score <= 4) level = 'média';
  else level = 'forte';

  return { score, level, isStrong: score >= 4 };
}