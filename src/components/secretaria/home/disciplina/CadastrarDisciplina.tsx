'use client';

import React, { useState, useEffect, useContext } from "react";
import useDisciplinaForm from "@/hooks/secretaria/disciplina/useDisciplinaForm";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { SuccessMessage } from "@/components/ui/SuccessMessage";
import { DisciplinaDataSection } from "./DisciplinaDataSection";

import { getAPIClient } from "@/services/api";
import { AuthContext } from "@/contexts/AuthContext";
import type { Disciplina } from "@/types/secretariaTypes/cadastroDisciplina/disciplina";
import type { DisciplinaFormProps } from "@/types/secretariaTypes/cadastroDisciplina/disciplina";
import ListarDisciplinas from "./ListarDisciplina";

export default function CadastroDisciplina({ onSuccess, onCancel }: DisciplinaFormProps) {
  const { user } = useContext(AuthContext);

  // Estado local para armazenar a lista de disciplinas
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [errorList, setErrorList] = useState<string | null>(null);

  // Função que busca as disciplinas do backend
  const fetchDisciplinas = async () => {
    if (!user?.id) return;

    try {
      setLoadingList(true);
      setErrorList(null);

      const api = getAPIClient();
      const response = await api.get<Disciplina[]>(`/disciplina/secretaria/${user.id}`);
      setDisciplinas(response.data);
    } catch (err: any) {
      // Pode extrair mensagem de erro aqui
      setErrorList(err.response?.data?.message || err.message || "Erro ao carregar disciplinas");
    } finally {
      setLoadingList(false);
    }
  };

  // dispara o fetch assim que o user.id estiver disponível
  useEffect(() => {
    fetchDisciplinas();
  }, [user?.id]);

  // Chamamos useDisciplinaForm passando o onRefetch = fetchDisciplinas
  const {
    form,
    onSubmit,
    loading: loadingForm,
    error: errorForm,
    successMessage,
    clearMessages
  } = useDisciplinaForm({
    ...(onSuccess && { onSuccess }),         // se quiser algo extra no sucesso
    onRefetch: fetchDisciplinas // after create, recarrega lista
  });

  return (
    <>
      {/* Formulário de Cadastro */}
      <div className="mb-8">
        <header className="flex items-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">Cadastrar Nova Disciplina</h1>
        </header>

        {successMessage && (
          <SuccessMessage
            message={successMessage}
            onClose={clearMessages}
            className="mb-4"
          />
        )}

        {errorForm && (
          <ErrorMessage message={errorForm} className="mb-4" />
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <DisciplinaDataSection form={form} />

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
              disabled={loadingForm}
              className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-green-300 transition-colors flex items-center"
            >
              {loadingForm ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Listagem de Disciplinas */}
      <div className="mt-8">
        {/* Passamos toda a lista via prop, junto com estados de loading / error */}
        <ListarDisciplinas
          disciplinas={disciplinas}
          loading={loadingList}
          error={errorList}
        />
      </div>
    </>
  );
}
