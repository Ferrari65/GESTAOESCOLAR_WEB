// src/components/secretaria/home/professor/DataSection.tsx - VERSÃO CORRIGIDA

'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormInput } from '@/components/ui/FormInput';
import type { ProfessorCadastroData, ProfessorEdicaoData } from '@/schemas/professor';

interface PersonalDataSectionProps {
  form: UseFormReturn<ProfessorCadastroData | ProfessorEdicaoData>;
  modoEdicao?: boolean;
}

export const PersonalDataSection: React.FC<PersonalDataSectionProps> = ({ 
  form, 
  modoEdicao = false 
}) => {
  const { register, formState: { errors }, watch } = form;
  
  // ✅ ASSISTIR MUDANÇAS PARA FEEDBACK VISUAL
  const emailValue = watch('email');
  const senhaValue = watch('senha');
  const nomeValue = watch('nome');
  const cpfValue = watch('cpf');

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Dados Pessoais
          {modoEdicao && (
            <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded-full">
              Modo Edição
            </span>
          )}
        </h2>
        
        {/* ✅ GRID RESPONSIVO PARA OS CAMPOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-600">
          
          {/* ✅ NOME COMPLETO */}
          <div className="md:col-span-2">
            <FormInput
              label="Nome completo"
              placeholder="Digite o nome completo do professor"
              {...register('nome')}
              error={errors.nome?.message}
              maxLength={100}
              autoComplete="name"
              helperText="Mínimo 2 caracteres, máximo 100"
            />
            {/* ✅ FEEDBACK VISUAL PARA NOME */}
            {nomeValue && nomeValue.length >= 2 && !errors.nome && (
              <div className="mt-1 flex items-center text-green-600">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs">Nome válido</span>
              </div>
            )}
          </div>

          {/* ✅ CPF */}
          <div>
            <FormInput
              label="CPF"
              placeholder="000.000.000-00"
              {...register('cpf')}
              error={errors.cpf?.message}
              maxLength={14}
              autoComplete="off"
              helperText={modoEdicao ? "CPF pode ser alterado se necessário" : "Apenas números, pontos e traços"}
            />
            {/* ✅ FEEDBACK VISUAL PARA CPF */}
            {cpfValue && cpfValue.replace(/[^\d]/g, '').length === 11 && !errors.cpf && (
              <div className="mt-1 flex items-center text-green-600">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs">CPF válido</span>
              </div>
            )}
          </div>

          {/* ✅ TELEFONE */}
          <div>
            <FormInput
              label="Telefone"
              type="tel"
              placeholder="(11) 99999-9999"
              {...register('telefone')}
              error={errors.telefone?.message}
              maxLength={15}
              autoComplete="tel"
              helperText="Celular ou fixo com DDD"
            />
          </div>

          {/* ✅ EMAIL */}
          <div>
            <FormInput
              label="E-mail"
              type="email"
              placeholder="professor@email.com"
              {...register('email')}
              error={errors.email?.message}
              maxLength={254}
              autoComplete="email"
              helperText={modoEdicao ? "Email pode ser alterado" : "Email será usado para login"}
            />
            {/* ✅ INDICADOR VISUAL DE EMAIL VÁLIDO */}
            {emailValue && emailValue.includes('@') && emailValue.includes('.') && !errors.email && (
              <div className="mt-1 flex items-center text-green-600">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs">Email válido</span>
              </div>
            )}
          </div>

          {/* ✅ SENHA COM LÓGICA ESPECIAL PARA EDIÇÃO */}
          <div>
            <FormInput
              label={modoEdicao ? "Nova senha (opcional)" : "Senha"}
              type="password"
              placeholder={modoEdicao ? "Deixe vazio para manter a atual" : "Mínimo 6 caracteres"}
              {...register('senha')}
              error={errors.senha?.message}
              maxLength={50}
              autoComplete={modoEdicao ? "new-password" : "new-password"}
              helperText={
                modoEdicao 
                  ? "Deixe vazio para manter a senha atual" 
                  : "Mínimo 6 caracteres"
              }
            />
            {/* ✅ INDICADOR DE FORÇA DA SENHA MELHORADO */}
            {senhaValue && senhaValue.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center space-x-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-1">
                    <div 
                      className={`h-1 rounded-full transition-all duration-300 ${
                        senhaValue.length < 6 
                          ? 'w-1/3 bg-red-500' 
                          : senhaValue.length < 8 
                          ? 'w-2/3 bg-yellow-500' 
                          : 'w-full bg-green-500'
                      }`}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    senhaValue.length < 6 
                      ? 'text-red-600' 
                      : senhaValue.length < 8 
                      ? 'text-yellow-600' 
                      : 'text-green-600'
                  }`}>
                    {senhaValue.length < 6 ? 'Fraca' : senhaValue.length < 8 ? 'Média' : 'Forte'}
                  </span>
                </div>
                {modoEdicao && (
                  <p className="text-xs text-gray-500 mt-1">
                    {senhaValue.length === 0 ? 'Senha atual será mantida' : 'Nova senha será definida'}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ✅ DATA DE NASCIMENTO */}
          <div>
            <FormInput
              label="Data de Nascimento"
              type="date"
              {...register('data_nasc')}
              error={errors.data_nasc?.message}
              autoComplete="bday"
              helperText="Idade entre 16 e 120 anos"
              max={new Date(new Date().getFullYear() - 16, new Date().getMonth(), new Date().getDate()).toISOString().split('T')[0]}
              min={new Date(new Date().getFullYear() - 120, new Date().getMonth(), new Date().getDate()).toISOString().split('T')[0]}
            />
          </div>

          {/* ✅ SEXO */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Sexo
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              {...register('sexo')}
              className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 transition-colors bg-white ${
                errors.sexo 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              aria-invalid={!!errors.sexo}
              aria-describedby={errors.sexo ? 'sexo-error' : undefined}
            >
              <option value="">Selecione o sexo</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
            {errors.sexo && (
              <span id="sexo-error" className="text-sm text-red-600 flex items-center mt-1" role="alert">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.sexo.message}
              </span>
            )}
          </div>

        </div>

        {/* ✅ INFORMAÇÕES ADICIONAIS PARA MODO EDIÇÃO */}
        {modoEdicao && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Dicas para edição
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Senha:</strong> Deixe vazio para manter a senha atual</li>
                    <li><strong>CPF e Email:</strong> Podem ser alterados, mas devem ser únicos</li>
                    <li><strong>Validação:</strong> Todos os campos são validados em tempo real</li>
                    <li><strong>Campos obrigatórios:</strong> Marcados com asterisco (*)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ PREVIEW DOS DADOS EM TEMPO REAL */}
        {(nomeValue || emailValue) && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview dos dados
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Nome:</span> 
                <span className="font-medium ml-2">
                  {nomeValue || 'Não informado'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Email:</span> 
                <span className="font-medium ml-2">
                  {emailValue || 'Não informado'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};