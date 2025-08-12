import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Rotas públicas do admin (não exigem sessão)
  const PUBLIC_ADMIN_PATHS = new Set<string>([
    '/admin/login',
    '/admin/login/action',
  ]);

  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith('/admin') && !PUBLIC_ADMIN_PATHS.has(pathname)) {
    // Adapter de cookies no formato esperado pelo @supabase/ssr
    const cookieMethods = {
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // escreve no response para o navegador receber
        res.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        res.cookies.set({ name, value: '', ...options, maxAge: 0 });
      },
    } as unknown as NonNullable<Parameters<typeof createServerClient>[2]>['cookies'];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: cookieMethods }
    );

    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};
