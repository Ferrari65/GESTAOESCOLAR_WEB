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

  let hasProtectedRoute = false;
  let requiredRole = '';
  
  for (const [routePrefix, role] of Object.entries(AUTH_CONFIG.protectedRoutes)) {
    if (pathname.startsWith(routePrefix)) {
      hasProtectedRoute = true;
      requiredRole = role;
      break;
    }
  }
  
  if (!hasProtectedRoute) {
    return true;
  }
  
  return userRole === requiredRole;
}

function getDashboardRoute(role: string): string {
  return AUTH_CONFIG.dashboardRoutes[role as keyof typeof AUTH_CONFIG.dashboardRoutes] || '/login';
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
  

  if (pathname === '/login') {
    const dashboardRoute = getDashboardRoute(payload.role);
    return NextResponse.redirect(new URL(dashboardRoute, request.url));
  }

  if (isPublicPath(pathname) && pathname !== '/login') {
    const dashboardRoute = getDashboardRoute(payload.role);
    return NextResponse.redirect(new URL(dashboardRoute, request.url));
  }


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