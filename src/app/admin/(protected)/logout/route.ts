import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  // Redireciona para a tela de login após sair
  const res = NextResponse.redirect(new URL('/admin/login', req.url));

  // Store de cookies no contexto do Route Handler
  const cookieStore = await cookies();

  // Adapta os métodos de cookies para a forma esperada pelo @supabase/ssr
  const cookieMethods = {
    get(name: string) {
      return cookieStore.get(name)?.value;
    },
    set(name: string, value: string, options: CookieOptions) {
      cookieStore.set({ name, value, ...options });
    },
    remove(name: string, options: CookieOptions) {
      cookieStore.set({ name, value: '', ...options, maxAge: 0 });
    },
  } as unknown as NonNullable<Parameters<typeof createServerClient>[2]>['cookies'];

  // Cria o client server-side usando as envs de produção
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieMethods,
    }
  );

  // Encerra a sessão (o Supabase vai ajustar os cookies via cookieMethods acima)
  await supabase.auth.signOut();

  return res;
}
