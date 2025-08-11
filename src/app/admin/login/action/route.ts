import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

type Creds = { email: string; password: string; redirect?: string };

async function readBody(req: NextRequest): Promise<Creds> {
  const ct = req.headers.get('content-type') || '';

  // Suporta fetch JSON
  if (ct.includes('application/json')) {
    const json = await req.json();
    return {
      email: String(json.email ?? ''),
      password: String(json.password ?? ''),
      redirect: String(json.redirect ?? '/admin'),
    };
  }

  // Suporta <form method="post"> (urlencoded / multipart)
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

  // Fallback: tenta json, senão erro amigável
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
  let email = '', password = '', redirect = '/admin';
  try {
    const body = await readBody(req);
    email = body.email;
    password = body.password;
    redirect = body.redirect || '/admin';
  } catch {
    return NextResponse.redirect(new URL('/admin/login?error=content', req.url));
  }

  // prepara resposta de redirect (assim o Supabase pode setar cookies nela)
  const res = NextResponse.redirect(new URL(redirect, req.url));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: any) => res.cookies.set({ name, value, ...options }),
        remove: (name: string, options: any) => res.cookies.set({ name, value: '', ...options, maxAge: 0 }),
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    return NextResponse.redirect(new URL('/admin/login?error=auth', req.url));
  }

  return res;
}
