import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdminOnly } from '@/lib/supabaseAdminOnly';

type Questionario = {
  id: string;
  nome: string;
  slug: string;
};

type Pergunta = {
  id: string;
  texto: string;
  peso: number;
  ativa: boolean;
  tipo: string;
  opcoes: any;
  config_escala: any;
};

type QPRow = {
  perguntas: Pergunta; // join !inner
};

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ slug: string }> } // 👈 Next 15: params como Promise
) {
  const { slug } = await ctx.params;

  const admin = supabaseAdminOnly();

  // Busca o questionário pelo slug
  const { data: q, error: e1 } = await admin
    .from('questionarios')
    .select('id, nome, slug')
    .eq('slug', slug)
    .single<Questionario>();

  if (e1 || !q) {
    return NextResponse.json({ error: e1?.message ?? 'Questionário não encontrado' }, { status: 404 });
  }

  // Busca as perguntas ativas vinculadas a esse questionário
  const { data: qps, error: e2 } = await admin
    .from('questionario_perguntas')
    .select('perguntas!inner(id, texto, peso, ativa, tipo, opcoes, config_escala)')
    .eq('questionario_id', q.id)
    .eq('perguntas.ativa', true)
    .returns<QPRow[]>();

  if (e2) {
    return NextResponse.json({ error: e2.message }, { status: 400 });
  }

  const perguntas: Pergunta[] = (qps ?? []).map((row) => row.perguntas);

  return NextResponse.json({
    questionario: q,
    perguntas,
  });
}
