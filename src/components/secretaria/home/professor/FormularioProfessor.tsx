// FormularioProfessor.tsx - VERSÃO FINAL

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { SuccessMessage } from '@/components/ui/SuccessMessage';
import { FormInput } from '@/components/ui/FormInput';
import type { ProfessorEdicaoData, ProfessorResponse } from '@/schemas/professor';
import { getFieldsToUpdate } from '@/utils/transformers'

interface FormularioProfessorProps {
  form: UseFormReturn<ProfessorEdicaoData>;
  modo: 'cadastro' | 'edicao';
  professor?: ProfessorResponse;
  onEnviar: () => Promise<void>;
  onCancelar?: () => void;
  carregando: boolean;
  erro: string | null;
  mensagemSucesso: string | null;
  limparMensagens: () => void;
}

export const FormularioProfessor: React.FC<FormularioProfessorProps> = ({
  form,
  modo,
  professor,
  onEnviar,
  onCancelar,
  carregando,
  erro,
  mensagemSucesso,
  limparMensagens
}) => {
  const { register, formState: { errors }, handleSubmit, watch } = form;


  const watchedFields = watch();
  const fieldsToUpdate = modo === 'edicao' ? getFieldsToUpdate(watchedFields) : [];

  const handleEnvio = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onEnviar();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className={`w-12 h-12 ${modo === 'edicao' ? 'bg-gradient-to-br from-orange-500 to-red-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'} rounded-lg flex items-center justify-center mr-4`}>
            {modo === 'edicao' ? (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {modo === 'edicao' ? 'Editar Professor' : 'Cadastrar Novo Professor'}
            </h1>
            
            <p className="text-sm text-gray-600 mt-1">
              {modo === 'edicao' 
                ? `Editando: ${professor?.nome || 'Professor'}`
                : ''
              }
            </p>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Mensagens */}
        <div className="space-y-4 mb-6">
          {mensagemSucesso && (
            <SuccessMessage message={mensagemSucesso} onClose={limparMensagens} />
          )}
          {erro && (
            <ErrorMessage message={erro} onRetry={limparMensagens} />
          )}
        </div>

        {/* Preview de Mudanças */}
        {modo === 'edicao' && fieldsToUpdate.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-green-800 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
               Campos que serão atualizados ({fieldsToUpdate.length}):
            </h3>
            <div className="flex flex-wrap gap-2">
              {fieldsToUpdate.map((field, index) => (
                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {field}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleEnvio} className="space-y-6">
          
          {/* Dados Pessoais */}
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Dados Pessoais
              {modo === 'edicao' && <span className="text-sm font-normal text-gray-500 ml-2">(vazio = manter atual)</span>}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Nome */}
<div className="md:col-span-2">
  <FormInput
    label="Nome completo"
    placeholder={modo === 'edicao' ? "Deixe vazio para manter atual" : "Digite o nome completo"}
    className="text-gray-700"
    {...register('nome')}
    error={errors.nome?.message}
    required={modo === 'cadastro'}
    helperText={modo === 'edicao' ? `Atual: ${professor?.nome}` : undefined}
  />
</div>

{/* Email */}
<div>
  <FormInput
    label="E-mail"
    type="email"
    className="text-gray-700"
    placeholder={modo === 'edicao' ? "Deixe vazio para manter atual" : "professor@email.com"}
    {...register('email')}
    error={errors.email?.message}
    required={modo === 'cadastro'}
    helperText={modo === 'edicao' ? ` Atual: ${professor?.email}` : undefined}
  />
</div>

{/* CPF */}
<div>
  <FormInput
    label="CPF"
    placeholder={modo === 'edicao' ? professor?.cpf : "000.000.000-00"}
    {...register('cpf')}
    error={errors.cpf?.message}
    disabled={modo === 'edicao'}
    required={modo === 'cadastro'}
    // Combine a classe fixa text-gray-700 com a condicional para edição
    className={`text-gray-700 ${modo === 'edicao' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
    helperText={modo === 'edicao' ? "CPF não pode ser alterado" : undefined}
  />
</div>

{/* Telefone */}
<div>
  <FormInput
    label="Telefone"
    type="tel"
    className="text-gray-700"
    placeholder={modo === 'edicao' ? "Deixe vazio para manter atual" : "(11) 99999-9999"}
    {...register('telefone')}
    error={errors.telefone?.message}
    required={modo === 'cadastro'}
    helperText={modo === 'edicao' ? `Atual: ${professor?.telefone}` : "Celular ou fixo com DDD"}
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
    required={modo === 'cadastro'}
    helperText={modo === 'edicao' ? `Atual: ${professor?.data_nasc}` : undefined}
  />
</div>

{/* Sexo */}
<div>
  <label className="block text-sm font-medium  text-gray-700 ">
    Sexo {modo === 'cadastro' && <span className="text-red-500 ml-1">*</span>}
  </label>

  <select
    {...register('sexo')}
    className={`mt-1 block w-full rounded-md border px-3 py-2 ${
      errors.sexo
        ? 'border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:ring-blue-500'
    }`}
  >
    {modo === 'edicao' ? (
      <option value="">
        Manter atual ({professor?.sexo === 'M' ? 'Masculino' : 'Feminino'})
      </option>
    ) : (
      <option value="">Selecione o sexo</option>
    )}
    <option value="M">Masculino</option>
    <option value="F">Feminino</option>
  </select>
  {errors.sexo && (
    <span className="text-sm text-red-600 mt-1">{errors.sexo.message}</span>
  )}
  {modo === 'edicao' && (
    <span className="text-xs text-gray-500 mt-1 block">
      Atual: {professor?.sexo === 'M' ? 'Masculino' : 'Feminino'}
    </span>
  )}
</div>

{/* Senha */}
<div>
  <FormInput
    label="Senha"
    type="password"
    className="text-gray-700"
    placeholder={modo === 'edicao' ? "Deixe vazio para manter atual" : "Mínimo 6 caracteres"}
    {...register('senha')}
    error={errors.senha?.message}
    required={modo === 'cadastro'}
    helperText={modo === 'edicao' ? "Deixe vazio para não alterar a senha" : "Mínimo 6 caracteres"}
  />
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
    {modo === 'edicao' && (
      <span className="text-sm font-normal text-gray-500 ml-2">(vazio = manter atual)</span>
    )}
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Logradouro */}
    <div>
      <FormInput
        label="Logradouro"
        className="text-gray-700"
        placeholder={modo === 'edicao' ? "Deixe vazio para manter atual" : "Rua, Avenida, etc."}
        {...register('logradouro')}
        error={errors.logradouro?.message}
        required={modo === 'cadastro'}
        helperText={modo === 'edicao' ? `Atual: ${professor?.logradouro}` : undefined}
      />
    </div>

    {/* Número */}
    <div>
      <FormInput
        label="Número"
        className="text-gray-700"
        placeholder={modo === 'edicao' ? "Deixe vazio para manter atual" : "123"}
        {...register('numero')}
        error={errors.numero?.message}
        required={modo === 'cadastro'}
        helperText={modo === 'edicao' ? `Atual: ${professor?.numero}` : undefined}
      />
    </div>

    {/* Bairro */}
    <div>
      <FormInput
        label="Bairro"
        className="text-gray-700"
        placeholder={modo === 'edicao' ? "Deixe vazio para manter atual" : "Centro, Jardim, etc."}
        {...register('bairro')}
        error={errors.bairro?.message}
        required={modo === 'cadastro'}
        helperText={modo === 'edicao' ? `Atual: ${professor?.bairro}` : undefined}
      />
    </div>

    {/* Cidade */}
    <div>
      <FormInput
        label="Cidade"
        className="text-gray-700"
        placeholder={modo === 'edicao' ? "Deixe vazio para manter atual" : "São Paulo, etc."}
        {...register('cidade')}
        error={errors.cidade?.message}
        required={modo === 'cadastro'}
        helperText={modo === 'edicao' ? `Atual: ${professor?.cidade}` : undefined}
      />
    </div>

    {/* UF */}
    <div>
      <FormInput
        label="UF"
        className="text-gray-700"
        placeholder={modo === 'edicao' ? "Deixe vazio para manter atual" : "SP"}
        {...register('uf')}
        error={errors.uf?.message}
        required={modo === 'cadastro'}
        maxLength={2}
        helperText={modo === 'edicao' ? ` Atual: ${professor?.uf}` : "2 caracteres"}
      />
    </div>
  </div>
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
              disabled={carregando}
              className={`px-6 py-2 text-white rounded-md hover:opacity-90 disabled:opacity-50 transition-colors flex items-center min-w-[140px] justify-center ${
                modo === 'edicao' 
                  ? 'bg-orange-600 hover:bg-orange-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {carregando ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {modo === 'edicao' ? 'Atualizando...' : 'Salvando...'}
                </>
              ) : (
                <>
                  {modo === 'edicao' ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Atualizar Professor
                      {fieldsToUpdate.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-orange-200 text-orange-800 rounded-full text-xs">
                          {fieldsToUpdate.length} campo(s)
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Cadastrar Professor
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};