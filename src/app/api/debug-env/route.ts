import { NextResponse } from 'next/server';

export async function GET() {
  const envInfo = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurada' : '❌ Não configurada',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Não configurada',
    SUPABASE_SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE ? '✅ Configurada' : '❌ Não configurada',
    timestamp: new Date().toISOString(),
    host: process.env.HOST || 'não definido',
    port: process.env.PORT || 'não definido',
  };

  console.log('🔍 Debug ENV:', envInfo);

  return NextResponse.json(envInfo);
}
