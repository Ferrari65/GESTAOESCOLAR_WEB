'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { BookOpen, ClipboardList, School, ChevronLeft, ChevronRight } from 'lucide-react';

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
  { id: 'atividades', label: 'Atividades', path: '/professor/atividades', icon: <ClipboardList className="w-5 h-5" /> },
  { id: 'provas', label: 'Provas', path: '/professor/provas', icon: <BookOpen className="w-5 h-5" /> },
  { id: 'aulas', label: 'Aulas', path: '/professor/aulas', icon: <School className="w-5 h-5" /> }
];

const getActiveItemId = (pathname: string): string => {
  if (pathname.startsWith('/professor/atividades')) return 'atividades';
  if (pathname.startsWith('/professor/provas')) return 'provas';
  if (pathname.startsWith('/professor/aulas')) return 'aulas';
  return '';
};

const UFEMProfessorSidebar: React.FC<SidebarProps> = ({ className = '', onMenuItemClick }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeItemId, setActiveItemId] = useState<string>(() => getActiveItemId(pathname));
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ufem_sidebar_collapsed') === 'true';
    }
    return false;
  });

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('ufem_sidebar_collapsed', String(newState));
  };

  useEffect(() => {
    setActiveItemId(getActiveItemId(pathname));
  }, [pathname]);

  const handleItemClick = useCallback((itemId: string) => {
    const item = MENU_ITEMS.find(i => i.id === itemId);
    if (!item || pathname === item.path) return;
    setActiveItemId(itemId);
    router.push(item.path);
    onMenuItemClick?.(itemId);
  }, [pathname, router, onMenuItemClick]);

  return (
    <aside
      className={`
        ${!isCollapsed ? 'w-72' : ''}
        fixed top-0 left-0 h-screen z-50
        bg-[#2B3A67]
        shadow-2xl transition-all duration-300 ease-in-out flex flex-col
        ${className}
      `}
      style={{
        width: isCollapsed ? '5.75rem' : undefined
      }}
      role="navigation"
      aria-label="Menu principal"
    >
      {/* Cabeçalho */}
      <div className="relative p-6 border-b border-slate-700/50 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Image src="/image.png" alt="UFEM" width={48} height={48} className="object-contain rounded-lg" priority />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">UFEM</h1>
              <p className="text-xs text-slate-400">Painel do Professor</p>
            </div>
          </div>
        )}
        <button 
          onClick={toggleCollapse}
          className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all duration-200"
          aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
        <ul className="space-y-1">
          {MENU_ITEMS.map(item => (
            <li key={item.id} className="relative">
              <button
                onClick={() => handleItemClick(item.id)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`
                  w-full flex items-center px-3 py-3 text-left rounded-xl transition-all duration-300 group relative
                  ${isCollapsed ? 'justify-center' : 'justify-start'}
                  ${activeItemId === item.id ? 
                    'text-white  bg-blue-950' : 
                    'text-slate-300 hover:text-white hover:bg-slate-800/50'}
                `}
              >
                <div className={`relative z-10 flex-shrink-0 transition-all duration-300 ${activeItemId === item.id ? 'text-white scale-110' : 'text-slate-400 group-hover:text-white group-hover:scale-105'} ${isCollapsed ? '' : 'mr-3'}`}>
                  {item.icon}
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm truncate">{item.label}</span>
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default UFEMProfessorSidebar;
