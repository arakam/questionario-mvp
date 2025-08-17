import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabaseServer';
import type { SupabaseError } from '@/types/supabase';

export async function GET() {
  try {
    // Verifica variáveis de ambiente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        error: 'Variáveis de ambiente não configuradas',
        supabaseUrl: !!supabaseUrl,
        supabaseKey: !!supabaseKey
      }, { status: 500 });
    }

    // Tenta criar cliente Supabase
    const supabase = await createSupabaseServer();
    
    // Testa conexão básica tentando acessar uma tabela que sabemos que existe
    // ou criando uma consulta simples
    const { data: healthData, error: healthError } = await supabase
      .from('admins')
      .select('id')
      .limit(1);

    if (healthError) {
      // Se a tabela admins não existe, isso é esperado
      const error = healthError as SupabaseError;
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('table')) {
        return NextResponse.json({ 
          success: true,
          config: {
            url: supabaseUrl ? '✅ Configurada' : '❌ Não configurada',
            key: supabaseKey ? '✅ Configurada' : '❌ Não configurada',
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseKey
          },
          connection: {
            status: '✅ Conectado (tabela admins não existe ainda)',
            tablesAvailable: false,
            tablesCount: 0,
            note: 'A tabela admins precisa ser criada'
          },
          auth: {
            hasUser: false,
            userEmail: null,
            error: null
          }
        });
      }
      
      const error = healthError as SupabaseError;
      return NextResponse.json({ 
        error: 'Erro de conexão com Supabase',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    // Testa autenticação
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    return NextResponse.json({
      success: true,
      config: {
        url: supabaseUrl ? '✅ Configurada' : '❌ Não configurada',
        key: supabaseKey ? '✅ Configurada' : '❌ Não configurada',
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      },
      connection: {
        status: '✅ Conectado',
        tablesAvailable: !!healthData,
        tablesCount: healthData?.length || 0
      },
      auth: {
        hasUser: !!authData.user,
        userEmail: authData.user?.email || null,
        error: authError?.message || null
      }
    });

  } catch (error) {
    console.error('Erro no debug supabase:', error);
    return NextResponse.json({ 
      error: 'Erro interno', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
