'use client';

import React from 'react';
import { useProfessorList } from '@/hooks/secretaria/cadastroprofessor/useProfessorList';
import { LoadingSpinner } from '@/components/ui/loading/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { ProfessorTable } from '@/components/professor/ProfessorTable';

export default function ListaProfessor() {
  const { professores, loading, error, refetch, clearError } = useProfessorList();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Lista de Professores</h2>
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Lista de Professores</h2>
        <ErrorMessage 
          message={error} 
          onRetry={() => {
            clearError();
            refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Lista de Professores
        </h2>
        <button
          onClick={refetch}
          className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Atualizar
        </button>
      </header>
      
      {professores.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM9 9a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-gray-500">Nenhum professor cadastrado ainda.</p>
          <p className="text-sm text-gray-400 mt-1">
            Cadastre o primeiro professor para vê-lo aqui.
          </p>
        </div>
      ) : (
        <ProfessorTable professores={professores} />
      )}
    </div>
  );
}