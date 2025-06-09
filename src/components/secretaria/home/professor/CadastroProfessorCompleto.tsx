// src/components/secretaria/home/professor/CadastroProfessorCompleto.tsx - VERSÃO COMPLETA

'use client';

import React, { useEffect } from 'react';
import { 
  useProfessorForm, 
  type ProfessorResponse, 
  formatCPF, 
  formatPhone 
} from '@/hooks/secretaria/professor/useProfessor';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { SuccessMessage } from '@/components/ui/SuccessMessage';

interface CadastroProfessorCompletoProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  professorParaEditar?: ProfessorResponse | null;
  modoEdicao?: boolean;
}

// Estados brasileiros
const ESTADOS_BRASIL = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];

export default function CadastroProfessorCompleto({ 
  onSuccess, 
  onCancel, 
  professorParaEditar,
  modoEdicao = false
}: CadastroProfessorCompletoProps) {
  
  // Preparar dados iniciais para edição
  const dadosIniciais = professorParaEditar ? {
    nome: professorParaEditar.nome,
    cpf: professorParaEditar.cpf,
    email: professorParaEditar.email,
    senha: '', // Sempre vazio para segurança
    telefone: professorParaEditar.telefone,
    data_nasc: professorParaEditar.data_nasc,
    sexo: professorParaEditar.sexo as 'M' | 'F',
    logradouro: professorParaEditar.logradouro,
    bairro: professorParaEditar.bairro,
    numero: professorParaEditar.numero.toString(),
    cidade: professorParaEditar.cidade,
    uf: professorParaEditar.uf
  } : undefined;

  const {
    form,
    onSubmit,
    loading,
    error,
    successMessage,
    clearMessages,
    isEditMode
  } = useProfessorForm({ 
    onSuccess,
    professorId: professorParaEditar?.id_professor,
    initialData: dadosIniciais
  });

  const { register, formState: { errors }, watch, reset } = form;

  // Preencher formulário quando receber dados para editar
  useEffect(() => {
    if (professorParaEditar && modoEdicao) {
      console.log('🔄 Preenchendo formulário para edição:', professorParaEditar.nome);
      
      reset({
        nome: professorParaEditar.nome,
        cpf: professorParaEditar.cpf,
        email: professorParaEditar.email,
        senha: '', // Sempre vazio
        telefone: professorParaEditar.telefone,
        data_nasc: professorParaEditar.data_nasc,
        sexo: professorParaEditar.sexo as 'M' | 'F',
        logradouro: professorParaEditar.logradouro,
        bairro: professorParaEditar.bairro,
        numero: professorParaEditar.numero.toString(),
        cidade: professorParaEditar.cidade,
        uf: professorParaEditar.uf
      });
      
      clearMessages();
    }
  }, [professorParaEditar, modoEdicao, reset, clearMessages]);

  // Watch para feedback visual
  const nomeValue = watch('nome');
  const emailValue = watch('email');
  const senhaValue = watch('senha');
  const cpfValue = watch('cpf');

  const handleCancel = () => {
    if (!isEditMode) {
      reset({
        nome: '',
        cpf: '',
        email: '',
        senha: '',
        telefone: '',
        data_nasc: '',
        sexo: 'M',
        logradouro: '',
        bairro: '',
        numero: '',
        cidade: '',
        uf: ''
      });
    }
    clearMessages();
    onCancel?.();
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('📝 Submetendo formulário no modo:', isEditMode ? 'EDIÇÃO' : 'CADASTRO');
    form.handleSubmit(onSubmit)(event);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header do Formulário */}
      <header className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className={`w-12 h-12 ${isEditMode ? 'bg-gradient-to-br from-orange-500 to-red-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'} rounded-lg flex items-center justify-center mr-4 flex-shrink-0`}>
            {isEditMode ? (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>