import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const publicPaths = ['/login'];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    /\.(png|jpe?g|svg|gif|ico|css|js)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('nextauth.token')?.value;

  // Redireciona para login se não tiver token
  if (!token && !publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  // Se o usuário já estiver logado e tentar acessar a página de login, redireciona para a dashboard correta
  if (token && pathname === '/login') {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
      const { payload } = await jwtVerify(token, secret);
      const role = payload.role as string;

      const dashboardMap = {
        'ROLE_SECRETARIA': '/secretaria/home',
        'ROLE_PROFESSOR': '/professor/home',
        'ROLE_ALUNO': '/aluno/home'
      };

      const dashboard = dashboardMap[role as keyof typeof dashboardMap] || '/login';
      return NextResponse.redirect(new URL(dashboard, request.url));
    } catch {

      return NextResponse.next();
    }
  }
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
      const { payload } = await jwtVerify(token, secret);
      const role = payload.role as string;

      if (pathname.startsWith('/secretaria') && role !== 'ROLE_SECRETARIA') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      if (pathname.startsWith('/professor') && role !== 'ROLE_PROFESSOR') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      if (pathname.startsWith('/aluno') && role !== 'ROLE_ALUNO') {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      return NextResponse.next();
    } catch {

      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/secretaria/:path*', '/professor/:path*', '/aluno/:path*', '/login'],
};