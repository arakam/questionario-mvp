import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { supabaseAdminOnly } from '@/lib/supabaseAdminOnly';

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.res;

  const url = new URL(req.url);
  const pessoa_id = url.searchParams.get('pessoa_id');
  const questionario_id = url.searchParams.get('questionario_id');

  if (!pessoa_id || !questionario_id) {
    return NextResponse.json({ error: 'Parâmetros obrigatórios: pessoa_id e questionario_id' }, { status: 400 });
  }

  const admin = supabaseAdminOnly();

  // pessoa
  const { data: pessoa, error: e1 } = await admin
    .from('pessoas')
    .select('id, nome, email, cnpj, empresa')
    .eq('id', pessoa_id)
    .single();
  if (e1) return NextResponse.json({ error: e1.message }, { status: 400 });

  // questionário
  const { data: q, error: e2 } = await admin
    .from('questionarios')
    .select('id, nome, slug')
    .eq('id', questionario_id)
    .single();
  if (e2) return NextResponse.json({ error: e2.message }, { status: 400 });

  // perguntas do questionário
  const { data: qps, error: e3 } = await admin
    .from('questionario_perguntas')
    .select('pergunta_id, perguntas!inner(id, texto, peso)')
    .eq('questionario_id', questionario_id);
  if (e3) return NextResponse.json({ error: e3.message }, { status: 400 });

  const perguntas = (qps ?? []).map((x: any) => x.perguntas);

  // respostas da pessoa
  const { data: resp, error: e4 } = await admin
    .from('respostas')
    .select('pergunta_id, resposta, respondido_em')
    .eq('pessoa_id', pessoa_id)
    .eq('questionario_id', questionario_id);

  if (e4) return NextResponse.json({ error: e4.message }, { status: 400 });

  const mapResp = new Map<string, { resposta: boolean; respondido_em: string | null }>();
  for (const r of (resp ?? [])) {
    mapResp.set(r.pergunta_id, { resposta: r.resposta, respondido_em: r.respondido_em ?? null });
  }

  const itens = perguntas.map((p: any) => {
    const r = mapResp.get(p.id);
    return {
      pergunta_id: p.id,
      texto: p.texto,
      peso: p.peso,
      resposta: r?.resposta ?? null,
      respondido_em: r?.respondido_em ?? null,
    };
  });

  return NextResponse.json({
    pessoa,
    questionario: q,
    itens,
  });
}
