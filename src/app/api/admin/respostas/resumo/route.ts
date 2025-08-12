import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { supabaseAdminOnly } from '@/lib/supabaseAdminOnly';

type ResumoRow = {
  pessoa_id: string;
  pessoa_nome: string;
  email: string;
  cnpj: string;
  questionario_id: string;
  questionario_nome: string;
  respondidas: number;
  total_perguntas: number;
  pct: number;
  ultima_resposta: string | null;
};

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.res;

  const admin = supabaseAdminOnly();

  // 1) Mapa de total de perguntas por questionário
  const { data: qp, error: e0 } = await admin
    .from('questionario_perguntas')
    .select('questionario_id, pergunta_id');

  if (e0) return NextResponse.json({ error: e0.message }, { status: 400 });

  const totals = new Map<string, number>();
  for (const row of qp ?? []) {
    totals.set(row.questionario_id, (totals.get(row.questionario_id) ?? 0) + 1);
  }

  // 2) Buscar respostas com dados de pessoa e questionário (join)
  const { data: resp, error: e1 } = await admin
    .from('respostas')
    .select('pessoa_id, questionario_id, respondido_em, pessoas(id, nome, email, cnpj), questionarios(id, nome)')
    .order('respondido_em', { ascending: false });

  if (e1) return NextResponse.json({ error: e1.message }, { status: 400 });

  // 3) Agrupar por (pessoa, questionario)
  const map = new Map<string, ResumoRow & { _ultima: number }>();

  for (const r of (resp ?? [])) {
    const pessoa = (r as any).pessoas;
    const quest = (r as any).questionarios;
    if (!pessoa || !quest) continue;

    const key = `${r.pessoa_id}|${r.questionario_id}`;
    const total_perguntas = totals.get(r.questionario_id) ?? 0;
    const ts = r.respondido_em ? new Date(r.respondido_em).getTime() : 0;

    if (!map.has(key)) {
      map.set(key, {
        pessoa_id: r.pessoa_id,
        pessoa_nome: pessoa.nome,
        email: pessoa.email,
        cnpj: pessoa.cnpj,
        questionario_id: r.questionario_id,
        questionario_nome: quest.nome,
        respondidas: 1,
        total_perguntas,
        pct: total_perguntas ? (1 / total_perguntas) * 100 : 0,
        ultima_resposta: r.respondido_em ?? null,
        _ultima: ts,
      });
    } else {
      const row = map.get(key)!;
      row.respondidas += 1;
      row.pct = row.total_perguntas ? (row.respondidas / row.total_perguntas) * 100 : 0;
      if (ts > row._ultima) {
        row._ultima = ts;
        row.ultima_resposta = r.respondido_em ?? row.ultima_resposta;
      }
      map.set(key, row);
    }
  }

  const out = Array.from(map.values())
    .sort((a, b) => (b._ultima - a._ultima))
    .map(({ _ultima, ...rest }) => rest);

  return NextResponse.json(out);
}
