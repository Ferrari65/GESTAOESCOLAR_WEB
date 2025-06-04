'use client';

import React from "react";
import { LoadingSpinner } from "@/components/ui/loading/LoadingSpinner";
import type { Disciplina } from "@/types/secretariaTypes/cadastroDisciplina/disciplina";

interface ListarDisciplinasProps {
  disciplinas: Disciplina[];
  loading: boolean;
  error: string | null;
}

export default function ListarDisciplinas({
  disciplinas,
  loading,
  error
}: ListarDisciplinasProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0
                      00-1.414 1.414L8.586 10l-1.293
                      1.293a1 1 0 101.414 1.414L10
                      11.414l1.293 1.293a1 1 0
                      001.414-1.414L11.414 10l1.293-1.293a1 1 0
                      00-1.414-1.414L10 8.586 8.707
                      7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Erro ao carregar disciplinas
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (disciplinas.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832
                  5.477 9.246 5 7.5 5S4.168
                  5.477 3 6.253v13C4.168
                  18.477 5.754 18 7.5 18s3.332.477
                  4.5 1.253m0-13C13.168
                  5.477 14.754 5 16.5 5c1.746
                  0 3.332.477 4.5 1.253v13C19.832
                  18.477 18.246 18 16.5
                  18c-1.746 0-3.332.477-4.5
                  1.253"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Nenhuma disciplina cadastrada
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Comece criando sua primeira disciplina.
        </p>
      </div>
    );
  }

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Disciplinas Cadastradas
            </h2>
            <p className="text-sm text-gray-500">
              {disciplinas.length} disciplina(s) encontrada(s)
            </p>
          </div>
        </div>
      </header>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ementa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Carga Horária
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {disciplinas.map((disciplina, index) => (
                <tr
                  key={disciplina.idDisciplina || `disciplina-${index}`}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {disciplina.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {disciplina.ementa}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {disciplina.cargaHoraria}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        disciplina.situacao === "ATIVO"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {disciplina.situacao}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
