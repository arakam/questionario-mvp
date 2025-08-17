import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseError } from '@/types/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 });
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

    // Testa login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    if (authError) {
      return NextResponse.json({ 
        error: 'Erro de autenticação', 
        details: (authError as SupabaseError).message 
      }, { status: 401 });
    }

    if (!authData.session) {
      return NextResponse.json({ 
        error: 'Sem sessão após login' 
      }, { status: 401 });
    }

    // Testa verificação de admin
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id')
      .eq('email', email)
      .limit(1);

    if (adminError) {
      return NextResponse.json({ 
        error: 'Erro ao verificar admin', 
        details: (adminError as SupabaseError).message 
      }, { status: 500 });
    }

    if (!adminData || adminData.length === 0) {
      return NextResponse.json({ 
        error: 'Usuário não é admin' 
      }, { status: 403 });
    }

    // Sucesso
    return NextResponse.json({ 
      success: true, 
      user: authData.user,
      isAdmin: true,
      adminId: adminData[0].id
    });

  } catch (error) {
    console.error('Erro no debug login:', error);
    return NextResponse.json({ 
      error: 'Erro interno', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
