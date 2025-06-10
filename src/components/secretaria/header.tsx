'use client';

import React from 'react';
import { LogOut, User, Mail, Sun, Moon } from 'lucide-react';

interface User {
  email: string;
}

interface SecretariaData {
  nome?: string;
  email?: string;
}

interface HeaderProps {
  title?: string;
  subtitle?: string;
  secretariaData?: SecretariaData | null;
  user: User;
  onSignOut: () => void;
  showSignOutButton?: boolean;
}

export default function Header({ 
  title = "Dashboard - Secretaria",
  subtitle = "Bem-vindo(a),",
  secretariaData,
  user,
  onSignOut,
  showSignOutButton = true
}: HeaderProps) {

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  const getTimeIcon = () => {
    const hour = new Date().getHours();
    const isDayTime = hour >= 6 && hour < 18;
    
    return isDayTime ? (
      <Sun className="w-3 h-3 text-yellow-500" />
    ) : (
      <Moon className="w-3 h-3 text-blue-400" />
    );
  };

  return (
    <header className="w-full bg-white border-b-2 border-gray-100 px-8 py-6">
      <div className="flex justify-between items-start">
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
            {title}
          </h1>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gray-700">
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">
                {subtitle} <span className="text-blue-600 font-semibold">
                  {secretariaData?.nome || 'Carregando...'}
                </span>
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4" />
              <span className="text-sm">
                {secretariaData?.email || user.email}
              </span>
            </div>
          </div>
        </div>
        
        {/* Lado Direito - Horário e Ações */}
        <div className="flex items-center gap-6">
          
          {/* Horário com ícone dinâmico */}
          <div className="flex items-center gap-2 text-gray-600">
            {getTimeIcon()}
            <span className="text-sm font-medium">{getCurrentTime()}</span>
          </div>
          
          {/* Botão Sair */}
          {showSignOutButton && (
            <button
              onClick={onSignOut}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium border border-transparent hover:border-red-200"
              aria-label="Sair do sistema"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Linha separadora sutil */}
      <div className="mt-4 h-px bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
    </header>
  );
}