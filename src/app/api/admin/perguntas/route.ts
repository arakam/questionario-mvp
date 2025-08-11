import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdminOnly } from '@/lib/supabaseAdminOnly';
import { requireAdmin } from '@/lib/adminGuard';

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.res;

  const form = await req.formData();
  const texto = String(form.get('texto') ?? '').trim();
  const peso = Number(form.get('peso') ?? 0);
  const categoria_id = form.get('categoria_id') ? String(form.get('categoria_id')) : null;
  const ativa = form.getAll('ativa').length > 0;

  if (!texto) return NextResponse.json({ error: 'Texto é obrigatório' }, { status: 400 });
  if (Number.isNaN(peso) || peso < 0) return NextResponse.json({ error: 'Peso inválido' }, { status: 400 });

  const admin = supabaseAdminOnly();
  const { error } = await admin.from('perguntas').insert({ texto, peso, categoria_id, ativa });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.redirect(new URL('/admin/perguntas', req.url));
}
