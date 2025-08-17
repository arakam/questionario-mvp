import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const host = req.headers.get('host') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  console.log('🔍 Middleware - Iniciando verificação:', {
    pathname,
    host,
    userAgent: userAgent.substring(0, 100),
    timestamp: new Date().toISOString()
  });

  // Rotas públicas que não precisam de autenticação
  const PUBLIC_ADMIN_PATHS = new Set<string>([
    '/admin/login', 
    '/admin/login/action',
    '/admin/logout',
    '/debug' // Adiciona debug como rota pública
  ]);

  // Se não for uma rota admin ou for uma rota pública, continua
  if (!pathname.startsWith('/admin') || PUBLIC_ADMIN_PATHS.has(pathname)) {
    console.log('✅ Middleware: Rota pública ou não-admin, permitindo acesso');
    return NextResponse.next();
  }

  // Lista todos os cookies para debug
  const allCookies = req.cookies.getAll();
  console.log('🍪 Middleware - Todos os cookies:', allCookies.map(c => ({
    name: c.name,
    hasValue: !!c.value,
    valueLength: c.value ? c.value.length : 0
  })));

  // Verifica se há cookies de autenticação do Supabase
  // O Supabase usa o formato: sb-{project-ref}-auth-token
  const supabaseCookies = allCookies.filter(cookie => 
    cookie.name.startsWith('sb-') && 
    cookie.name.endsWith('-auth-token')
  );

  console.log('🔐 Middleware - Cookies Supabase encontrados:', supabaseCookies.map(c => ({
    name: c.name,
    hasValue: !!c.value,
    valueLength: c.value ? c.value.length : 0
  })));

  const hasAuthCookies = supabaseCookies.some(cookie => cookie.value);
  
  // Se há cookies de autenticação, permite o acesso
  // A verificação completa será feita no layout
  if (hasAuthCookies) {
    console.log('🔓 Middleware: Cookies de auth encontrados, permitindo acesso');
    console.log('✅ Middleware: Acesso permitido para:', pathname);
    return NextResponse.next();
  }
  
  console.log('🚫 Middleware: Sem cookies de auth válidos, redirecionando para login');
  console.log('❌ Middleware: Falha na verificação para:', pathname);

  // Se não há tokens, redireciona para login
  const url = req.nextUrl.clone();
  url.pathname = '/admin/login';
  url.searchParams.set('redirect', pathname + (req.nextUrl.search ?? ''));
  
  console.log('🔄 Middleware: Redirecionando para:', url.toString());
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/admin/:path*'],
};
