import React, { useState, useCallback } from 'react';
import { FormularioProfessor } from './FormularioProfessor';
import { ListaProfessores } from './ListaProfessores';
import { useProfessorForm } from '@/hooks/secretaria/professor/useProfessorForm';
import { useProfessorActions } from '@/hooks/secretaria/professor/useProfessorActions';
import type { ProfessorResponse } from '@/schemas/professor';

// ===== INTERFACES =====
interface CadastroProfessorProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

type AbaSelecionada = 'cadastro' | 'lista';

// =====  PRINCIPAL =====
export const CadastroProfessor: React.FC<CadastroProfessorProps> = ({
  onSuccess,
  onCancel
}) => {

  const [abaSelecionada, setAbaSelecionada] = useState<AbaSelecionada>('cadastro');
  const [professorEditando, setProfessorEditando] = useState<ProfessorResponse | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(true);

  // ===== HOOKS =====
  const modo = professorEditando ? 'edicao' : 'cadastro';
  
  const {
    form,
    enviarFormulario,
    carregando,
    erro,
    mensagemSucesso,
    limparMensagens
  } = useProfessorForm({
    modo: professorEditando ? 'edicao' : 'cadastro',
    professorId: professorEditando?.id_professor,
    dadosIniciais: professorEditando || undefined,
    onSucesso: useCallback(() => {
      console.log('✅ Professor processado com sucesso!');
      setProfessorEditando(null);
      setAbaSelecionada('lista');
      setMostrarFormulario(false);
      onSuccess?.();
    }, [onSuccess])
  });

  const { buscarProfessorPorId } = useProfessorActions();

  // ===== HANDLERS =====
  const handleNovoProfessor = useCallback(() => {
    setProfessorEditando(null);
    setMostrarFormulario(true);
    setAbaSelecionada('cadastro');
    limparMensagens();
  }, [limparMensagens]);

  const handleMostrarLista = useCallback(() => {
    setProfessorEditando(null);
    setMostrarFormulario(false);
    setAbaSelecionada('lista');
    limparMensagens();
  }, [limparMensagens]);

  const handleEditarProfessor = useCallback(async (professor: ProfessorResponse) => {
    console.log(' Editando professor:', professor.nome);
    
    try {
      const professorCompleto = await buscarProfessorPorId(professor.id_professor);
      
      if (professorCompleto) {

        setProfessorEditando(professorCompleto);
        
        form.reset({
          nome: professorCompleto.nome || '',
          cpf: professorCompleto.cpf || '',
          email: professorCompleto.email || '',
          senha: '', // Sempre vazio para edição
          telefone: professorCompleto.telefone || '',
          data_nasc: professorCompleto.data_nasc || '',
          sexo: professorCompleto.sexo as 'M' | 'F' || 'M',
          logradouro: professorCompleto.logradouro || '',
          bairro: professorCompleto.bairro || '',
          numero: professorCompleto.numero?.toString() || '',
          cidade: professorCompleto.cidade || '',
          uf: professorCompleto.uf || ''
        });
        

        setMostrarFormulario(true);
        setAbaSelecionada('cadastro');
        limparMensagens();
        
        console.log(' Formulário preenchido para edição');
      } else {
        console.error(' Não foi possível buscar dados do professor');
      }
    } catch (error) {
      console.error(' Erro ao buscar professor para edição:', error);
    }
  }, [buscarProfessorPorId, form, limparMensagens]);

  const handleCancelarEdicao = useCallback(() => {
    setProfessorEditando(null);
    setMostrarFormulario(false);
    setAbaSelecionada('lista');
    limparMensagens();
  }, [limparMensagens]);

  const handleCancelarFormulario = useCallback(() => {
    if (professorEditando) {

      handleCancelarEdicao();
    } else {

      onCancel?.();
    }
  }, [professorEditando, handleCancelarEdicao, onCancel]);

  return (
    <div className="space-y-8">
      {/* ===== NAVEGAÇÃO POR ABAS ===== */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            
            {/*  CADASTRO/EDIÇÃO */}
            <button
              onClick={() => {
                setAbaSelecionada('cadastro');
                setMostrarFormulario(true);
              }}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                abaSelecionada === 'cadastro'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {professorEditando ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  )}
                </svg>
                {professorEditando ? 'Editar Professor' : 'Cadastrar Professor'}
              </div>
            </button>
            
            {/* ABA LISTA */}
            <button
              onClick={handleMostrarLista}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                abaSelecionada === 'lista'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Lista de Professores
              </div>
            </button>
            
          </nav>
        </div>

        <div className="p-6">
          
          {/* ===== CONTEÚDO ABA CADASTRO ===== */}
          {abaSelecionada === 'cadastro' && mostrarFormulario && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {professorEditando ? 'Editar Professor' : 'Cadastro de Professores'}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {professorEditando 
                      ? `Editando: ${professorEditando.nome}`
                      : 'Adicione novos professores ao sistema acadêmico'
                    }
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  {professorEditando && (
                    <button
                      onClick={handleCancelarEdicao}
                      className="px-4 py-2 text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancelar Edição
                    </button>
                  )}
                </div>
              </div>

              {/* FORMULÁRIO */}
              <FormularioProfessor
                form={form}
                modo={modo}
                professor={professorEditando || undefined}
                onEnviar={enviarFormulario}
                onCancelar={handleCancelarFormulario}
                carregando={carregando}
                erro={erro}
                mensagemSucesso={mensagemSucesso}
                limparMensagens={limparMensagens}
              />
            </div>
          )}

          {/* ===== CONTEÚDO ABA LISTA ===== */}
          {abaSelecionada === 'lista' && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Professores Cadastrados
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Lista de todos os professores no sistema
                  </p>
                </div>
                
                <button
                  onClick={handleNovoProfessor}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Novo Professor
                </button>
              </div>

              {/* LISTA DE PROFESSORES */}
              <ListaProfessores 
                onEditarProfessor={handleEditarProfessor}
              />
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};