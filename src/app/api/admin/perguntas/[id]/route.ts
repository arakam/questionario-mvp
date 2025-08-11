import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdminOnly } from '@/lib/supabaseAdminOnly';
import { requireAdmin } from '@/lib/adminGuard';

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  // Autenticação + autorização (e-mail precisa existir em `admins`)
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.res;

  // Next 15: params é assíncrono
  const { id } = await ctx.params;

  // Lê dados do formulário
  const form = await req.formData();
  const texto = String(form.get('texto') ?? '').trim();
  const peso = Number(form.get('peso') ?? 0);
  const categoria_id = form.get('categoria_id') ? String(form.get('categoria_id')) : null;
  const ativa = form.getAll('ativa').length > 0;

  if (!texto) return NextResponse.json({ error: 'Texto é obrigatório' }, { status: 400 });
  if (Number.isNaN(peso) || peso < 0) return NextResponse.json({ error: 'Peso inválido' }, { status: 400 });

  const admin = supabaseAdminOnly();
  const { error } = await admin
    .from('perguntas')
    .update({ texto, peso, categoria_id, ativa })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Volta para a lista de perguntas
  return NextResponse.redirect(new URL('/admin/perguntas', req.url));
}
