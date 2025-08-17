import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Força o uso do Node.js runtime para evitar problemas com Edge Runtime
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
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

  // Cria resposta de redirecionamento usando caminho relativo
  // O Next.js vai redirecionar para o domínio correto automaticamente
  console.log('🔍 Logout: Redirecionando para: /admin/login');
  const res = NextResponse.redirect('/admin/login');
  
  // Remove explicitamente os cookies de autenticação do Supabase
  const supabaseCookies = [
    'sb-access-token',
    'sb-refresh-token',
    'supabase-auth-token'
  ];
  
  supabaseCookies.forEach(cookieName => {
    res.cookies.set({
      name: cookieName,
      value: '',
      maxAge: 0,
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
  });

  return res;
}
