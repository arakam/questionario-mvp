import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdminOnly } from './supabaseAdminOnly';

// Força o uso do Node.js runtime para evitar problemas com Edge Runtime
export const runtime = 'nodejs';

type GuardResult =
  | { ok: true; res: NextResponse }
  | { ok: false; res: NextResponse };

/**
 * Garante que a request vem de um usuário autenticado
 * e com e-mail presente na tabela `admins`.
 * Em caso de falha, retorna uma resposta apropriada.
 */
export async function requireAdmin(req: NextRequest): Promise<GuardResult> {
  // Resposta padrão (seguindo para a próxima etapa)
  const res = NextResponse.next();

  // Store de cookies do Next (Route Handler)
  const cookieStore = await cookies();

  // Adapter de cookies no formato esperado pelo @supabase/ssr
  const cookieMethods = {
    get(name: string) {
      return cookieStore.get(name)?.value;
    },
    set(name: string, value: string, options: CookieOptions) {
      cookieStore.set({ name, value, ...options });
      res.cookies.set({ name, value, ...options });
    },
    remove(name: string, options: CookieOptions) {
      cookieStore.set({ name, value: '', ...options, maxAge: 0 });
      res.cookies.set({ name, value: '', ...options, maxAge: 0 });
    },
  } as unknown as NonNullable<Parameters<typeof createServerClient>[2]>['cookies'];

  // Cliente Supabase (SSR) para ler sessão do usuário via cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieMethods }
  );

  // Verifica sessão
  const { data, error: authErr } = await supabase.auth.getUser();
  if (authErr) {
    return {
      ok: false,
      res: NextResponse.json({ error: authErr.message }, { status: 401 }),
    };
  }

  const user = data?.user;
  if (!user) {
    // Sem usuário logado: redireciona para login
    const url = new URL('/admin/login', req.url);
    url.searchParams.set('redirect', new URL(req.url).pathname);
    return { ok: false, res: NextResponse.redirect(url) };
  }

  // Verifica se e-mail está na tabela `admins` usando Service Role
  const adminClient = supabaseAdminOnly();
  const { data: adminRow, error: e } = await adminClient
    .from('admins')
    .select('email')
    .eq('email', user.email)
    .maybeSingle();

  if (e) {
    return {
      ok: false,
      res: NextResponse.json({ error: e.message }, { status: 500 }),
    };
  }

  if (!adminRow) {
    return {
      ok: false,
      res: NextResponse.json({ error: 'Acesso negado' }, { status: 403 }),
    };
  }

  // Ok, é admin
  return { ok: true, res };
}
