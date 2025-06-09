// src/components/secretaria/home/turma/CadastroTurma.tsx

'use client';

import React from 'react';
import { useTurmaForm } from '@/hooks/secretaria/turma';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { SuccessMessage } from '@/components/ui/SuccessMessage';
import { TurmaDataSection } from './TurmaDataSection';

interface CadastroTurmaProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CadastroTurma({ onSuccess, onCancel }: CadastroTurmaProps) {
  const {
    form,
    onSubmit,
    loading,
    error,
    successMessage,
    clearMessages
  } = useTurmaForm({ onSuccess });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    form.handleSubmit(onSubmit)(event);
  };

  const handleCancel = () => {
    form.reset({
      nome: '',
      id_curso: '',
      ano: new Date().getFullYear().toString(),
      turno: 'DIURNO',
    });
    clearMessages();
    onCancel?.();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12.75c1.63 0 3.07.39 4.24.9c1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73c1.17-.52 2.61-.91 4.24-.91z M4 13c1.1 0 2-.9 2-2c0-1.1-.9-2-2-2s-2 .9-2 2c0 1.1.9 2 2 2z M12 6c1.66 0 3 1.34 3 3c0 1.66-1.34 3-3 3s-3-1.34-3-3c0-1.66 1.34-3 3-3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Cadastrar Nova Turma
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Preencha as informações da turma
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 text-gray-600">
        {successMessage && (
          <SuccessMessage 
            message={successMessage} 
            onClose={clearMessages}
            className="mb-6"
          />
        )}

        {error && (
          <ErrorMessage 
            message={error}
            onRetry={clearMessages}
            className="mb-6"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <TurmaDataSection form={form} />

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            {onCancel && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center min-w-[120px] justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Salvando...
                </>
              ) : (
                'Cadastrar Turma'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}