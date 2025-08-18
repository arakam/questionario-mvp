import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getBaseUrl } from '../../../lib/urlUtils';

// Força o uso do Node.js runtime para evitar problemas com Edge Runtime
export const runtime = 'nodejs';

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
    return NextResponse.redirect('/admin/login?error=content');
  }

  const cookieStore = await cookies();
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

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieMethods }
  );

  // Primeiro tenta fazer login
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data?.session) {
    console.error('Erro de login:', error?.message || 'Sem sessão');
    return NextResponse.redirect('/admin/login?error=auth');
  }

  // Se chegou aqui, o login foi bem-sucedido
  // Agora verifica se o usuário é admin
  try {
    console.log('🔍 Verificando se usuário é admin:', email);
    
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id')
      .eq('email', email)
      .limit(1);

    console.log('🔍 Resultado da verificação admin:', { adminData, adminError });

    if (adminError) {
      console.error('❌ Erro ao verificar admin:', adminError);
      await supabase.auth.signOut();
      return NextResponse.redirect('/admin/login?error=admin_check');
    }

    if (!adminData || adminData.length === 0) {
      console.error('❌ Usuário não é admin:', email);
      // Faz logout se não for admin
      await supabase.auth.signOut();
      return NextResponse.redirect('/admin/login?error=not_admin');
    }

    // Login e verificação de admin bem-sucedidos
    console.log('Login bem-sucedido para:', email);
    console.log('🔍 Debug redirecionamento:', { 
      originalRedirect: redirect, 
      sanitizedRedirect: redirect,
      redirectPath: redirect
    });
    
    // Cria resposta de redirecionamento usando caminho relativo
    // O Next.js vai redirecionar para o domínio correto automaticamente
    const res = NextResponse.redirect(redirect);
    
    // O Supabase já gerencia os cookies automaticamente
    // Não precisamos aplicar cookies manualmente
    
    console.log('✅ Redirecionamento criado:', res.headers.get('location'));
    return res;

  } catch (adminCheckError) {
    console.error('Erro ao verificar admin:', adminCheckError);
    await supabase.auth.signOut();
    
    // Usa a URL base correta em vez de req.url
    const baseUrl = getBaseUrl();
    const errorUrl = `${baseUrl}/admin/login?error=admin_check`;
    
    console.log('🔄 Redirecionando para erro usando URL base:', errorUrl);
    return NextResponse.redirect(errorUrl);
  }
}
