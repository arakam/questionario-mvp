import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';

const schema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  telefone: z.string().min(8),
  cnpj: z.string().min(11),
  empresa: z.string().optional(),
  qtd_funcionarios: z.number().int().optional(),
  ramo_atividade: z.string().optional()
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }
  const admin = supabaseAdmin();
  const { email, cnpj } = parsed.data;

  // procura por email + cnpj
  const { data: found, error: findErr } = await admin
    .from('pessoas')
    .select('*')
    .eq('email', email)
    .eq('cnpj', cnpj)
    .maybeSingle();

  if (findErr) return NextResponse.json({ error: findErr.message }, { status: 500 });
  if (found) return NextResponse.json(found);

  // cria se não existir
  const { data: created, error: insErr } = await admin
    .from('pessoas')
    .insert(parsed.data)
    .select()
    .single();

  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 400 });
  return NextResponse.json(created);
}
