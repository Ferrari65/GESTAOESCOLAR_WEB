"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { User, Lock } from "lucide-react";
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/schemas';

export default function ResetPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const handleResetPassword: SubmitHandler<ResetPasswordFormData> = async (data: ResetPasswordFormData): Promise<void> => {
    try {

      console.log('Dados do formulário:', data);
      
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ 
        backgroundImage: "url('/background-blur.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <section
        aria-labelledby="reset-password-heading"
        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 px-12 py-16"
      >
        {/* Logo UFEM */}
        <div className="mb-12">
          <Image 
            src="/logo_principal.png" 
            alt="UFEM Logo" 
            width={100} 
            height={32}
            className="object-contain"
            priority
          />
        </div>

        {/* Título */}
        <h1
          id="reset-password-heading"
          className="text-center text-3xl font-bold text-gray-700 mb-16"
        >
          Redefinir Senha
        </h1>

        {/* Formulário */}
        <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-8">
          {/* Email */}
          <div className="space-y-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400 ml-1" />
              </div>
              <label htmlFor="email" className="sr-only">
                Digite seu email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Digite seu email"
                {...register('email')}
                aria-invalid={!!errors.email}
                className="w-full pl-8 pr-4 py-4 border-0 border-b border-gray-300 focus:border-gray-400 outline-none transition-colors duration-200 text-gray-700 placeholder-gray-400 bg-transparent text-base"
              />
            </div>
            {errors.email && (
              <div className="text-sm text-red-500 ml-1" role="alert">
                {errors.email.message}
              </div>
            )}
          </div>

          {/* Nova Senha */}
          <div className="space-y-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 ml-1" />
              </div>
              <label htmlFor="password" className="sr-only">
                Digite nova senha
              </label>
              <input
                id="password"
                type="password"
                placeholder="Digite nova senha"
                {...register('password')}
                aria-invalid={!!errors.password}
                className="w-full pl-8 pr-4 py-4 border-0 border-b border-gray-300 focus:border-gray-400 outline-none transition-colors duration-200 text-gray-700 placeholder-gray-400 bg-transparent text-base"
              />
            </div>
            {errors.password && (
              <div className="text-sm text-red-500 ml-1" role="alert">
                {errors.password.message}
              </div>
            )}
          </div>

          {/* Confirmar Senha */}
          <div className="space-y-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 ml-1" />
              </div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirmar senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirmar senha"
                {...register('confirmPassword')}
                aria-invalid={!!errors.confirmPassword}
                className="w-full pl-8 pr-4 py-4 border-0 border-b border-gray-300 focus:border-gray-400 outline-none transition-colors duration-200 text-gray-700 placeholder-gray-400 bg-transparent text-base"
              />
            </div>
            {errors.confirmPassword && (
              <div className="text-sm text-red-500 ml-1" role="alert">
                {errors.confirmPassword.message}
              </div>
            )}
          </div>

          {/* Botão Enviar */}
          <div className="pt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-70 disabled:cursor-not-allowed text-gray-900 font-medium py-4 rounded-xl transition-colors duration-200 text-base focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>

        {/* Link Cancelar */}
        <div className="text-center mt-6">
          <Link
            href="/login"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 rounded"
          >
            Voltar ao login
          </Link>
        </div>
      </section>
    </main>
  );
}