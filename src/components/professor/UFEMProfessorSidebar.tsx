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

// ← REMOVIDO: item 'home' da lista
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
    id: 'aulas',
    label: 'Aulas',
    path: '/professor/aulas',
icon: (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 
      0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </svg>
)
  },
  
];

// ← ALTERADO: função getActiveItemId atualizada
const getActiveItemId = (pathname: string): string => {
  if (pathname.startsWith('/professor/atividades')) return 'atividades';
  if (pathname.startsWith('/professor/provas')) return 'provas';
  
  // ← REMOVIDO: if (pathname.startsWith('/professor/home')) return 'home';
  // ← ALTERADO: fallback agora é 'atividades' em vez de 'home'
  return 'atividades';
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