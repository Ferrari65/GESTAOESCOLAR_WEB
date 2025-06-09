// src/components/secretaria/home/turma/TurmaDataSection.tsx

'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useCursoList } from '@/hooks/secretaria/curso';
import type { TurmaFormData } from '@/schemas';

interface TurmaDataSectionProps {
  form: UseFormReturn<TurmaFormData>;
}

export const TurmaDataSection: React.FC<TurmaDataSectionProps> = ({ form }) => {
  const { register, formState: { errors }, watch } = form;
  const { cursos, loading: cursosLoading, error: cursosError, refetch } = useCursoList();
  
  const cursoSelecionado = watch('id_curso');
  const turnoSelecionado = watch('turno');
  const nomeValue = watch('nome');
  const anoValue = watch('ano');
  
  const cursosAtivos = cursos.filter(curso => 
    curso.situacao === 'ATIVO' && 
    curso.nome && 
    curso.idCurso
  );

  const cursoDetalhes = cursosAtivos.find(curso => 
    String(curso.idCurso) === String(cursoSelecionado)
  );

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-700">Dados da Turma</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome da Turma */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nome da Turma <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('nome')}
            className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 transition-colors ${
              errors.nome 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-purple-500'
            }`}
            placeholder="Ex: Turma ADS 2025-1"
            maxLength={100}
          />
          {errors.nome && (
            <span className="text-sm text-red-600 mt-1">{errors.nome.message}</span>
          )}
        </div>

        {/* Ano */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Ano Letivo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('ano')}
            className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 transition-colors ${
              errors.ano 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-purple-500'
            }`}
            placeholder="2025"
            maxLength={4}
          />
          {errors.ano && (
            <span className="text-sm text-red-600 mt-1">{errors.ano.message}</span>
          )}
        </div>

        {/* Curso */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Curso <span className="text-red-500">*</span>
          </label>
          
          {cursosError && (
            <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded text-sm">
              <p className="text-red-700">{cursosError}</p>
              <button
                type="button"
                onClick={refetch}
                className="mt-1 text-red-600 hover:text-red-500 underline"
              >
                Tentar novamente
              </button>
            </div>
          )}
          
          <select
            {...register('id_curso')}
            className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 transition-colors ${
              errors.id_curso 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-purple-500'
            }`}
            disabled={cursosLoading}
          >
            <option value="">
              {cursosLoading 
                ? 'Carregando cursos...' 
                : cursosAtivos.length === 0
                ? 'Nenhum curso ativo'
                : 'Selecione um curso'}
            </option>
            
            {cursosAtivos.map((curso) => (
              <option key={curso.idCurso} value={curso.idCurso}>
                {curso.nome}
              </option>
            ))}
          </select>
          
          {errors.id_curso && (
            <span className="text-sm text-red-600 mt-1">{errors.id_curso.message}</span>
          )}
        </div>

        {/* Turno */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Turno <span className="text-red-500">*</span>
          </label>
          
          <select
            {...register('turno')}
            className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 transition-colors ${
              errors.turno 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-purple-500'
            }`}
          >
            <option value="">Selecione o turno</option>
            <option value="DIURNO">Diurno</option>
            <option value="NOTURNO">Noturno</option>
          </select>
          
          {errors.turno && (
            <span className="text-sm text-red-600 mt-1">{errors.turno.message}</span>
          )}
        </div>
      </div>
      
      {/* Preview */}
      {(nomeValue || anoValue || cursoDetalhes || turnoSelecionado) && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Preview da Turma</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Nome:</span> 
              <span className="font-medium ml-2">
                {nomeValue || 'Não informado'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Ano:</span> 
              <span className="font-medium ml-2">
                {anoValue || 'Não informado'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Curso:</span> 
              <span className="font-medium ml-2">
                {cursoDetalhes?.nome || 'Não selecionado'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Turno:</span> 
              <span className="font-medium ml-2">
                {turnoSelecionado || 'Não selecionado'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};