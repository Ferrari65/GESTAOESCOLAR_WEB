'use client';

import React, { useState } from 'react';
import Image from 'next/image';

// Tipos e interfaces
interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  className?: string;
  onMenuItemClick?: (itemId: string) => void;
}

// Constantes
const SIDEBAR_COLORS = {
  primary: '#2B3A67',
  header: '#243054',
  active: '#1E2A4A',
};

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'cadastrar-aluno',
    label: 'Cadastrar Aluno',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    )
  },
  {
    id: 'professores',
    label: 'Professores',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
      </svg>
    )
  },
  {
    id: 'turmas',
    label: 'Turmas',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12.75c1.63 0 3.07.39 4.24.9c1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73c1.17-.52 2.61-.91 4.24-.91zM4 13c1.1 0 2-.9 2-2c0-1.1-.9-2-2-2s-2 .9-2 2c0 1.1.9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1c-.99 0-1.93.21-2.78.58A2.01 2.01 0 0 0 0 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29zM20 13c1.1 0 2-.9 2-2c0-1.1-.9-2-2-2s-2 .9-2 2c0 1.1.9 2 2 2zm4 3.43c0-.81-.48-1.53-1.22-1.85A6.95 6.95 0 0 0 20 14c-.39 0-.76.04-1.13.1c.4.68.63 1.46.63 2.29V18H24v-1.57zM12 6c1.66 0 3 1.34 3 3c0 1.66-1.34 3-3 3s-3-1.34-3-3c0-1.66 1.34-3 3-3z" />
      </svg>
    )
  },
  {
    id: 'calendario',
    label: 'Calendário',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3.01 3.9 3.01 5L3 19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19ZM7 10H12V15H7V10Z" />
      </svg>
    )
  },
  {
    id: 'boletim',
    label: 'Boletim',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14 2H6C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM9 13V19H7V13H9ZM15 11V19H13V11H15ZM12 15V19H10V15H12Z" />
      </svg>
    )
  }
];

// Componente do Cabeçalho da Sidebar
const SidebarHeader: React.FC = () => (
  <div className="p-6" style={{ backgroundColor: SIDEBAR_COLORS.header }}>
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0">
        <Image 
          src="/image.png" 
          alt="UFEM - Logotipo da instituição" 
          width={48} 
          height={48}
          className="object-contain"
          priority
        />
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold text-white tracking-tight">
          UFEM
        </h1>
        <p className="text-xs text-blue-200 leading-tight mt-1">
          UNIVERSIDADE FEDERAL<br />
          DE ESTUDOS<br />
          MULTIDISCIPLINARES
        </p>
      </div>
    </div>
  </div>
);

// Componente do Item de Menu
interface MenuItemComponentProps {
  item: MenuItem;
  isActive: boolean;
  onClick: (itemId: string) => void;
}

const MenuItemComponent: React.FC<MenuItemComponentProps> = ({ 
  item, 
  isActive, 
  onClick 
}) => {
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isActive) {
      e.currentTarget.style.backgroundColor = SIDEBAR_COLORS.active;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isActive) {
      e.currentTarget.style.backgroundColor = 'transparent';
    }
  };

  return (
    <li>
      <button
        onClick={() => onClick(item.id)}
        className={`w-full flex items-center px-4 py-4 text-left rounded-lg transition-all duration-200 group relative overflow-hidden ${
          isActive
            ? 'text-white shadow-lg border-l-4 border-cyan-400'
            : 'text-blue-200 hover:text-white hover:shadow-md'
        }`}
        style={{
          backgroundColor: isActive ? SIDEBAR_COLORS.active : 'transparent'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={`flex-shrink-0 mr-3 relative z-10 transition-colors duration-200 ${
          isActive 
            ? 'text-cyan-400' 
            : 'text-blue-300 group-hover:text-white'
        }`}>
          {item.icon}
        </div>
        
        <span className={`font-medium text-sm relative z-10 transition-colors duration-200 ${
          isActive ? 'text-white' : 'group-hover:text-white'
        }`}>
          {item.label}
        </span>

        {isActive && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-cyan-400 rounded-full" />
        )}
      </button>
    </li>
  );
};

// Componente do Menu de Navegação
interface NavigationMenuProps {
  activeItem: string;
  onItemClick: (itemId: string) => void;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({ 
  activeItem, 
  onItemClick 
}) => (
  <nav className="mt-20 px-4">
    <ul className="space-y-1">
      {MENU_ITEMS.map((item) => (
        <MenuItemComponent
          key={item.id}
          item={item}
          isActive={activeItem === item.id}
          onClick={onItemClick}
        />
      ))}
    </ul>
  </nav>
);

// Componente do Rodapé da Sidebar
const SidebarFooter: React.FC = () => (
  <div className="absolute bottom-4 left-4 right-4">
    <div className="text-xs text-blue-300 text-center">
      <p>Tela inicial secretaria</p>
    </div>
  </div>
);

// Componente Principal da Sidebar
const UFEMSidebar: React.FC<SidebarProps> = ({ 
  className = '', 
  onMenuItemClick 
}) => {
  const [activeItem, setActiveItem] = useState<string>('cadastrar-aluno');

  const handleItemClick = (itemId: string): void => {
    setActiveItem(itemId);
    onMenuItemClick?.(itemId);
  };

  return (
    <div 
      className={`w-60 min-h-screen text-white shadow-2xl ${className}`} 
      style={{ backgroundColor: SIDEBAR_COLORS.primary }}
    >
      <SidebarHeader />
      <NavigationMenu 
        activeItem={activeItem} 
        onItemClick={handleItemClick} 
      />
      <SidebarFooter />
    </div>
  );
};

export default UFEMSidebar;