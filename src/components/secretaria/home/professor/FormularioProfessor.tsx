import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { SuccessMessage } from '@/components/ui/SuccessMessage';
import { FormInput } from '@/components/ui/FormInput';
import type { ProfessorCadastroData, ProfessorEdicaoData, ProfessorResponse } from '@/schemas/professor';

// ===== ESTADOS  =====
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

// ===== INTERFACES =====
interface FormularioProfessorProps {
  form: UseFormReturn<ProfessorCadastroData | ProfessorEdicaoData>;
  modo: 'cadastro' | 'edicao';
  professor?: ProfessorResponse;
  onEnviar: () => Promise<void>;
  onCancelar?: () => void;
  carregando: boolean;
  erro: string | null;
  mensagemSucesso: string | null;
  limparMensagens: () => void;
}

export const FormularioProfessor: React.FC<FormularioProfessorProps> = ({
  form,
  modo,
  professor,
  onEnviar,
  onCancelar,
  carregando,
  erro,
  mensagemSucesso,
  limparMensagens
}) => {
  const { register, formState: { errors }, handleSubmit, watch } = form;
  
  const senhaValue = watch('senha');
  const nomeValue = watch('nome');
  const emailValue = watch('email');

  const handleEnvio = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSubmit(onEnviar)(event);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">

      <header className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className={`w-12 h-12 ${modo === 'edicao' ? 'bg-gradient-to-br from-orange-500 to-red-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'} rounded-lg flex items-center justify-center mr-4 flex-shrink-0`}>
            {modo === 'edicao' ? (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {modo === 'edicao' ? 'Editar Professor' : 'Cadastrar Novo Professor'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {modo === 'edicao' 
                ? `Atualizando dados de: ${professor?.nome || 'Professor'}`
                : 'Preencha as informações do professor para cadastrá-lo no sistema'
              }
            </p>
          </div>
        </div>
      </header>


      <div className="p-6">

        <div className="space-y-4 mb-6">
          {mensagemSucesso && (
            <SuccessMessage 
              message={mensagemSucesso} 
              onClose={limparMensagens}
            />
          )}

          {erro && (
            <ErrorMessage 
              message={erro}
              onRetry={limparMensagens}
            />
          )}
        </div>

        {/* ALERTA PARA EDIÇÃO */}
        {modo === 'edicao' && professor && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-orange-800">
                  Modo Edição: {professor.nome}
                </h3>
                <div className="mt-2 text-sm text-orange-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>CPF:</strong>  Não pode ser alterado por segurança</li>
                    <li><strong>Senha:</strong> Deixe vazio para manter a senha atual</li>
                    <li><strong>Email:</strong> Pode ser alterado se necessário</li>
                    <li><strong>Outros campos:</strong> Serão atualizados conforme preenchido</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FORMULÁRIO */}
        <form onSubmit={handleEnvio} className="space-y-6">
          
          {/* ===== DADOS PESSOAIS ===== */}
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Dados Pessoais
                {modo === 'edicao' && (
                  <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded-full">
                    Modo Edição
                  </span>
                )}
              </h2>
              
              {/* GRID DE CAMPOS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-600">
                
                {/* NOME COMPLETO */}
                <div className="md:col-span-2">
                  <FormInput
                    label="Nome completo"
                    placeholder="Digite o nome completo do professor"
                    {...register('nome')}
                    error={errors.nome?.message}
                    maxLength={100}
                    autoComplete="name"
                    required
                  />
                  {nomeValue && nomeValue.length >= 2 && !errors.nome && (
                    <div className="mt-1 flex items-center text-green-600">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs">Nome válido</span>
                    </div>
                  )}
                </div>

                {/* CPF - DESABILITADO NA EDIÇÃO */}
                <div>
                  <FormInput
                    label="CPF"
                    placeholder="000.000.000-00"
                    {...register('cpf')}
                    error={errors.cpf?.message}
                    maxLength={14}
                    autoComplete="off"
                    
                    required={modo === 'cadastro'}
                    disabled={modo === 'edicao'} 
                    className={modo === 'edicao' ? 'bg-gray-100 cursor-not-allowed' : ''}
                  />
                  {modo === 'edicao' && (
                    <div className="mt-1 flex items-center text-amber-600">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs">CPF protegido - não pode ser alterado</span>
                    </div>
                  )}
                </div>

                {/* TELEFONE */}
                <div>
                  <FormInput
                    label="Telefone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    {...register('telefone')}
                    error={errors.telefone?.message}
                    maxLength={15}
                    autoComplete="tel"
                    helperText="Celular ou fixo com DDD"
                    required
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <FormInput
                    label="E-mail"
                    type="email"
                    placeholder="professor@email.com"
                    {...register('email')}
                    error={errors.email?.message}
                    maxLength={254}
                    autoComplete="email"
                    helperText={modo === 'edicao' ? "Email pode ser alterado" : "Email será usado para login"}
                    required
                  />
                  {emailValue && emailValue.includes('@') && emailValue.includes('.') && !errors.email && (
                    <div className="mt-1 flex items-center text-green-600">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs">Email válido</span>
                    </div>
                  )}
                </div>

                {/* SENHA */}
                <div>
                  <FormInput
                    label={modo === 'edicao' ? "Nova senha (opcional)" : "Senha"}
                    type="password"
                    placeholder={modo === 'edicao' ? "Deixe vazio para manter a atual" : "Mínimo 6 caracteres"}
                    {...register('senha')}
                    error={errors.senha?.message}
                    maxLength={50}
                    autoComplete={modo === 'edicao' ? "new-password" : "new-password"}
                    helperText={
                      modo === 'edicao' 
                        ? "Deixe vazio para manter a senha atual" 
                        : "Mínimo 6 caracteres"
                    }
                    required={modo === 'cadastro'}
                  />
                  {/* INDICADOR DE FORÇA DA SENHA */}
                  {senhaValue && senhaValue.length > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-1">
                          <div 
                            className={`h-1 rounded-full transition-all duration-300 ${
                              senhaValue.length < 6 
                                ? 'w-1/3 bg-red-500' 
                                : senhaValue.length < 8 
                                ? 'w-2/3 bg-yellow-500' 
                                : 'w-full bg-green-500'
                            }`}
                          />
                        </div>
                        <span className={`text-xs font-medium ${
                          senhaValue.length < 6 
                            ? 'text-red-600' 
                            : senhaValue.length < 8 
                            ? 'text-yellow-600' 
                            : 'text-green-600'
                        }`}>
                          {senhaValue.length < 6 ? 'Fraca' : senhaValue.length < 8 ? 'Média' : 'Forte'}
                        </span>
                      </div>
                      {modo === 'edicao' && (
                        <p className="text-xs text-gray-500 mt-1">
                          {senhaValue.length === 0 ? 'Senha atual será mantida' : 'Nova senha será definida'}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* DATA DE NASCIMENTO */}
                <div>
                  <FormInput
                    label="Data de Nascimento"
                    type="date"
                    {...register('data_nasc')}
                    error={errors.data_nasc?.message}
                    autoComplete="bday"
                    helperText="Idade entre 16 e 120 anos"
                    max={new Date(new Date().getFullYear() - 16, new Date().getMonth(), new Date().getDate()).toISOString().split('T')[0]}
                    min={new Date(new Date().getFullYear() - 120, new Date().getMonth(), new Date().getDate()).toISOString().split('T')[0]}
                    required
                  />
                </div>

                {/* SEXO */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Sexo
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    {...register('sexo')}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 transition-colors bg-white ${
                      errors.sexo 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    aria-invalid={!!errors.sexo}
                  >
                    <option value="">Selecione o sexo</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                  {errors.sexo && (
                    <span className="text-sm text-red-600 flex items-center mt-1" role="alert">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.sexo.message}
                    </span>
                  )}
                </div>

              </div>
            </div>

            {/* ===== ENDEREÇO ===== */}
            <div className="border-t border-gray-200 pt-4">
              <h2 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Endereço
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* LOGRADOURO */}
                <div>
                  <FormInput
                    label="Logradouro"
                    placeholder="Rua, Avenida, etc."
                    {...register('logradouro')}
                    error={errors.logradouro?.message}
                    required
                  />
                </div>

                {/* NÚMERO */}
                <div>
                  <FormInput
                    label="Número"
                    placeholder="123"
                    {...register('numero')}
                    error={errors.numero?.message}
                    required
                  />
                </div>

                {/* BAIRRO */}
                <div>
                  <FormInput
                    label="Bairro"
                    placeholder="Centro, Jardim, etc."
                    {...register('bairro')}
                    error={errors.bairro?.message}
                    required
                  />
                </div>

                {/* CIDADE */}
                <div>
                  <FormInput
                    label="Cidade"
                    placeholder="São Paulo, Rio de Janeiro, etc."
                    {...register('cidade')}
                    error={errors.cidade?.message}
                    required
                  />
                </div>

                {/* ESTADO (UF) */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Estado (UF)
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    {...register('uf')}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 transition-colors bg-white ${
                      errors.uf 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  >
                    <option value="">Selecione o estado</option>
                    {ESTADOS_BRASIL.map((estado) => (
                      <option key={estado.value} value={estado.value}>
                        {estado.label} ({estado.value})
                      </option>
                    ))}
                  </select>
                  {errors.uf && (
                    <span className="text-sm text-red-600 flex items-center mt-1" role="alert">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.uf.message}
                    </span>
                  )}
                </div>

              </div>
            </div>

          </div>

          {/* ===== BOTÕES ===== */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            {onCancelar && (
              <button
                type="button"
                onClick={onCancelar}
                disabled={carregando}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Cancelar operação"
              >
                Cancelar
              </button>
            )}
            
            <button
              type="submit"
              disabled={carregando}
              className={`px-6 py-2 text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center min-w-[140px] justify-center ${
                modo === 'edicao' 
                  ? 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              }`}
            >
              {carregando ? (
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
                  <span>
                    {modo === 'edicao' ? 'Atualizando...' : 'Salvando...'}
                  </span>
                </>
              ) : (
                modo === 'edicao' ? 'Atualizar Professor' : 'Cadastrar Professor'
              )}
            </button>
          </div>
        </form>

        {/* PREVIEW DOS DADOS */}
        {(nomeValue || emailValue) && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview dos dados
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Nome:</span> 
                <span className="font-medium ml-2">
                  {nomeValue || 'Não informado'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Email:</span> 
                <span className="font-medium ml-2">
                  {emailValue || 'Não informado'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* LOADING OVERLAY */}
      {carregando && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50"
          aria-hidden="true"
        >
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4 shadow-xl max-w-sm">
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
            <div>
              <span className="text-gray-700 font-medium">
                {modo === 'edicao' 
                  ? 'Atualizando professor...' 
                  : 'Cadastrando professor...'
                }
              </span>
              <p className="text-sm text-gray-500 mt-1">
                Por favor, aguarde...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};