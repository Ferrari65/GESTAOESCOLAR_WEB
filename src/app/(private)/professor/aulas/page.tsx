'use client';

import React, { useContext, useCallback, useState, useEffect } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useProfessorData } from '@/hooks/shared';
import UFEMProfessorSidebar from '@/components/professor/UFEMProfessorSidebar';
import { LoadingSpinner } from '@/components/ui/loading/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { SuccessMessage } from '@/components/ui/SuccessMessage';
import Header from '@/components/secretaria/header';
import { getAPIClient, handleApiError } from '@/services/api';

// ===== INTERFACES =====
interface TurmaOption {
  idTurma: string;
  nome: string;
  curso?: string;
}

interface DisciplinaOption {
  idDisciplina: string;
  nome: string;
}

interface AlunoOption {
  idAluno: string;
  nome: string;
}

interface AulaForm {
  conteudo: string;
  dataAula: string;
  idTurma: string;
  idDisciplina: string;
  alunosPresentes: string[];
}

export default function ProfessorAulasPage(): React.JSX.Element {
  const { user, signOut } = useContext(AuthContext);
  const { professorData, loading: professorLoading, error: professorError } = useProfessorData();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [turmas, setTurmas] = useState<TurmaOption[]>([]);
  const [disciplinas, setDisciplinas] = useState<DisciplinaOption[]>([]);
  const [alunos, setAlunos] = useState<AlunoOption[]>([]);

  const [formData, setFormData] = useState<AulaForm>({
    conteudo: '',
    dataAula: '',
    idTurma: '',
    idDisciplina: '',
    alunosPresentes: []
  });

  const handleMenuClick = useCallback(() => {}, []);
  const handleSignOut = useCallback(() => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      signOut();
    }
  }, [signOut]);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  const fetchTurmas = useCallback(async () => {
    if (!user?.id) return;
    try {
      const api = getAPIClient();
      const response = await api.get(`/professor/${user.id}/turmas`);
      const turmasFormatadas: TurmaOption[] = response.data.map((turma: any) => ({
        idTurma: turma.idTurma || turma.id,
        nome: turma.nome,
        curso: turma.curso?.nome
      }));
      setTurmas(turmasFormatadas);
    } catch (err) {
      console.error('Erro ao buscar turmas:', err);
    }
  }, [user?.id]);

  const fetchDisciplinas = useCallback(async (idTurma: string) => {
    if (!user?.id || !idTurma) return;
    try {
      const api = getAPIClient();
      const response = await api.get(`/disciplina/professor/${idTurma}/${user.id}`);
      const disciplinasFormatadas: DisciplinaOption[] = response.data.map((disc: any) => ({
        idDisciplina: disc.idDisciplina || disc.id,
        nome: disc.nome
      }));
      setDisciplinas(disciplinasFormatadas);
    } catch {
      setDisciplinas([]);
    }
  }, [user?.id]);

  const fetchAlunos = useCallback(async (idTurma: string) => {
    try {
      const api = getAPIClient();
      const response = await api.get(`/aluno/turma/${idTurma}`);
      const alunosFormatados: AlunoOption[] = response.data.map((aluno: any) => ({
        idAluno: aluno.idAluno || aluno.id,
        nome: aluno.nome
      }));
      setAlunos(alunosFormatados);
    } catch {
      setAlunos([]);
    }
  }, []);

  const registrarAula = useCallback(async () => {
    if (!user?.id) return;

    if (!formData.conteudo.trim() || !formData.dataAula || !formData.idTurma || !formData.idDisciplina) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const api = getAPIClient();
      const payload = {
        conteudo: formData.conteudo,
        dataAula: formData.dataAula,
        idTurma: formData.idTurma,
        idDisciplina: formData.idDisciplina,
        idProfessor: user.id,
        alunosPresentes: formData.alunosPresentes
      };

      await api.post('/aulas/registrar', payload);

      setSuccessMessage('Aula registrada com sucesso!');
      setFormData({
        conteudo: '',
        dataAula: '',
        idTurma: '',
        idDisciplina: '',
        alunosPresentes: []
      });
      setAlunos([]);
      setDisciplinas([]);

      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (err) {
      const { message } = handleApiError(err, 'RegistrarAula');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, formData]);

  useEffect(() => {
    if (user?.id) fetchTurmas();
  }, [user?.id, fetchTurmas]);

  useEffect(() => {
    if (formData.idTurma) {
      fetchDisciplinas(formData.idTurma);
      fetchAlunos(formData.idTurma);
    } else {
      setDisciplinas([]);
      setAlunos([]);
      setFormData(prev => ({ ...prev, idDisciplina: '', alunosPresentes: [] }));
    }
  }, [formData.idTurma, fetchDisciplinas, fetchAlunos]);

  if (professorLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <UFEMProfessorSidebar onMenuItemClick={handleMenuClick} className="fixed left-0 top-0 z-40 w-64 h-full" />

      <main className="flex-1 ml-64 p-8 space-y-8">
        <Header
          title="Registro de Aulas"
          subtitle="Bem-vindo(a),"
          professorData={professorData}
          user={user}
          onSignOut={handleSignOut}
        />

        {successMessage && <SuccessMessage message={successMessage} onClose={clearMessages} />}
        {error && <ErrorMessage message={error} onRetry={clearMessages} />}

        <div className="text-gray-600 bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Registrar Aula</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Turma *</label>
              <select
                value={formData.idTurma}
                onChange={(e) => setFormData(prev => ({ ...prev, idTurma: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Selecione uma turma</option>
                {turmas.map(turma => (
                  <option key={turma.idTurma} value={turma.idTurma}>
                    {turma.nome} {turma.curso && `- ${turma.curso}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Disciplina *</label>
              <select
                value={formData.idDisciplina}
                onChange={(e) => setFormData(prev => ({ ...prev, idDisciplina: e.target.value }))}
                disabled={!formData.idTurma}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">
                  {formData.idTurma ? 'Selecione uma disciplina' : 'Primeiro selecione uma turma'}
                </option>
                {disciplinas.map(disciplina => (
                  <option key={disciplina.idDisciplina} value={disciplina.idDisciplina}>
                    {disciplina.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data da Aula *</label>
              <input
                type="date"
                value={formData.dataAula}
                onChange={(e) => setFormData(prev => ({ ...prev, dataAula: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo *</label>
              <textarea
                rows={4}
                value={formData.conteudo}
                onChange={(e) => setFormData(prev => ({ ...prev, conteudo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Descreva o conteúdo ministrado na aula..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Alunos Presentes</label>
              <div className="space-y-2">
                {alunos.map(aluno => (
                  <div key={aluno.idAluno} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.alunosPresentes.includes(aluno.idAluno)}
                      onChange={() => {
                        setFormData(prev => ({
                          ...prev,
                          alunosPresentes: prev.alunosPresentes.includes(aluno.idAluno)
                            ? prev.alunosPresentes.filter(id => id !== aluno.idAluno)
                            : [...prev.alunosPresentes, aluno.idAluno]
                        }));
                      }}
                    />
                    <span>{aluno.nome}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={registrarAula}
              disabled={loading}
              className="px-6 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Registrando...' : 'Registrar Aula'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
