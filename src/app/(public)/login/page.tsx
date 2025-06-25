'use client';

import type { JSX } from 'react';
import Image from 'next/image';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/schemas'; 
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { WelcomeAnimation } from '@/components/ui/WelcomeAnimation';
import { Eye, EyeOff, User, Lock, Shield, AlertTriangle } from 'lucide-react';

export default function LoginPage(): JSX.Element {
  const authContext = useContext(AuthContext);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  if (!authContext) {
    throw new Error('LoginPage deve ser usado dentro de um AuthProvider');
  }

  const { 
    signIn, 
    isLoading, 
    error, 
    clearError, 
    user, 
    isInitialized, 
    showWelcome 
  } = authContext;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const emailValue = watch('email', '');
  const passwordValue = watch('password', '');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isInitialized || showWelcome || !user) return;
    if (window.location.pathname !== '/login') return;
    
    const dashboardRoutes = {
      'ROLE_SECRETARIA': '/secretaria/alunos',
      'ROLE_PROFESSOR': '/professor/home',
    };
    
    const redirectPath = dashboardRoutes[user.role as keyof typeof dashboardRoutes];
    if (redirectPath) {
      router.replace(redirectPath);
    }
  }, [mounted, isInitialized, user, router, showWelcome]);

  const handleSignIn: SubmitHandler<LoginFormData> = async (data: LoginFormData): Promise<void> => {
    clearError(); 
    await signIn(data);
  };

  if (showWelcome && user) {
    return (
      <WelcomeAnimation 
        userName={user.email} 
        onComplete={() => {}}
      />
    );
  }

  if (!mounted) {
    return null;
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ 
        backgroundImage: "url('/background-blur.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-black/10" />
      <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse" />
      <div className="absolute top-1/3 right-20 w-3 h-3 bg-yellow-400/20 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/4 left-1/4 w-1 h-1 bg-purple-400/40 rounded-full animate-ping" style={{ animationDelay: '2s' }} />

      <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden w-full max-w-5xl mx-4 flex min-h-[600px] border border-white/20">
        
        <section className="w-full lg:w-1/2 px-16 py-16 flex flex-col justify-center relative min-h-[600px]">
          <header className="text-center mb-10">           
            <h1 className="text-3xl font-bold text-gray-700 mb-2">Login</h1>
          </header>

          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800">Erro no login</p>
                  <p className="text-sm text-red-700 mt-1">{error.message}</p>
                </div>
                <button
                  onClick={clearError}
                  className="text-red-400 hover:text-red-600 transition-colors p-1 hover:bg-red-100 rounded"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(handleSignIn)} className="space-y-6" noValidate>
            
            {/* Campo Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Matrícula <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <User className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                  errors.email ? 'text-red-400' : emailValue ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'
                }`} />
                <input
                  id="email"
                  type="email"
                  placeholder="Digite sua matrícula"
                  autoComplete="username"
                  className={`w-full pl-12 pr-4 py-4 border-0 border-b-2 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
                    errors.email 
                      ? 'border-red-400 focus:border-red-500' 
                      : emailValue 
                      ? 'border-blue-400 focus:border-blue-500' 
                      : 'border-gray-200 focus:border-yellow-400 hover:border-gray-300'
                  }`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <div className="flex items-center space-x-2 text-sm text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{errors.email.message}</span>
                </div>
              )}
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Senha <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                  errors.password ? 'text-red-400' : passwordValue ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'
                }`} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  className={`w-full pl-12 pr-12 py-4 border-0 border-b-2 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
                    errors.password 
                      ? 'border-red-400 focus:border-red-500' 
                      : passwordValue 
                      ? 'border-blue-400 focus:border-blue-500' 
                      : 'border-gray-200 focus:border-yellow-400 hover:border-gray-300'
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center space-x-2 text-sm text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{errors.password.message}</span>
                </div>
              )}
            </div>

            {/* Esqueci Senha */}
            <div className="text-right pt-2">
              <a href="/redefinir" className="text-sm text-gray-500 hover:text-yellow-600 font-medium hover:underline">
                Esqueci minha senha
              </a>
            </div>

            {/* Botão Entrar */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold py-4 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-yellow-400/25 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-gray-700/30 border-t-gray-700 rounded-full animate-spin" />
                    <span>Entrando...</span>
                  </div>
                ) : (
                  <span>Entrar</span>
                )}
              </button>
            </div>
          </form>

          {/* Segurança */}
          <div className="mt-8 flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Shield className="w-4 h-4 text-green-500" />
            <span>Conexão segura e criptografada</span>
          </div>
        </section>

        {/* Ilustração */}
        <aside className="hidden lg:flex w-1/2 bg-gradient-to-br from-gray-50 via-blue-50/50 to-indigo-50/30 items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-yellow-200/30 to-orange-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-purple-200/20 rounded-full blur-2xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-br from-indigo-100/20 to-blue-100/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 text-center">
            <div className="mb-8 group">
              <Image 
                src="/cuate.png" 
                alt="Estudante com livros" 
                width={450} 
                height={350}
                className="object-contain max-w-full transform group-hover:scale-105 transition-transform duration-500 drop-shadow-lg"
                priority
              />
            </div>
            <div className="space-y-6 max-w-sm mx-auto">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Gestão Acadêmica Inteligente
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Transforme a administração educacional com nossa plataforma integrada
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
