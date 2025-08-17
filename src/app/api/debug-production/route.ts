import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabaseServer';

export async function GET(req: NextRequest) {
  try {
    const allCookies = req.cookies.getAll();
    const host = req.headers.get('host') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const referer = req.headers.get('referer') || 'unknown';

    // Verifica variáveis de ambiente
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurada' : '❌ Não configurada',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Não configurada'
    };

    // Filtra cookies do Supabase
    const supabaseCookies = allCookies.filter(cookie =>
      cookie.name.startsWith('sb-')
    );

    // Verifica se há cookies de autenticação
    const hasAuthCookies = allCookies.some(cookie =>
      cookie.name.startsWith('sb-') &&
      cookie.name.endsWith('-auth-token') &&
      cookie.value
    );

    // Tenta verificar a sessão atual
    let sessionInfo = { hasSession: false, userEmail: null, error: null };
    try {
      const supabase = await createSupabaseServer();
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (user && !error) {
        sessionInfo = {
          hasSession: true,
          userEmail: user.email,
          error: null
        };
      } else {
        sessionInfo = {
          hasSession: false,
          userEmail: null,
          error: error?.message || 'Sem usuário'
        };
      }
    } catch (sessionError) {
      sessionInfo = {
        hasSession: false,
        userEmail: null,
        error: sessionError instanceof Error ? sessionError.message : 'Erro desconhecido'
      };
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        host,
        userAgent: userAgent.substring(0, 100),
        referer,
        envVars
      },
      cookies: {
        total: allCookies.length,
        all: allCookies.map(c => ({ 
          name: c.name, 
          hasValue: !!c.value, 
          valueLength: c.value ? c.value.length : 0 
        })),
        supabase: supabaseCookies.map(c => ({ 
          name: c.name, 
          hasValue: !!c.value, 
          valueLength: c.value ? c.value.length : 0 
        })),
        hasAuthCookies
      },
      session: sessionInfo,
      headers: {
        host,
        userAgent: userAgent.substring(0, 100),
        referer
      }
    });

  } catch (error) {
    console.error('❌ Erro no debug production:', error);
    return NextResponse.json({
      error: 'Erro interno',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
