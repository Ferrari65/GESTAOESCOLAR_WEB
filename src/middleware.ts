import { NextResponse, NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';
// ===== IMPORTAR CONFIGURAÇÃO CENTRALIZADA =====
import { 
  AUTH_CONFIG, 
  MIDDLEWARE_CONFIG, 
  getDashboardRoute, 
  isPublicPath, 
  getRequiredRole 
} from '@/config/app';

interface JWTPayload {
  role: string;
  exp: number;
  sub?: string;
}

function shouldSkipMiddleware(pathname: string): boolean {
  return MIDDLEWARE_CONFIG.skipPaths.some(path => pathname.startsWith(path));
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
  const requiredRole = getRequiredRole(pathname);
  
  if (!requiredRole) {
    return true; // Rota não protegida
  }
  
  return userRole === requiredRole;
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

  const token = getTokenFromRequest(request);
  
  if (!token) {
    if (!isPublicPath(pathname)) {
      const loginUrl = new URL('/login', request.url);
      if (pathname !== '/login') {
        loginUrl.searchParams.set('redirect', pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  const { valid: isTokenValidResult, payload } = isTokenValid(token);
  
  if (!isTokenValidResult || !payload) {
    if (!isPublicPath(pathname)) {
      const loginUrl = new URL('/login', request.url);
      if (pathname !== '/login') {
        loginUrl.searchParams.set('redirect', pathname);
      }
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // ===== USUÁRIO AUTENTICADO COM TOKEN VÁLIDO =====
  
  // Se está na página de login mas já está autenticado, redirecionar para dashboard
  if (pathname === '/login') {
    const dashboardRoute = getDashboardRoute(payload.role);
    return NextResponse.redirect(new URL(dashboardRoute, request.url));
  }

  // Se está em rota pública mas autenticado, redirecionar para dashboard
  if (isPublicPath(pathname) && pathname !== '/login') {
    const dashboardRoute = getDashboardRoute(payload.role);
    return NextResponse.redirect(new URL(dashboardRoute, request.url));
  }

  // Verificar permissões para a rota
  if (!hasPermissionForRoute(payload.role, pathname)) {
    const dashboardRoute = getDashboardRoute(payload.role);
    
    if (pathname === dashboardRoute || pathname.startsWith(dashboardRoute)) {
      return NextResponse.next();
    }
    
    return NextResponse.redirect(new URL(dashboardRoute, request.url));
  }

  const response = NextResponse.next();
  response.headers.set('x-user-role', payload.role);
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|woff2?|ttf|eot)$).*)',
  ],
};