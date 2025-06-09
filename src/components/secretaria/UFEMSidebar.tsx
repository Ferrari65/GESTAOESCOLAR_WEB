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
    id: 'alunos',
    label: 'Cadastrar Aluno',
    path: '/secretaria/alunos',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    )
  },
  {
    id: 'professores',
    label: 'Professores',
    path: '/secretaria/professor/home',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
      </svg>
    )
  },
  {
    id: 'cursos',
    label: 'Cursos',
    path: '/secretaria/curso',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
      </svg>
    )
  },
  {
    id: 'turmas',
    label: 'Turmas',
    path: '/secretaria/turmas',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 12.75c1.63 0 3.07.39 4.24.9c1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73c1.17-.52 2.61-.91 4.24-.91z M4 13c1.1 0 2-.9 2-2c0-1.1-.9-2-2-2s-2 .9-2 2c0 1.1.9 2 2 2z M12 6c1.66 0 3 1.34 3 3c0 1.66-1.34 3-3 3s-3-1.34-3-3c0-1.66 1.34-3 3-3z" />
      </svg>
    )
  }
];

const getActiveItemId = (pathname: string): string => {
  if (pathname.startsWith('/secretaria/alunos')) return 'alunos';
  if (pathname.startsWith('/secretaria/professor')) return 'professores';
  if (pathname.startsWith('/secretaria/curso')) return 'cursos';
  if (pathname.startsWith('/secretaria/turmas')) return 'turmas';
  
  return 'alunos'; 
};

const UFEMSidebar: React.FC<SidebarProps> = ({ 
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
    
    if (!menuItem) {
      return;
    }

    if (pathname === menuItem.path) return;

    setActiveItemId(itemId);
    
    // Navegação instantânea sem loading
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

export default UFEMSidebar;