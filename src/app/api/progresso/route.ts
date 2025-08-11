import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';

const schema = z.object({
  pessoa_id: z.string().uuid(),
  questionario_id: z.string().uuid()
});

export async function POST(req: NextRequest) {
  const { pessoa_id, questionario_id } = schema.parse(await req.json());
  const admin = supabaseAdmin();

  const { data: qp, error: qpErr } = await admin
    .from('questionario_perguntas')
    .select('pergunta_id')
    .eq('questionario_id', questionario_id);

  if (qpErr) return NextResponse.json({ error: qpErr.message }, { status: 400 });

  const todos = new Set((qp ?? []).map((x: any) => x.pergunta_id));

  const { data: resp, error: rErr } = await admin
    .from('respostas')
    .select('pergunta_id')
    .eq('pessoa_id', pessoa_id)
    .eq('questionario_id', questionario_id);

  if (rErr) return NextResponse.json({ error: rErr.message }, { status: 400 });

  for (const r of (resp ?? [])) todos.delete(r.pergunta_id);
  const faltam = Array.from(todos);

  return NextResponse.json({ faltam });
}
