import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

type Creds = { email: string; password: string; redirect?: string };

async function readBody(req: NextRequest): Promise<Creds> {
  const ct = req.headers.get('content-type') || '';

  // JSON (fetch)
  if (ct.includes('application/json')) {
    const json = await req.json();
    return {
      email: String(json.email ?? ''),
      password: String(json.password ?? ''),
      redirect: String(json.redirect ?? '/admin'),
    };
  }

  // FormData (form-urlencoded ou multipart)
  if (
    ct.includes('application/x-www-form-urlencoded') ||
    ct.includes('multipart/form-data')
  ) {
    const form = await req.formData();
    return {
      email: String(form.get('email') ?? ''),
      password: String(form.get('password') ?? ''),
      redirect: String(form.get('redirect') ?? '/admin'),
    };
  }

  // Fallback: tenta JSON
  try {
    const json = await req.json();
    return {
      email: String(json.email ?? ''),
      password: String(json.password ?? ''),
      redirect: String(json.redirect ?? '/admin'),
    };
  } catch {
    throw new Error('Unsupported content type');
  }
}

export async function POST(req: NextRequest) {
  // Lê credenciais (suporta form e JSON)
  let email = '', password = '', redirect = '/admin';
  try {
    const body = await readBody(req);
    email = body.email;
    password = body.password;
    redirect = body.redirect || '/admin';
  } catch {
    return NextResponse.redirect(new URL('/admin/login?error=content', req.url));
  }

  // Preparar resposta (redirect pós-login)
  const res = NextResponse.redirect(new URL(redirect, req.url));

  // Store de cookies do Next
  const cookieStore = await cookies();

  // Adapter de cookies no formato esperado pelo @supabase/ssr
  const cookieMethods = {
    get(name: string) {
      return cookieStore.get(name)?.value;
    },
    set(name: string, value: string, options: CookieOptions) {
      // grava no store desta request
      cookieStore.set({ name, value, ...options });
      // garante que a resposta também envie o cookie ao cliente
      res.cookies.set({ name, value, ...options });
    },
    remove(name: string, options: CookieOptions) {
      cookieStore.set({ name, value: '', ...options, maxAge: 0 });
      res.cookies.set({ name, value: '', ...options, maxAge: 0 });
    },
  } as unknown as NonNullable<Parameters<typeof createServerClient>[2]>['cookies'];

  // Cria o cliente Supabase server-side
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieMethods }
  );

  // Autentica
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data?.session) {
    return NextResponse.redirect(new URL('/admin/login?error=auth', req.url));
  }

  // Sucesso: cookies de sessão foram setados via cookieMethods + redirect
  return res;
}
