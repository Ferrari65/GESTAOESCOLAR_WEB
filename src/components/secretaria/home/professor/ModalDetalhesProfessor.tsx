import React from 'react';
import type { ProfessorResponse } from '@/schemas/professor';
import { formatCPF, formatPhone } from '@/schemas/professor';

interface ModalDetalhesProfessorProps {
  professor: ProfessorResponse;
  aberto: boolean;
  onFechar: () => void;
  onEditar: (professor: ProfessorResponse) => void;
}

export const ModalDetalhesProfessor: React.FC<ModalDetalhesProfessorProps> = ({
  professor,
  aberto,
  onFechar,
  onEditar
}) => {
  if (!aberto) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onFechar();
    }
  };

  const handleEditar = () => {
    onEditar(professor);
    onFechar();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo"
    >
      <div 
        className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
        onClick={handleOverlayClick}
      >
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
        />
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                  <span className="text-lg font-bold text-white">
                    {professor.nome.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 id="modal-titulo" className="text-lg font-medium text-white">
                    Detalhes do Professor
                  </h3>
                  <p className="text-blue-100 text-sm">
                    ID: #{professor.id_professor ? professor.id_professor.slice(-8) : 'N/A'}
                  </p>
                </div>
              </div>
              <button
                onClick={onFechar}
                className="text-white hover:text-gray-200 transition-colors"
                aria-label="Fechar modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="bg-white px-6 py-6">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Informações Pessoais
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-gray-600 font-medium">Nome:</label>
                    <p className="text-gray-900 mt-1">{professor.nome}</p>
                  </div>
                  <div>
                    <label className="text-gray-600 font-medium">CPF:</label>
                    <p className="text-gray-900 mt-1 font-mono">
                      {formatCPF(professor.cpf)}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-600 font-medium">Email:</label>
                    <p className="text-gray-900 mt-1 break-all">{professor.email}</p>
                  </div>
                  <div>
                    <label className="text-gray-600 font-medium">Telefone:</label>
                    <p className="text-gray-900 mt-1 font-mono">
                      {formatPhone(professor.telefone)}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-600 font-medium">Data de Nascimento:</label>
                    <p className="text-gray-900 mt-1">
                      {new Date(professor.data_nasc).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-600 font-medium">Sexo:</label>
                    <p className="text-gray-900 mt-1">
                      {professor.sexo === 'M' ? 'Masculino' : 'Feminino'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Endereço
                </h4>
                <div className="text-sm">
                  <p className="text-gray-900">
                    <span className="font-medium">Logradouro:</span> {professor.logradouro}, {professor.numero}
                  </p>
                  <p className="text-gray-900 mt-1">
                    <span className="font-medium">Bairro:</span> {professor.bairro}
                  </p>
                  <p className="text-gray-900 mt-1">
                    <span className="font-medium">Cidade:</span> {professor.cidade} - {professor.uf}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Status
                </h4>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    professor.situacao === 'ATIVO' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <svg 
                      className={`w-2 h-2 mr-1.5 ${
                        professor.situacao === 'ATIVO' ? 'text-green-400' : 'text-red-400'
                      }`} 
                      fill="currentColor" 
                      viewBox="0 0 8 8"
                    >
                      <circle cx={4} cy={4} r={3} />
                    </svg>
                    {professor.situacao}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse sm:space-x-reverse sm:space-x-3">
            <button
              onClick={handleEditar}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
            >
              Editar
            </button>
            <button
              onClick={onFechar}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
