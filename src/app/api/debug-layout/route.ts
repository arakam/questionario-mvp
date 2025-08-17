import { NextResponse } from 'next/server';
import { getSessionAndAdmin } from '@/lib/isAdmin';

export async function GET() {
  try {
    console.log('🔍 Debug do Layout Admin - Iniciando...');
    
    const { isAdmin, user } = await getSessionAndAdmin();
    
    console.log('📊 Resultado da verificação:', { 
      hasUser: !!user, 
      userEmail: user?.email, 
      isAdmin 
    });
    
    if (!isAdmin || !user) {
      console.log('❌ Acesso negado no debug');
      return NextResponse.json({
        success: false,
        access: 'denied',
        reason: !user ? 'no_user' : 'not_admin',
        user: user ? {
          id: user.id,
          email: user.email,
          emailConfirmed: user.email_confirmed_at,
          lastSignIn: user.last_sign_in_at,
        } : null,
        isAdmin
      });
    }
    
    console.log('✅ Acesso permitido no debug');
    return NextResponse.json({
      success: true,
      access: 'granted',
      user: {
        id: user.id,
        email: user.email,
        emailConfirmed: user.email_confirmed_at,
        lastSignIn: user.last_sign_in_at,
      },
      isAdmin
    });

  } catch (error) {
    console.error('❌ Erro no debug do layout:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Erro interno', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
