import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const slug = params.slug;

  const { data: q, error: qErr } = await supabase
    .from('questionarios')
    .select('id, nome, slug')
    .eq('slug', slug)
    .single();

  if (qErr || !q) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const { data: qp, error: qpErr } = await supabase
    .from('questionario_perguntas')
    .select('pergunta_id, perguntas!inner(id, texto, peso, categoria_id)')
    .eq('questionario_id', q.id);

  if (qpErr) return NextResponse.json({ error: qpErr.message }, { status: 500 });

  const perguntas = (qp ?? []).map((x: any) => x.perguntas);

  // aleatoriza
  for (let i = perguntas.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [perguntas[i], perguntas[j]] = [perguntas[j], perguntas[i]];
  }

  return NextResponse.json({ questionario: q, perguntas });
}
