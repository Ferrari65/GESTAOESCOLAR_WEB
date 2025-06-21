// src/components/secretaria/home/aluno/FormularioAluno.tsx
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { SuccessMessage } from '@/components/ui/SuccessMessage';
import { FormInput } from '@/components/ui/FormInput';
import type { AlunoCadastroData, TurmaListItem } from '@/schemas/professor';

interface FormularioAlunoProps {
  form: UseFormReturn<AlunoCadastroData>;
  onEnviar: () => Promise<void>;
  onCancelar?: () => void;
  carregando: boolean;
  erro: string | null;
  mensagemSucesso: string | null;
  limparMensagens: () => void;
  turmas: TurmaListItem[];
  turmasLoading: boolean;
  turmasError: string | null;
  onRefreshTurmas: () => void;
}

export const FormularioAluno: React.FC<FormularioAlunoProps> = ({
  form,
  onEnviar,
  onCancelar,
  carregando,
  erro,
  mensagemSucesso,
  limparMensagens,
  turmas,
  turmasLoading,
  turmasError,
  onRefreshTurmas
}) => {
  const { register, formState: { errors } } = form;

  const handleEnvio = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onEnviar();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Cadastrar Novo Aluno
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Preencha as informações do aluno para cadastrá-lo no sistema
            </p>
          </div>
        </div>
      </header>

      <div className="p-6 text-gray-800">
        {/* Mensagens */}
        <div className="space-y-4 mb-6">
          {mensagemSucesso && (
            <SuccessMessage message={mensagemSucesso} onClose={limparMensagens} />
          )}
          {erro && (
            <ErrorMessage message={erro} onRetry={limparMensagens} />
          )}
        </div>

        {/* Formulário */}
        <form onSubmit={handleEnvio} className="space-y-6">
          
          {/* Dados Pessoais */}
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Dados Pessoais
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Nome */}
              <div className="md:col-span-2">
                <FormInput
                  label="Nome completo"
                  placeholder="Digite o nome completo"
                  className="text-gray-800"
                  {...register('nome')}
                  error={errors.nome?.message}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <FormInput
                  label="E-mail"
                  type="email"
                  className="text-gray-700"
                  placeholder="aluno@email.com"
                  {...register('email')}
                  error={errors.email?.message}
                  required
                />
              </div>

              {/* CPF */}
              <div>
                <FormInput
                  label="CPF"
                  placeholder="000.000.000-00"
                  {...register('cpf')}
                  error={errors.cpf?.message}
                  required
                  className="text-gray-700"
                />
              </div>

              {/* Matrícula */}
              <div>
                <FormInput
                  label="Matrícula"
                  placeholder="Ex: 2025001"
                  {...register('matricula')}
                  error={errors.matricula?.message}
                  required
                  className="text-gray-700"
                />
              </div>

              {/* Telefone */}
              <div>
                <FormInput
                  label="Telefone"
                  type="tel"
                  className="text-gray-700"
                  placeholder="(11) 99999-9999"
                  {...register('telefone')}
                  error={errors.telefone?.message}
                  required
                  helperText="Celular ou fixo com DDD"
                />
              </div>

              {/* Data de Nascimento */}
              <div>
                <FormInput
                  label="Data de Nascimento"
                  type="date"
                  className="text-gray-700"
                  {...register('data_nasc')}
                  error={errors.data_nasc?.message}
                  required
                />
              </div>

              {/* Sexo */}
              <div className='text-gray-700'>
                <label className="block text-sm font-medium">
                  Sexo <span className="text-red-500 ml-1">*</span>
                </label>

                <select
                  {...register('sexo')}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 text-gray-700 ${
                    errors.sexo
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-green-500'
                  }`}
                >
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
                {errors.sexo && (
                  <span className="text-sm text-red-600 mt-1">{errors.sexo.message}</span>
                )}
              </div>

              {/* Senha */}
              <div>
                <FormInput
                  label="Senha"
                  type="password"
                  className="text-gray-700"
                  placeholder="Mínimo 6 caracteres"
                  {...register('senha')}
                  error={errors.senha?.message}
                  required
                  helperText="Mínimo 6 caracteres"
                />
              </div>
            </div>
          </div>

          {/* Turma */}
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12.75c1.63 0 3.07.39 4.24.9c1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73c1.17-.52 2.61-.91 4.24-.91z" />
              </svg>
              Dados Acadêmicos
            </h2>

            <div className="grid grid-cols-1 gap-6">
              {/* Turma */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Turma <span className="text-red-500">*</span>
                </label>
                
                {turmasError && (
                  <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded text-sm">
                    <p className="text-red-700">{turmasError}</p>
                    <button
                      type="button"
                      onClick={onRefreshTurmas}
                      className="mt-1 text-red-600 hover:text-red-500 underline"
                    >
                      Tentar novamente
                    </button>
                  </div>
                )}
                
                <select
                  {...register('id_turma')}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 transition-colors ${
                    errors.id_turma 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                  }`}
                  disabled={turmasLoading}
                >
                  <option value="">
                    {turmasLoading 
                      ? 'Carregando turmas...' 
                      : turmas.length === 0
                      ? 'Nenhuma turma disponível'
                      : 'Selecione uma turma'}
                  </option>
                  
                  {turmas.map((turma) => (
                    <option key={turma.id} value={turma.id}>
                      {turma.nome} - {turma.nomeCurso} ({turma.turno}) - {turma.ano}
                    </option>
                  ))}
                </select>
                
                {errors.id_turma && (
                  <span className="text-sm text-red-600 mt-1">{errors.id_turma.message}</span>
                )}

                {!turmasLoading && turmas.length === 0 && !turmasError && (
                  <p className="text-sm text-yellow-600 mt-1">
                    Nenhuma turma encontrada. Verifique se existem turmas cadastradas.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Endereço
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logradouro */}
              <div>
                <FormInput
                  label="Logradouro"
                  className="text-gray-700"
                  placeholder="Rua, Avenida, etc."
                  {...register('logradouro')}
                  error={errors.logradouro?.message}
                  required
                />
              </div>

              {/* Número */}
              <div>
                <FormInput
                  label="Número"
                  className="text-gray-700"
                  placeholder="123"
                  {...register('numero')}
                  error={errors.numero?.message}
                  required
                />
              </div>

              {/* Bairro */}
              <div>
                <FormInput
                  label="Bairro"
                  className="text-gray-700"
                  placeholder="Centro, Jardim, etc."
                  {...register('bairro')}
                  error={errors.bairro?.message}
                  required
                />
              </div>

              {/* Cidade */}
              <div>
                <FormInput
                  label="Cidade"
                  className="text-gray-700"
                  placeholder="São Paulo, etc."
                  {...register('cidade')}
                  error={errors.cidade?.message}
                  required
                />
              </div>

              {/* UF */}
              <div>
                <FormInput
                  label="UF"
                  className="text-gray-700"
                  placeholder="SP"
                  {...register('uf')}
                  error={errors.uf?.message}
                  required
                  maxLength={2}
                  helperText="2 caracteres"
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            {onCancelar && (
              <button
                type="button"
                onClick={onCancelar}
                disabled={carregando}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
            )}
            
            <button
              type="submit"
              disabled={carregando || turmasLoading}
              className="px-6 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center min-w-[140px] justify-center"
            >
              {carregando ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Salvando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Cadastrar Aluno
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};