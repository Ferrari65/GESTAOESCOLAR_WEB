'use client';

import React, { useState } from 'react';

interface SidebarProps {
  className?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

const UFEMSidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const [activeItem, setActiveItem] = useState<string>('gestao-alunos');

  const menuItems: MenuItem[] = [
    {
      id: 'gestao-alunos',
      label: 'Gestão de Alunos',
      isActive: true,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      id: 'professores',
      label: 'Professores',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path fillRule="evenodd" d="M10 2C5.582 2 2 5.582 2 10s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8zM8 11a3 3 0 106 0v2a1 1 0 11-2 0v-2a1 1 0 10-2 0v2a1 1 0 11-2 0v-2z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      id: 'turmas',
      label: 'Turmas',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
          <path d="M6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      )
    },
    {
      id: 'calendario',
      label: 'Calendário',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      id: 'boletim',
      label: 'Boletim',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      )
    }
  ];

  const handleItemClick = (itemId: string): void => {
    setActiveItem(itemId);
  };

  return (
    <div className={`w-64 min-h-screen bg-gradient-to-b from-blue-800 to-blue-900 text-white ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-blue-700">
        <div className="flex items-center space-x-3">
          {/* UFEM Logo */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-cyan-400 rounded-lg flex items-center justify-center">
              <div className="text-white font-bold text-lg">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
            </div>
          </div>
          {/* Text */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white tracking-tight">UFEM</h1>
            <p className="text-xs text-blue-200 leading-tight">
              UNIVERSIDADE FEDERAL<br />
              DE ESTUDOS<br />
              MULTIDISCIPLINARES
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 group ${
                  activeItem === item.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`}
              >
                <div className={`flex-shrink-0 mr-3 ${
                  activeItem === item.id ? 'text-white' : 'text-blue-300 group-hover:text-white'
                }`}>
                  {item.icon}
                </div>
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default UFEMSidebar;