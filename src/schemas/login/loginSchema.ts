import { z } from 'zod';

const COMMON_PASSWORDS = [
  '123456', 'password', '123456789', '12345678', 'qwerty', 'abc123'
];

const emailValidator = z
  .string()
  .trim()
  .min(1, 'Email é obrigatório')
  .email('Digite um email válido')
  .max(254, 'Email muito longo');

const passwordValidator = z
  .string()
  .min(1, 'Senha é obrigatória')
  .min(6, 'Senha deve ter pelo menos 6 caracteres')
  .max(50, 'Senha muito longa')
  .refine(
    (password) => !COMMON_PASSWORDS.includes(password.toLowerCase()),
    'Esta senha é muito comum, escolha outra'
  );

const strictPasswordValidator = z
  .string()
  .min(1, 'Senha é obrigatória')
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .max(50, 'Senha muito longa')
  .refine(
    (password) => /[a-z]/.test(password),
    'Adicione pelo menos uma letra minúscula'
  )
  .refine(
    (password) => /[A-Z]/.test(password),
    'Adicione pelo menos uma letra maiúscula'
  )
  .refine(
    (password) => /\d/.test(password),
    'Adicione pelo menos um número'
  )
  .refine(
    (password) => !COMMON_PASSWORDS.includes(password.toLowerCase()),
    'Esta senha é muito comum, escolha outra'
  );

export const productionSchema = z.object({
  email: emailValidator,
  password: passwordValidator,
});


export const developmentSchema = z.object({
  email: emailValidator,
  password: strictPasswordValidator,
});

export function getLoginSchema(isDevelopment = false) {
  return isDevelopment ? developmentSchema : productionSchema;
}

export const loginSchema = productionSchema;

export type LoginFormData = z.infer<typeof productionSchema>;
export type LoginData = LoginFormData;


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

// // Configurações de segurança
// export const securitySettings = {
//   maxLoginAttempts: 5,
//   lockoutTime: 15 * 60 * 1000, // 15 minutos em ms
//   sessionDuration: 24 * 60 * 60 * 1000, // 24 horas em ms
// } as const;