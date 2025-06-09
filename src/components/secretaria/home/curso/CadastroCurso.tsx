'use client';

import React, { useCallback } from "react";
import { useCursoForm } from "@/hooks/secretaria/curso";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { SuccessMessage } from "@/components/ui/SuccessMessage";
import { CursoDataSection } from "./CursoDataSection";
import ListarCursos from "./ListarCursos";
import type { CursoFormProps } from "@/hooks/secretaria/curso";

export default function CadastroCurso({ onSuccess, onCancel }: CursoFormProps) {
  const {
    form,
    onSubmit,
    loading,
    error,
    successMessage,
    clearMessages
  } = useCursoForm({ 
    onSuccess: useCallback(() => {
      console.log('✅ [CADASTRO CURSO] Curso cadastrado com sucesso');
      onSuccess?.();
    }, [onSuccess])
  });

  const handleClearMessages = useCallback((): void => {
    clearMessages();
  }, [clearMessages]);

  const handleFormSubmit = useCallback((event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    form.handleSubmit(onSubmit)(event);
  }, [form, onSubmit]);

  const handleCancel = useCallback((): void => {

    form.reset({
      nome: '',
      duracao: 1,
    });
    clearMessages();
    onCancel?.();
  }, [form, clearMessages, onCancel]);

  return (
    <div className="space-y-8">
*/}
      <section 
        className="bg-white rounded-lg shadow-sm border border-gray-200"
        aria-labelledby="cadastro-heading"
      >
        {/* Header do Formulário */}
        <header className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
              <svg 
                className="w-6 h-6 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                />
              </svg>
            </div>
            <div>
              <h1 
                id="cadastro-heading"
                className="text-xl font-semibold text-gray-900"
              >
                Cadastrar Novo Curso
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Preencha as informações do curso para cadastrá-lo no sistema
              </p>
            </div>
          </div>
        </header>

        {/* Conteúdo do Formulário */}
        <div className="p-6">
          {/* Mensagens de Feedback */}
          <div className="space-y-4 mb-6">
            {successMessage && (
              <SuccessMessage 
                message={successMessage} 
                onClose={handleClearMessages}
              />
            )}

            {error && (
              <ErrorMessage 
                message={error}
                onRetry={handleClearMessages}
              />
            )}
          </div>

          {/* Formulário */}
          <form 
            onSubmit={handleFormSubmit}
            className="space-y-6"
            noValidate
            aria-describedby={error ? "error-message" : undefined}
          >
            {/* Campos do Formulário */}
            <CursoDataSection form={form} />

            {/* Botões de Ação */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              {onCancel && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Cancelar cadastro do curso"
                >
                  Cancelar
                </button>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center min-w-[120px] justify-center"
                aria-describedby={loading ? "loading-message" : undefined}
              >
                {loading ? (
                  <>
                    <svg 
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                      fill="none" 
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span id="loading-message">Salvando...</span>
                    <span className="sr-only">Processando cadastro do curso...</span>
                  </>
                ) : (
                  'Cadastrar Curso'
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ===== SEÇÃO: LISTAGEM DE CURSOS ===== */}
      <section 
        className="bg-white rounded-lg shadow-sm border border-gray-200"
        aria-labelledby="lista-heading"
      >
        <div className="p-6">
          <ListarCursos />
        </div>
      </section>

      {/* Loading overlay global para formulário */}
      {loading && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50"
          aria-hidden="true"
        >
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4 shadow-xl">
            <svg 
              className="animate-spin h-6 w-6 text-blue-600" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-gray-700 font-medium">
              Processando cadastro do curso...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}