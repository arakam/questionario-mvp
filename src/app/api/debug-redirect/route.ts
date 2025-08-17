import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const redirect = url.searchParams.get('redirect') || '/admin';
    
    console.log('🔍 Debug redirecionamento - Teste:', {
      originalUrl: req.url,
      redirectParam: redirect,
      finalUrl: new URL(redirect, req.url).toString()
    });

    // Simula o redirecionamento que acontece no login
    const res = NextResponse.redirect(new URL(redirect, req.url));
    
    console.log('✅ Redirecionamento criado:', res.headers.get('location'));
    
    return res;

  } catch (error) {
    console.error('❌ Erro no debug redirect:', error);
    return NextResponse.json({ 
      error: 'Erro interno', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
