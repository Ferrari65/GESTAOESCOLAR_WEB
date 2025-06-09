'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import type { CursoFormData } from '@/schemas';

interface CursoDataSectionProps {
  form: UseFormReturn<CursoFormData>;
}

export const CursoDataSection: React.FC<CursoDataSectionProps> = ({ form }) => {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-700 mb-4">Dados do Curso</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Nome do Curso */}
        <div className="space-y-1">
          <label 
            htmlFor="nome-curso"
            className="block text-sm font-medium text-gray-700"
          >
            Nome do Curso
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            id="nome-curso"
            type="text"
            {...register('nome')}
            className={`mt-1 block w-full rounded-md text-gray-600 border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 transition-colors ${
              errors.nome 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
            placeholder="Ex: Análise e Desenvolvimento de Sistemas"
            maxLength={100}
            autoComplete="off"
          />
          {errors.nome && (
            <span className="text-sm text-red-600 flex items-center mt-1">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.nome.message}
            </span>
          )}
          <span className="text-xs text-gray-500">
            Mínimo 3 caracteres, máximo 100
          </span>
        </div>

        {/* Duração */}
        <div className="space-y-1">
          <label 
            htmlFor="duracao-curso"
            className="block text-sm font-medium text-gray-700"
          >
            Duração (em meses)
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            id="duracao-curso"
            type="number"
            {...register('duracao')}
            className={`mt-1 block w-full text-gray-600 rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 transition-colors ${
              errors.duracao 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
            placeholder="Ex: 24"
            min="1"
            max="60"
            step="1"
            autoComplete="off"
          />
          {errors.duracao && (
            <span className="text-sm text-red-600 flex items-center mt-1">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.duracao.message}
            </span>
          )}
          <span className="text-xs text-gray-500">
            Número inteiro entre 1 e 60 meses
          </span>
        </div>

      </div>
    </div>
  );
};