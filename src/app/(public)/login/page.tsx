'use client';

import type { JSX } from 'react';
import Image from 'next/image';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/schemas'; 
import { useContext, useEffect } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { WelcomeAnimation } from '@/components/ui/WelcomeAnimation';

export default function LoginPage(): JSX.Element {
  const authContext = useContext(AuthContext);
  const router = useRouter();
  
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
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

 
  useEffect(() => {
    if (isInitialized && user && !showWelcome) {
      const dashboardRoutes = {
        'ROLE_SECRETARIA': '/secretaria/alunos',
        'ROLE_PROFESSOR': '/professor/home',

      };
      
      const redirectPath = dashboardRoutes[user.role as keyof typeof dashboardRoutes] || '/login';
      router.push(redirectPath);
    }
  }, [isInitialized, user, router, showWelcome]);

  const handleSignIn: SubmitHandler<LoginFormData> = async (data: LoginFormData): Promise<void> => {
    clearError(); 
    await signIn(data);
  };

  if (showWelcome && user) {
    return (
      <WelcomeAnimation 
        userName={user.email} 
        onComplete={() => {
          
        }}
      />
    );
  }

  if (!isInitialized) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Carregando...</p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ 
        backgroundImage: "url('/background-blur.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden w-full max-w-4xl mx-4 flex min-h-[500px]">
        {/* Seção do Formulário */}
        <section 
          className="w-full lg:w-1/2 px-16 py-16 flex flex-col justify-center relative min-h-[500px]"
          aria-labelledby="login-heading"
        >
          {/* Header com Logo */}
          <header className="absolute top-8 left-8">
            <Image 
              src="/logo_principal.png" 
              alt="UFEM - Logotipo da instituição" 
              width={100} 
              height={32}
              className="object-contain"
              priority
            />
          </header>

          {/* Conteúdo Principal */}
          <div className="flex flex-col justify-center max-w-sm mx-auto w-full mt-16">
            <h1 
              id="login-heading"
              className="text-4xl font-sans text-gray-900 mb-2 text-center"
            >
              LOGIN
            </h1>

            {/* Exibir erro de autenticação */}
            <div className="min-h-[80px] mb-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">Erro no login</p>
                      <p className="text-sm text-red-600 mt-1">{error.message}</p>
                    </div>
                    <button
                      onClick={clearError}
                      className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit(handleSignIn)} className="space-y-8" noValidate>
              {/* Campo Email */}
              <fieldset className="space-y-1">
                <div className="relative">
                  <label htmlFor="email" className="sr-only">Matrícula</label>
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="Digite sua matrícula"
                    autoComplete="username"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    {...register('email')}
                    className="w-full pl-8 pr-4 py-4 border-0 border-b border-gray-300 focus:border-gray-400 outline-none transition-colors duration-200 text-gray-700 placeholder-gray-400 bg-transparent text-base"
                  />
                </div>
                {errors.email && (
                  <div id="email-error" role="alert" className="text-sm text-red-500 ml-1">
                    {errors.email.message}
                  </div>
                )}
              </fieldset>

              {/* Campo Senha */}
              <fieldset className="space-y-1">
                <div className="relative">
                  <label htmlFor="password" className="sr-only">Senha</label>
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    autoComplete="current-password"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    {...register('password')}
                    className="w-full pl-8 pr-4 py-4 border-0 border-b border-gray-300 focus:border-gray-400 outline-none transition-colors duration-200 text-gray-700 placeholder-gray-400 bg-transparent text-base"
                  />
                </div>
                {errors.password && (
                  <div id="password-error" role="alert" className="text-sm text-red-500 ml-1">
                    {errors.password.message}
                  </div>
                )}
              </fieldset>

              {/* Link Esqueci Senha */}
              <div className="text-right pt-2">
                <a 
                  href="/redefinir" 
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 rounded"
                >
                  Esqueci minha senha
                </a>
              </div>

              {/* Botão Submit */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  aria-describedby={isLoading ? 'loading-message' : undefined}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium py-4 rounded-xl transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed text-base focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2" id="loading-message">
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                      <span>Entrando...</span>
                      <span className="sr-only">Carregando, aguarde...</span>
                    </div>
                  ) : (
                    'Entrar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Seção Ilustração */}
        <aside 
          className="hidden lg:flex w-1/2 bg-gray-50 items-center justify-center p-12"
          aria-label="Ilustração decorativa"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <Image 
              src="/cuate.png" 
              alt="Estudante com livros - ilustração decorativa" 
              width={450} 
              height={350}
              className="object-contain max-w-full max-h-full"
              priority
            />
          </div>
        </aside>
      </div>
    </main>
  );
}