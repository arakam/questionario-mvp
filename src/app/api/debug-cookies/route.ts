import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const allCookies = req.cookies.getAll();
    
    console.log('🍪 Debug Cookies - Todos os cookies:', allCookies);
    
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
    
    return NextResponse.json({
      success: true,
      totalCookies: allCookies.length,
      allCookies: allCookies.map(c => ({ name: c.name, value: c.value ? '***' : 'undefined' })),
      supabaseCookies: supabaseCookies.map(c => ({ name: c.name, value: c.value ? '***' : 'undefined' })),
      hasAuthCookies,
      authCookies: allCookies.filter(c => 
        c.name.startsWith('sb-') && 
        c.name.endsWith('-auth-token') &&
        c.value
      ).map(c => ({ name: c.name, hasValue: !!c.value }))
    });

  } catch (error) {
    console.error('❌ Erro no debug cookies:', error);
    return NextResponse.json({ 
      error: 'Erro interno', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
