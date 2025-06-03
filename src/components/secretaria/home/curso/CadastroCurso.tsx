'use client';

import React from "react";
import { useCursoForm } from "@/hooks/secretaria/curso/useCursoForm";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { SuccessMessage } from "@/components/ui/SuccessMessage";
import { CursoDataSection } from "./CursoDataSection";
import ListarCursos from "./ListarCursos";
import type { CursoFormProps } from "@/types/secretariaTypes/cadastroCurso/curso";

export default function CadastroCurso({ onSuccess, onCancel }: CursoFormProps) {
  const {
    form,
    onSubmit,
    loading,
    error,
    successMessage,
    clearMessages
  } = useCursoForm({ onSuccess });

  return (
    <>
      {/* Formulário de Cadastro */}
      <div className="mb-8">
        <header className="flex items-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Cadastrar Novo Curso
          </h1>
        </header>

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

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CursoDataSection form={form} />

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
      </div>

      {/* Listagem de Cursos */}
      <div className="mt-8">
        <ListarCursos 
          onEdit={(curso) => console.log('Editar:', curso)}
          onDelete={(id) => console.log('Excluir:', id)}
        />
      </div>
    </>
  );
}