import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const PUBLIC_ADMIN_PATHS = new Set([
    '/admin/login',
    '/admin/login/action',   // <- liberar o POST do login
  ]);

  // só protege /admin, EXCETO as rotas públicas acima
  if (req.nextUrl.pathname.startsWith('/admin') && !PUBLIC_ADMIN_PATHS.has(req.nextUrl.pathname)) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => req.cookies.get(name)?.value,
          set: (name: string, value: string, options: any) => res.cookies.set({ name, value, ...options }),
          remove: (name: string, options: any) => res.cookies.set({ name, value: '', ...options, maxAge: 0 })
        }
      }
    );

    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('redirect', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};
