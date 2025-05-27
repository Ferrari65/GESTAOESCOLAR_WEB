import { z } from 'zod';

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Formato de email inválido')
    .toLowerCase()
    .trim(),
  
  newPassword: z
    .string()
    .min(1, 'Nova senha é obrigatória')
    .min(6, 'A senha deve ter pelo menos 6 caracteres')
    .max(100, 'A senha deve ter no máximo 100 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'A senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número'
    ),
  
  confirmPassword: z
    .string()
    .min(1, 'Confirmação de senha é obrigatória')
})
.refine((data) => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'], 
});

export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export const resetPasswordSchemaSimple = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  
  newPassword: z
    .string()
    .min(1, 'Nova senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
  
  confirmPassword: z
    .string()
    .min(1, 'Confirmação de senha é obrigatória')
})
.refine((data) => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export type ResetPasswordDataSimple = z.infer<typeof resetPasswordSchemaSimple>;