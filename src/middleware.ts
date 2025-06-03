import { NextResponse, NextRequest } from 'next/server';
import { MIDDLEWARE_CONFIG, AUTH_CONFIG, getDashboardRoute } from '@/config/app';

const ROLE_ROUTES = {
  'ROLE_SECRETARIA': [
    '/secretaria',
    '/secretaria/home',
    '/secretaria/alunos', 
    '/secretaria/professor',
    '/secretaria/curso',
    '/secretaria/turmas',
    '/secretaria/calendario',
    '/secretaria/boletim'
  ],
  'ROLE_PROFESSOR': [
    '/professor',
    '/professor/home',
    '/professor/dashboard',
    '/professor/turmas',
    '/professor/notas'
  ],
  'ROLE_ALUNO': [
    '/aluno',
    '/aluno/home', 
    '/aluno/dashboard',
    '/aluno/notas',
    '/aluno/materias'
  ]
} as const;


function isPublicPath(pathname: string): boolean {
  return MIDDLEWARE_CONFIG.publicPaths.includes(pathname);
}

function shouldSkipMiddleware(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    /\.(png|jpe?g|svg|gif|ico|css|js|woff2?|ttf|eot)$/i.test(pathname)
  );
}

function extractRoleFromToken(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf-8')
    );
    
    return payload.role || payload.authorities?.[0] || payload.scope || null;
  } catch {
    return null;
  }
}

function hasPermission(userRole: string, pathname: string): boolean {
  const allowedRoutes = ROLE_ROUTES[userRole as keyof typeof ROLE_ROUTES];
  if (!allowedRoutes) return false;

  return allowedRoutes.some(route => pathname.startsWith(route));
}
function isAccessingOtherRoleRoute(userRole: string, pathname: string): boolean {

  for (const [role, routes] of Object.entries(ROLE_ROUTES)) {
    if (role !== userRole) {
      const isOtherRoleRoute = routes.some(route => pathname.startsWith(route));
      if (isOtherRoleRoute) return true;
    }
  }
  return false;
}

// ===== MIDDLEWARE PRINCIPAL =====

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldSkipMiddleware(pathname)) {
    return NextResponse.next();
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const token = request.cookies.get(AUTH_CONFIG.tokenCookieName)?.value;

  // ========================
  // CASO 1: SEM TOKEN + ROTA PROTEGIDA
  // ========================
  if (!token && !isPublicPath(pathname)) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // ========================
  // CASO 2: COM TOKEN + PÁGINA DE LOGIN
  // ========================
  if (token && pathname === '/login') {
    const userRole = extractRoleFromToken(token);
  
    const dashboard = getDashboardRoute(userRole || '');
    return NextResponse.redirect(new URL(dashboard, request.url));
  }

  // ========================
  // CASO 3: COM TOKEN + ROTA PÚBLICA (exceto login)
  // ========================
  if (token && isPublicPath(pathname) && pathname !== '/login') {
    const userRole = extractRoleFromToken(token);
  
    const dashboard = getDashboardRoute(userRole || '');
    return NextResponse.redirect(new URL(dashboard, request.url));
  }

  // ========================
  // CASO 4: COM TOKEN + VERIFICAÇÃO DE ROLE
  // ========================
  if (token && !isPublicPath(pathname)) {
    const userRole = extractRoleFromToken(token);
    
    if (!userRole) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

   
    if (!hasPermission(userRole, pathname)) {
      
      if (isAccessingOtherRoleRoute(userRole, pathname)) {
     
        const dashboard = getDashboardRoute(userRole);
        return NextResponse.redirect(new URL(dashboard, request.url));
      }
      
      const dashboard = getDashboardRoute(userRole);
      return NextResponse.redirect(new URL(dashboard, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
