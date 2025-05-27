'use client';

import React, { useContext, useMemo } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import Sidebar from '@/componentes/login/secretaria/home/sidebarmenu';

// Interfaces para tipagem
interface StatCard {
  id: string;
  title: string;
  value: string | number;
  description: string;
  gradient: string;
  textColor: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  bgColor: string;
  hoverColor: string;
  iconColor: string;
  onClick?: () => void;
}

// Componente para Card de Estatística
const StatisticCard: React.FC<StatCard> = ({ title, value, description, gradient, textColor }) => (
  <div className={`${gradient} p-6 rounded-lg text-white shadow-lg hover:shadow-xl transition-shadow duration-300`}>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-3xl font-bold mb-1">{value}</p>
    <p className={`${textColor} text-sm`}>{description}</p>
  </div>
);

// Componente para Ação Rápida
const QuickActionCard: React.FC<QuickAction> = ({ 
  title, 
  description, 
  icon, 
  bgColor, 
  hoverColor, 
  iconColor,
  onClick 
}) => (
  <button 
    onClick={onClick}
    className="bg-white border-2 border-gray-200 hover:border-blue-300 p-4 rounded-lg text-left transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    aria-label={`${title}: ${description}`}
  >
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center ${hoverColor} transition-colors duration-200`}>
        <span className={`${iconColor} font-bold text-lg`} aria-hidden="true">
          {icon}
        </span>
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  </button>
);

// Componente principal
export default function SecretariaHomePage(): React.JSX.Element {
  const { user, signOut } = useContext(AuthContext);

  // Dados das estatísticas (normalmente viriam de uma API)
  const statisticsData: StatCard[] = useMemo(() => [
    {
      id: 'alunos',
      title: 'Total de Alunos',
      value: '1,234',
      description: 'Ativos no sistema',
      gradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
      textColor: 'text-blue-100'
    },
    {
      id: 'professores',
      title: 'Professores',
      value: 89,
      description: 'Corpo docente',
      gradient: 'bg-gradient-to-r from-green-500 to-green-600',
      textColor: 'text-green-100'
    },
    {
      id: 'turmas',
      title: 'Turmas Ativas',
      value: 42,
      description: 'Em andamento',
      gradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
      textColor: 'text-purple-100'
    }
  ], []);

  // Ações rápidas
  const quickActions: QuickAction[] = useMemo(() => [
    {
      id: 'novo-aluno',
      title: 'Novo Aluno',
      description: 'Cadastrar novo estudante',
      icon: '+',
      bgColor: 'bg-blue-100',
      hoverColor: 'group-hover:bg-blue-200',
      iconColor: 'text-blue-600',
      onClick: () => console.log('Navegar para cadastro de aluno')
    },
    {
      id: 'relatorios',
      title: 'Relatórios',
      description: 'Gerar relatórios mensais',
      icon: '📊',
      bgColor: 'bg-green-100',
      hoverColor: 'group-hover:bg-green-200',
      iconColor: 'text-green-600',
      onClick: () => console.log('Navegar para relatórios')
    }
  ], []);

  // Handler para logout
  const handleSignOut = (): void => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      signOut();
    }
  };

  // Early return se não há usuário
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Carregando...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar fixo à esquerda */}
      <Sidebar />
      
      {/* Conteúdo principal */}
      <main className="flex-1 p-8" role="main">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <header className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Dashboard - Secretaria
                </h1>
                <p className="text-gray-600 mt-1">
                  Bem-vindo(a), <span className="font-medium">{user.email}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Perfil: <span className="font-medium capitalize">{user.role}</span>
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Sair do sistema"
              >
                Sair
              </button>
            </div>
          </header>

          {/* Status Section */}
          <section className="bg-white rounded-lg shadow-lg p-6 mb-8" aria-labelledby="status-heading">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h2 id="status-heading" className="font-semibold text-blue-900 mb-2">
                🎉 Sistema Funcionando!
              </h2>
              <p className="text-blue-700">
                Você está logado como {user.role}
              </p>
            </div>
          </section>

          {/* Statistics Section */}
          <section className="mb-8" aria-labelledby="statistics-heading">
            <h2 id="statistics-heading" className="text-xl font-bold text-gray-900 mb-4">
              Estatísticas do Sistema
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {statisticsData.map((stat) => (
                <StatisticCard key={stat.id} {...stat} />
              ))}
            </div>
          </section>

          {/* Quick Actions Section */}
          <section aria-labelledby="actions-heading">
            <h2 id="actions-heading" className="text-xl font-bold text-gray-900 mb-4">
              Ações Rápidas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <QuickActionCard key={action.id} {...action} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}