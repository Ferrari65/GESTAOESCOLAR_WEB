'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import type { DisciplinaFormData } from '@/schemas/secretaria/disciplina/disciplinaValidations';

interface DisciplinaDataSectionProps {
  form: UseFormReturn<DisciplinaFormData>;
}

export const DisciplinaDataSection: React.FC<DisciplinaDataSectionProps> = ({ form }) => {
  const { register, formState: { errors } } = form;

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-700 mb-4">Dados da Disciplina</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Nome da Disciplina */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Nome
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            {...register('nome')}
            className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 transition-colors ${
              errors.nome 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
            }`}
            placeholder="Ex: Matemática Aplicada"
          />
          {errors.nome && (
            <span className="text-sm text-red-600">{errors.nome.message}</span>
          )}
          <span className="text-xs text-gray-500">Obrigatório. Entre 3 e 100 caracteres.</span>
        </div>

        {/* Carga Horária */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Carga Horária (horas)
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="number"
            {...register('cargaHoraria')}
            className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 transition-colors ${
              errors.cargaHoraria 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
            }`}
            placeholder="Ex: 60"
          />
          {errors.cargaHoraria && (
            <span className="text-sm text-red-600">{errors.cargaHoraria.message}</span>
          )}
          <span className="text-xs text-gray-500">Informe um número inteiro positivo</span>
        </div>
      </div>

      {/* Ementa */}
      <div className="mt-6 space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Ementa
          <span className="text-red-500 ml-1">*</span>
        </label>
        <textarea
          rows={4}
          {...register('ementa')}
          className={`mt-1 block w-full rounded-md border px-3 py-2 resize-none focus:outline-none focus:ring-1 transition-colors ${
            errors.ementa 
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
          }`}
          placeholder="Descreva os principais tópicos abordados na disciplina..."
        />
        {errors.ementa && (
          <span className="text-sm text-red-600">{errors.ementa.message}</span>
        )}
        <span className="text-xs text-gray-500">Obrigatório. Pode conter entre 10 e 1000 caracteres.</span>
      </div>
    </div>
  );
};
