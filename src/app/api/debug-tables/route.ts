import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabaseServer';

export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    
    // Tenta fazer uma consulta direta na tabela admins
    const { data: adminsData, error: adminsError } = await supabase
      .from('admins')
      .select('*')
      .limit(5);

    // Se não há erro, a tabela existe
    if (!adminsError) {
      return NextResponse.json({
        success: true,
        tables: {
          available: ['admins'], // Sabemos que existe
          count: 1
        },
        admins: {
          exists: true,
          structure: 'Tabela encontrada e acessível',
          sampleData: adminsData,
          error: null
        }
      });
    }

    // Se há erro, verifica se é porque a tabela não existe
    if (adminsError.code === 'PGRST116' || adminsError.message.includes('relation') || adminsError.message.includes('table')) {
      return NextResponse.json({
        success: false,
        error: 'Tabela admins não existe',
        tables: {
          available: [],
          count: 0
        },
        admins: {
          exists: false,
          structure: null,
          sampleData: null,
          error: 'Tabela não encontrada'
        },
        solution: 'Execute o SQL do arquivo SUPABASE_SETUP.md para criar a tabela'
      });
    }

    // Outro tipo de erro
    return NextResponse.json({
      success: false,
      error: 'Erro ao acessar tabela admins',
      details: adminsError.message,
      code: adminsError.code,
      tables: {
        available: [],
        count: 0
      },
      admins: {
        exists: false,
        structure: null,
        sampleData: null,
        error: adminsError.message
      }
    });

  } catch (error) {
    console.error('Erro no debug tables:', error);
    return NextResponse.json({ 
      error: 'Erro interno', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
