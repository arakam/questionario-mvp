import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabaseServer';
import type { SupabaseError } from '@/types/supabase';

export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    
    // Verifica usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      return NextResponse.json({ 
        error: 'Erro ao obter usuário', 
        details: (userError as SupabaseError).message 
      }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ 
        error: 'Nenhum usuário autenticado' 
      }, { status: 401 });
    }

    // Verifica se é admin
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id')
      .eq('email', user.email!)
      .limit(1);

    if (adminError) {
      return NextResponse.json({ 
        error: 'Erro ao verificar admin', 
        details: (adminError as SupabaseError).message 
      }, { status: 500 });
    }

    const isAdmin = !!adminData?.length;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        emailConfirmed: user.email_confirmed_at,
        lastSignIn: user.last_sign_in_at,
      },
      isAdmin,
      adminId: adminData?.[0]?.id || null,
      adminCheck: {
        hasData: !!adminData,
        dataLength: adminData?.length || 0,
        error: null // adminError já foi verificado acima
      }
    });

  } catch (error) {
    console.error('Erro no debug session:', error);
    return NextResponse.json({ 
      error: 'Erro interno', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
