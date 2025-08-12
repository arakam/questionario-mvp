import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const PUBLIC_ADMIN_PATHS = new Set<string>(['/admin/login', '/admin/login/action']);
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith('/admin') && !PUBLIC_ADMIN_PATHS.has(pathname)) {
    const cookieMethods = {
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
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
      // garante que `redirect` é sempre path relativo
      url.searchParams.set('redirect', pathname + (req.nextUrl.search ?? ''));
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};
