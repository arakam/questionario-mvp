import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';

const schema = z.object({
  pessoa_id: z.string().uuid(),
  questionario_id: z.string().uuid(),
  pergunta_id: z.string().uuid(),
  resposta: z.boolean()
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const admin = supabaseAdmin();

  // upsert com unique(pessoa_id, questionario_id, pergunta_id)
  const { data, error } = await admin
    .from('respostas')
    .upsert(parsed.data, { onConflict: 'pessoa_id,questionario_id,pergunta_id' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
