import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  FileText,
  BookOpen
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

export default function Sidebar({ className = "" }: SidebarProps): React.JSX.Element {
  const menuItems: MenuItem[] = [
    {
      id: 'gestao-alunos',
      label: 'Gestão de Alunos',
      href: '/gestao-alunos',
      icon: <Users className="h-6 w-6" />,
      isActive: true
    },
    {
      id: 'professores',
      label: 'Professores',
      href: '/professores',
      icon: <GraduationCap className="h-6 w-6" />
    },
    {
      id: 'turmas',
      label: 'Turmas',
      href: '/turmas',
      icon: <BookOpen className="h-6 w-6" />
    },
    {
      id: 'calendario',
      label: 'Calendário',
      href: '/calendario',
      icon: <Calendar className="h-6 w-6" />
    },
    {
      id: 'boletim',
      label: 'Boletim',
      href: '/boletim',
      icon: <FileText className="h-6 w-6" />
    }
  ];

  return (
    <aside className={`bg-slate-700 w-72 min-h-screen flex flex-col ${className}`}>
      {/* Header com Logo */}
      <div className="bg-slate-600 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">U</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-xl tracking-wide">UFEM</span>
            <span className="text-slate-300 text-xs font-medium">
              UNIVERSIDADE FEDERAL<br />
              DE ESTUDOS<br />
              MULTIDISCIPLINARES
            </span>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg text-white transition-all duration-200 group ${
                  item.isActive
                    ? 'bg-white text-slate-700 shadow-md'
                    : 'hover:bg-slate-600 hover:shadow-sm'
                }`}
              >
                <div className={`transition-colors duration-200 ${
                  item.isActive
                    ? 'text-cyan-600'
                    : 'text-slate-300 group-hover:text-white'
                }`}>
                  {item.icon}
                </div>
                <span className={`font-medium text-base ${
                  item.isActive
                    ? 'text-slate-700'
                    : 'text-white'
                }`}>
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer space */}
      <div className="px-4 pb-6">
        {/* Aqui você pode adicionar informações adicionais, logout, etc. */}
      </div>
    </aside>
  );
}

// Componente alternativo usando sua logo real
export function SidebarWithLogo({ className = "" }: SidebarProps): React.JSX.Element {
  const menuItems: MenuItem[] = [
    {
      id: 'gestao-alunos',
      label: 'Gestão de Alunos',
      href: '/gestao-alunos',
      icon: <Users className="h-6 w-6" />,
      isActive: true
    },
    {
      id: 'professores',
      label: 'Professores',
      href: '/professores',
      icon: <GraduationCap className="h-6 w-6" />
    },
    {
      id: 'turmas',
      label: 'Turmas',
      href: '/turmas',
      icon: <BookOpen className="h-6 w-6" />
    },
    {
      id: 'calendario',
      label: 'Calendário',
      href: '/calendario',
      icon: <Calendar className="h-6 w-6" />
    },
    {
      id: 'boletim',
      label: 'Boletim',
      href: '/boletim',
      icon: <FileText className="h-6 w-6" />
    }
  ];

  return (
    <aside className={`bg-slate-700 w-72 min-h-screen flex flex-col ${className}`}>
      {/* Header com Logo Real */}
      <div className="bg-slate-600 px-6 py-6">
        <div className="flex flex-col items-start gap-2">
          <Image 
            src="/logo_principal.png" 
            alt="UFEM Logo" 
            width={120} 
            height={40}
            className="object-contain"
            priority
          />
          <span className="text-slate-300 text-xs font-medium leading-tight">
            UNIVERSIDADE FEDERAL<br />
            DE ESTUDOS<br />
            MULTIDISCIPLINARES
          </span>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg text-white transition-all duration-200 group ${
                  item.isActive
                    ? 'bg-white text-slate-700 shadow-md'
                    : 'hover:bg-slate-600 hover:shadow-sm'
                }`}
              >
                <div className={`transition-colors duration-200 ${
                  item.isActive
                    ? 'text-cyan-600'
                    : 'text-slate-300 group-hover:text-white'
                }`}>
                  {item.icon}
                </div>
                <span className={`font-medium text-base ${
                  item.isActive
                    ? 'text-slate-700'
                    : 'text-white'
                }`}>
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}