'use client';

import React from 'react';
import Image from 'next/image';
import { useProfessorForm } from '@/hooks/secretaria/cadastroprofessor/useProfessorForm';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { SuccessMessage } from '@/components/ui/SuccessMessage';
import { PersonalDataSection } from '@/components/professor/DataSection';
import { AddressSection } from './AddressSection';
import type { ProfessorFormProps } from '@/types/professor';

export default function CadastroProfessor({ onSuccess, onCancel }: ProfessorFormProps) {
  const {
    form,
    onSubmit,
    loading,
    error,
    successMessage,
    clearMessages
  } = useProfessorForm({ onSuccess });

  return (
    <>
      {/* Header */}
      <header className="flex items-center mb-6">
        <Image
          src="/professor-icon.png"
          alt="Ícone Professor"
          width={100}
          height={100}
          className="mr-4"
        />
        <h1 className="text-2xl font-semibold text-gray-800">
          Cadastrar Novo Professor
        </h1>
      </header>

      {/* Mensagens */}
      {successMessage && (
        <SuccessMessage 
          message={successMessage} 
          onClose={clearMessages}
          className="mb-4" 
        />
      )}

      {error && (
        <ErrorMessage 
          message={error} 
          className="mb-4" 
        />
      )}

      {/* Formulário */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <PersonalDataSection form={form} />
        <AddressSection form={form} />
        
        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300 transition-colors flex items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </button>
        </div>
      </form>
    </>
  );
}