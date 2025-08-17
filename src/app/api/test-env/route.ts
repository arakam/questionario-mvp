import { NextResponse } from 'next/server';

export async function GET() {
  // Verifica se as variáveis de ambiente estão definidas
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return NextResponse.json({
    supabaseUrl: supabaseUrl ? '✅ Definida' : '❌ Não definida',
    supabaseKey: supabaseKey ? '✅ Definida' : '❌ Não definida',
    nodeEnv: process.env.NODE_ENV,
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
  });
}
