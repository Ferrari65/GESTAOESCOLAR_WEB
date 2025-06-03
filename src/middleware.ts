import { NextResponse, NextRequest } from 'next/server';
import { MIDDLEWARE_CONFIG, AUTH_CONFIG } from '@/config/app';

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

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldSkipMiddleware(pathname)) {
    return NextResponse.next();
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const token = request.cookies.get(AUTH_CONFIG.tokenCookieName)?.value;

  // Casos
  // Caso 1: Sem token em rota protegida / Login
  if (!token && !isPublicPath(pathname)) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Caso 2: Com token tentando acessar login -/ Dashboard
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/secretaria/home', request.url));
  }

  if (token && isPublicPath(pathname) && pathname !== '/login') {
    return NextResponse.redirect(new URL('/secretaria/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};