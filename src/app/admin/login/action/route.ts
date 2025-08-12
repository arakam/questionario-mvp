import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

type Creds = { email: string; password: string; redirect?: string };

function sanitizeRedirect(input: string | undefined): string {
  // Só permite caminhos relativos internos. Qualquer URL absoluta vira "/admin".
  if (!input) return '/admin';
  try {
    // se vier absoluta, descartamos (evita open-redirect e "localhost")
    const u = new URL(input);
    if (u.origin && u.protocol) return '/admin';
  } catch {
    /* não é URL absoluta, ok */
  }
  // garante começar com "/"
  return input.startsWith('/') ? input : `/${input}`;
}

async function readBody(req: NextRequest): Promise<Creds> {
  const ct = req.headers.get('content-type') || '';

  if (ct.includes('application/json')) {
    const json = await req.json();
    return {
      email: String(json.email ?? ''),
      password: String(json.password ?? ''),
      redirect: sanitizeRedirect(String(json.redirect ?? '/admin')),
    };
  }

  if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
    const form = await req.formData();
    return {
      email: String(form.get('email') ?? ''),
      password: String(form.get('password') ?? ''),
      redirect: sanitizeRedirect(String(form.get('redirect') ?? '/admin')),
    };
  }

  try {
    const json = await req.json();
    return {
      email: String(json.email ?? ''),
      password: String(json.password ?? ''),
      redirect: sanitizeRedirect(String(json.redirect ?? '/admin')),
    };
  } catch {
    throw new Error('Unsupported content type');
  }
}

export async function POST(req: NextRequest) {
  // Lê credenciais (suporta form e JSON) + sanitiza redirect
  let email = '', password = '', redirect = '/admin';
  try {
    const body = await readBody(req);
    email = body.email;
    password = body.password;
    redirect = body.redirect || '/admin';
  } catch {
    return NextResponse.redirect(new URL('/admin/login?error=content', req.url));
  }

  // Resposta com redirecionamento interno
  const res = NextResponse.redirect(new URL(redirect, req.url));

  const cookieStore = await cookies();
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

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieMethods }
  );

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data?.session) {
    return NextResponse.redirect(new URL('/admin/login?error=auth', req.url));
  }

  return res;
}
