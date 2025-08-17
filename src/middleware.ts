import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Rotas públicas que não precisam de autenticação
  const PUBLIC_ADMIN_PATHS = new Set<string>([
    '/admin/login', 
    '/admin/login/action',
    '/admin/logout',
    '/debug' // Adiciona debug como rota pública
  ]);

  // Se não for uma rota admin ou for uma rota pública, continua
  if (!pathname.startsWith('/admin') || PUBLIC_ADMIN_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // Verifica se há cookies de autenticação do Supabase
  // O Supabase usa o formato: sb-{project-ref}-auth-token
  const hasAuthCookies = req.cookies.getAll().some(cookie => 
    cookie.name.startsWith('sb-') && 
    cookie.name.endsWith('-auth-token') &&
    cookie.value // Verifica se o cookie tem valor
  );
  
  // Se há cookies de autenticação, permite o acesso
  // A verificação completa será feita no layout
  if (hasAuthCookies) {
    console.log('🔓 Middleware: Cookies de auth encontrados, permitindo acesso');
    return NextResponse.next();
  }
  
  console.log('🚫 Middleware: Sem cookies de auth, redirecionando para login');
  console.log('🍪 Cookies disponíveis:', req.cookies.getAll().map(c => c.name));

  // Se não há tokens, redireciona para login
  const url = req.nextUrl.clone();
  url.pathname = '/admin/login';
  url.searchParams.set('redirect', pathname + (req.nextUrl.search ?? ''));
  
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/admin/:path*'],
};
