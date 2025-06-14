import { z } from 'zod';
import { emailValidator, passwordValidator } from './shared';

// ===== SCHEMAS DE AUTENTICAÇÃO =====

export const loginSchema = z.object({
  email: emailValidator,
  password: passwordValidator,
});

export const developmentLoginSchema = z.object({
  email: emailValidator,
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const resetPasswordSchema = z
  .object({
    email: emailValidator,
    password: passwordValidator,
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

// ===== TIPOS DE AUTENTICAÇÃO =====
export type LoginFormData = z.infer<typeof loginSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ===== VALIDADORES =====
export const validateLogin = (data: unknown) => {
  return loginSchema.safeParse(data);
};

export const validateResetPassword = (data: unknown) => {
  return resetPasswordSchema.safeParse(data);
};