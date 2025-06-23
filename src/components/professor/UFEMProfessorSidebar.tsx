'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface SidebarProps {
  className?: string;
  onMenuItemClick?: (itemId: string) => void;
}
const MENU_ITEMS: MenuItem[] = [
  {
    id: 'atividades',
    label: 'Atividades',
    path: '/professor/atividades',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
      </svg>
    )
  },
  {
    id: 'frequencia',
    label: 'Frequência',
    path: '/professor/frequencia',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    )
  },
  {
    id: 'provas',
    label: 'Provas',
    path: '/professor/provas',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
      </svg>
    )
  },
  {
    id: 'turmas',
    label: 'Turmas',
    path: '/professor/turmas',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 12.75c1.63 0 3.07.39 4.24.9c1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73c1.17-.52 2.61-.91 4.24-.91z M4 13c1.1 0 2-.9 2-2c0-1.1-.9-2-2-2s-2 .9-2 2c0 1.1.9 2 2 2z M12 6c1.66 0 3 1.34 3 3c0 1.66-1.34 3-3 3s-3-1.34-3-3c0-1.66 1.34-3 3-3z" />
      </svg>
    )
  },
  {
    id: 'calendario',
    label: 'Calendário',
    path: '/professor/calendario',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
      </svg>
    )
  }
];

const getActiveItemId = (pathname: string): string => {
  if (pathname.startsWith('/professor/atividades')) return 'atividades';
  if (pathname.startsWith('/professor/frequencia')) return 'frequencia';
  if (pathname.startsWith('/professor/boletim')) return 'boletim';
  if (pathname.startsWith('/professor/turmas')) return 'turmas';
  if (pathname.startsWith('/professor/calendario')) return 'calendario';
  if (pathname.startsWith('/professor/home')) return 'home';
  return 'home';
};

const UFEMProfessorSidebar: React.FC<SidebarProps> = ({ 
  className = '', 
  onMenuItemClick 
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeItemId, setActiveItemId] = useState<string>(() => getActiveItemId(pathname));

  useEffect(() => {
    const newActiveId = getActiveItemId(pathname);
    setActiveItemId(newActiveId);
  }, [pathname]);

  const handleItemClick = useCallback((itemId: string) => {
    const menuItem = MENU_ITEMS.find(item => item.id === itemId);
    if (!menuItem) return;
    if (pathname === menuItem.path) return;
    setActiveItemId(itemId);
    router.push(menuItem.path);
    onMenuItemClick?.(itemId);
  }, [pathname, router, onMenuItemClick]);

  return (
    <aside 
      className={`w-60 min-h-screen text-white shadow-2xl bg-[#2B3A67] ${className}`}
      role="navigation"
      aria-label="Menu principal de navegação"
    >
      <header className="p-6 bg-[#243054]">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Image 
              src="/image.png" 
              alt="UFEM - Logotipo" 
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
      </header>

      <nav className="mt-8 px-4" role="menubar">
        <ul className="space-y-1" role="none">
          {MENU_ITEMS.map((item) => {
            const isActive = activeItemId === item.id;
            return (
              <li key={item.id} role="none">
                <button
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    w-full flex items-center px-4 py-4 text-left rounded-lg 
                    transition-all duration-200 group relative overflow-hidden
                    focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#2B3A67]
                    ${isActive
                      ? 'text-white bg-[#1E2A4A] shadow-lg border-l-4 border-cyan-400'
                      : 'text-blue-200 hover:text-white hover:bg-[#1E2A4A] hover:shadow-md'
                    }
                  `}
                  role="menuitem"
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`Navegar para ${item.label}`}
                >
                  <div className={`
                    flex-shrink-0 mr-3 transition-colors duration-200
                    ${isActive ? 'text-cyan-400' : 'text-blue-300 group-hover:text-white'}
                  `}>
                    {item.icon}
                  </div>
                  <span className="font-medium text-sm">
                    {item.label}
                  </span>
                  {isActive && (
                    <div 
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-cyan-400 rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <footer className="absolute bottom-4 left-4 right-4">
        <div className="text-xs text-blue-300 text-center">
          <p>Sistema Acadêmico</p>
        </div>
      </footer>
    </aside>
  );
};

export default UFEMProfessorSidebar;
