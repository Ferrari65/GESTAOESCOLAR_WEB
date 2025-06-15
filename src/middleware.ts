import { NextResponse, NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { AUTH_CONFIG, MIDDLEWARE_CONFIG } from '@/config/app';

interface JWTPayload {
  role: string;
  exp: number;
  sub?: string;
}

// ===== FUNÇÕES AUXILIARES =====
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
    if (!token || token.trim() === '') return { valid: false };

    const payload = jwtDecode<JWTPayload>(token);
    const now = Math.floor(Date.now() / 1000) - 30; // Buffer de 30 segundos
    
    if (payload.exp <= now) return { valid: false };
    if (!payload.role || payload.role.trim() === '') return { valid: false };
    
    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}

// ===== MIDDLEWARE PRINCIPAL (SIMPLIFICADO) =====
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ PULAR ARQUIVOS ESTÁTICOS
  if (shouldSkipMiddleware(pathname)) {
    return NextResponse.next();
  }

  // ✅ REDIRECIONAR RAIZ PARA LOGIN (SEM VERIFICAR TOKEN)
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ✅ DEIXAR O AUTHCONTEXT GERENCIAR TUDO
  // Middleware só protege rotas, não faz redirecionamento automático
  
  const token = getTokenFromRequest(request);
  
  // ✅ SEM TOKEN: Só bloqueia rotas protegidas
  if (!token) {
    // Se estiver tentando acessar rota protegida sem token
    if (pathname.startsWith('/secretaria') || pathname.startsWith('/professor') || pathname.startsWith('/aluno')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Se estiver em rota pública, deixa passar
    return NextResponse.next();
  }

  // ✅ COM TOKEN: Verificar validade
  const { valid: isTokenValidResult, payload } = isTokenValid(token);
  
  // ✅ TOKEN INVÁLIDO: Só bloqueia rotas protegidas
  if (!isTokenValidResult || !payload) {
    // Se estiver tentando acessar rota protegida com token inválido
    if (pathname.startsWith('/secretaria') || pathname.startsWith('/professor') || pathname.startsWith('/aluno')) {
      // ⚠️ IMPORTANTE: Limpar cookie inválido
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.set(AUTH_CONFIG.tokenCookieName, '', { 
        expires: new Date(0),
        path: '/' 
      });
      return response;
    }
    // Se estiver em rota pública, deixa passar
    return NextResponse.next();
  }

  // ✅ TOKEN VÁLIDO: Verificar permissões
  const userRole = payload.role;

  // Verificar se tem permissão para a rota
  if (pathname.startsWith('/secretaria') && userRole !== 'ROLE_SECRETARIA') {
    // Redirecionar para dashboard correto do usuário
    if (userRole === 'ROLE_PROFESSOR') {
      return NextResponse.redirect(new URL('/professor/home', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname.startsWith('/professor') && userRole !== 'ROLE_PROFESSOR') {
    // Redirecionar para dashboard correto do usuário
    if (userRole === 'ROLE_SECRETARIA') {
      return NextResponse.redirect(new URL('/secretaria/alunos', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname.startsWith('/aluno') && userRole !== 'ROLE_ALUNO') {
    // Redirecionar para dashboard correto do usuário
    if (userRole === 'ROLE_SECRETARIA') {
      return NextResponse.redirect(new URL('/secretaria/alunos', request.url));
    }
    if (userRole === 'ROLE_PROFESSOR') {
      return NextResponse.redirect(new URL('/professor/home', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ✅ TUDO OK: Deixar passar
  const response = NextResponse.next();
  response.headers.set('x-user-role', userRole);
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|woff2?|ttf|eot)$).*)',
  ],
};