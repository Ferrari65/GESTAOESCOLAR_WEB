'use client';

import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface WelcomeAnimationProps {
  userName?: string;
  onComplete?: () => void;
  duration?: number; // em milissegundos
}

export const WelcomeAnimation: React.FC<WelcomeAnimationProps> = ({ 
  userName = 'Usuário',
  onComplete,
  duration = 3000 
}) => {
  React.useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(onComplete, duration);
      return () => clearTimeout(timer);
    }
  }, [onComplete, duration]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="text-center text-white">
        {/* Animação Lottie */}
        <div className="w-64 h-64 mx-auto mb-8">
          <DotLottieReact
            src="https://lottie.host/6fa63168-9898-4df0-8f11-2780619c00f7/herfbWzulS.lottie"
            loop
            autoplay
          />
        </div>
        
        {/* Texto de boas-vindas */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold animate-fade-in">
            Bem-vindo!
          </h1>
          <p className="text-xl opacity-90 animate-fade-in-delay">
            {userName}
          </p>
          <div className="flex justify-center space-x-1 mt-6">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in 1s ease-out 0.5s both;
        }
      `}</style>
    </div>
  );
};