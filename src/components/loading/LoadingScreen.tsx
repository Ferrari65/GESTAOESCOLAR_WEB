'use client';

import React from 'react';

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
}

/**
 * Componente de tela de carregamento reutilizável
 * Exibe um spinner animado com mensagens personalizáveis
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Carregando...', 
  submessage = 'Aguarde um momento' 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        {/* Spinner animado */}
        <div 
          className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"
          role="status"
          aria-label="Carregando conteúdo"
        />
        
        {/* Mensagem principal */}
        <h2 className="text-lg font-medium text-gray-700">
          {message}
        </h2>
        
        {/* Submensagem */}
        <p className="text-sm text-gray-500">
          {submessage}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;