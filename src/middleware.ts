import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify, JWTPayload } from 'jose';

// Configurações 
const PUBLIC_PATHS = ['/login'] as const;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const TOKEN_COOKIE_NAME = 'nextauth.token';

const ROLE_DASHBOARD_MAP = {
  'ROLE_SECRETARIA': '/secretaria/home',
  'ROLE_PROFESSOR': '/professor/home',  
  'ROLE_ALUNO': '/aluno/home'
} as const;

//  paths  roles publicas
const PROTECTED_ROUTES = {
  '/secretaria': 'ROLE_SECRETARIA',
  '/professor': 'ROLE_PROFESSOR',
  '/aluno': 'ROLE_ALUNO'
} as const;

interface TokenPayload extends JWTPayload {
  role: string;
  userId?: string;
  exp?: number;
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname as any);
}

// paths que não  precisam passar pelo middleware - otimização
function shouldSkipMiddleware(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    /\.(png|jpe?g|svg|gif|ico|css|js|woff2?|ttf|eot)$/i.test(pathname)
  );
}

// Decodificando token
async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as TokenPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

function hasAccessToRoute(pathname: string, userRole: string): boolean {
  for (const [routePrefix, requiredRole] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(routePrefix)) {
      return userRole === requiredRole;
    }
  }
  return true; 
}

function getDashboardByRole(role: string): string {
  return ROLE_DASHBOARD_MAP[role as keyof typeof ROLE_DASHBOARD_MAP] || '/login';
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pula middleware para arquivos estáticos e API routes
  if (shouldSkipMiddleware(pathname)) {
    return NextResponse.next();
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;

// Cases 
// 1: usuario sem token tentar acessar rota Private
  if (!token && !isPublicPath(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

// 2: Usuário com token  tentar resirecionar para login
  if (token && pathname === '/login') {
    const payload = await verifyToken(token);
    
    if (payload?.role) {
      const dashboard = getDashboardByRole(payload.role);
      return NextResponse.redirect(new URL(dashboard, request.url));
    }
    
    const response = NextResponse.next();
    response.cookies.delete(TOKEN_COOKIE_NAME);
    return response;
  }

  // 3: Usuário com token acessando rotas protegidas
  if (token) {
    const payload = await verifyToken(token);
    
    if (!payload) {

      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete(TOKEN_COOKIE_NAME);
      return response;
    }

    if (!hasAccessToRoute(pathname, payload.role)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};