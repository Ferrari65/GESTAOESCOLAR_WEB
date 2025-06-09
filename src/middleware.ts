// src/middleware.ts - VERSÃO FINAL SEM ERROS DE PERMISSÃO

import { NextResponse, NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// ===== CONFIGURAÇÕES =====
const AUTH_CONFIG = {
  tokenCookieName: 'nextauth.token',
  publicPaths: ['/login', '/redefinir'],
  

  protectedRoutes: {
    '/secretaria': 'ROLE_SECRETARIA',
    '/professor': 'ROLE_PROFESSOR'
  },
  
  dashboardRoutes: {
    ROLE_SECRETARIA: '/secretaria/alunos',
    ROLE_PROFESSOR: '/professor/home'

  }
} as const;

interface JWTPayload {
  role: string;
  exp: number;
  sub?: string;
}

// ===== UTILITY FUNCTIONS =====
function shouldSkipMiddleware(pathname: string): boolean {
  const skipPatterns = [
    /^\/_next/,
    /^\/api/,
    /^\/favicon/,
    /\.(png|jpe?g|svg|gif|ico|css|js|woff2?|ttf|eot|webp)$/i
  ];
  
  return skipPatterns.some(pattern => pattern.test(pathname));
}

function isPublicPath(pathname: string): boolean {
  return AUTH_CONFIG.publicPaths.includes(pathname);
}

function getTokenFromRequest(request: NextRequest): string | null {
  try {
    const tokenFromCookie = request.cookies.get(AUTH_CONFIG.tokenCookieName)?.value;
    return tokenFromCookie && tokenFromCookie.trim() !== '' ? tokenFromCookie : null;
  } catch {
    return null;
  }
}

function isTokenValid(token: string): { valid: boolean; payload?: JWTPayload } {
  try {
    if (!token || token.trim() === '') {
      return { valid: false };
    }

    const payload = jwtDecode<JWTPayload>(token);
    
    // Dar uma margem de 30 segundos para evitar problemas de timing
    const now = Math.floor(Date.now() / 1000) - 30;
    
    if (payload.exp <= now) {
      return { valid: false };
    }
    
    if (!payload.role || payload.role.trim() === '') {
      return { valid: false };
    }
    
    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}

function hasPermissionForRoute(userRole: string, pathname: string): boolean {
  // Se a rota não está nas rotas protegidas, permitir acesso
  let hasProtectedRoute = false;
  let requiredRole = '';
  
  for (const [routePrefix, role] of Object.entries(AUTH_CONFIG.protectedRoutes)) {
    if (pathname.startsWith(routePrefix)) {
      hasProtectedRoute = true;
      requiredRole = role;
      break;
    }
  }
  
  // Se não é rota protegida, permitir
  if (!hasProtectedRoute) {
    return true;
  }
  
  // Se é rota protegida, verificar role
  return userRole === requiredRole;
}

function getDashboardRoute(role: string): string {
  return AUTH_CONFIG.dashboardRoutes[role as keyof typeof AUTH_CONFIG.dashboardRoutes] || '/login';
}

// ===== MIDDLEWARE PRINCIPAL =====
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip arquivos estáticos e APIs
  if (shouldSkipMiddleware(pathname)) {
    return NextResponse.next();
  }

  // Redirecionar raiz para login
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Obter token
  const token = getTokenFromRequest(request);
  
  // Se não tem token
  if (!token) {
    // Se está tentando acessar área protegida, redirecionar para login
    if (!isPublicPath(pathname)) {
      const loginUrl = new URL('/login', request.url);
      if (pathname !== '/login') {
        loginUrl.searchParams.set('redirect', pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
    // Se está em página pública, permitir
    return NextResponse.next();
  }

  // Validar token
  const { valid: isTokenValidResult, payload } = isTokenValid(token);
  
  // Se token é inválido
  if (!isTokenValidResult || !payload) {
    // Se está tentando acessar área protegida, redirecionar para login
    if (!isPublicPath(pathname)) {
      const loginUrl = new URL('/login', request.url);
      if (pathname !== '/login') {
        loginUrl.searchParams.set('redirect', pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
    // Se está em página pública, permitir
    return NextResponse.next();
  }

  // ===== USUÁRIO AUTENTICADO COM TOKEN VÁLIDO =====
  
  // Se usuário logado tenta acessar login, redirecionar para dashboard
  if (pathname === '/login') {
    const dashboardRoute = getDashboardRoute(payload.role);
    return NextResponse.redirect(new URL(dashboardRoute, request.url));
  }

  // Se usuário logado tenta acessar outras páginas públicas, redirecionar para dashboard
  if (isPublicPath(pathname) && pathname !== '/login') {
    const dashboardRoute = getDashboardRoute(payload.role);
    return NextResponse.redirect(new URL(dashboardRoute, request.url));
  }

  // ===== VERIFICAÇÃO DE PERMISSÃO MAIS TOLERANTE =====
  if (!hasPermissionForRoute(payload.role, pathname)) {
    // Em vez de sempre redirecionar, dar uma chance para rotas similares
    const dashboardRoute = getDashboardRoute(payload.role);
    
    // Se já está no dashboard correto, permitir (evita loop)
    if (pathname === dashboardRoute || pathname.startsWith(dashboardRoute)) {
      return NextResponse.next();
    }
    
    // Senão, redirecionar para o dashboard apropriado
    return NextResponse.redirect(new URL(dashboardRoute, request.url));
  }

  // Tudo ok, permitir acesso
  const response = NextResponse.next();
  response.headers.set('x-user-role', payload.role);
  
  return response;
}

// ===== CONFIGURAÇÃO DO MATCHER =====
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|woff2?|ttf|eot)$).*)',
  ],
};