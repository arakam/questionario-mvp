import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdminOnly } from '@/lib/supabaseAdminOnly';
import { requireAdmin } from '@/lib/adminGuard';

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> } // 👈 Promise aqui também
) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.res;

  const { id } = await ctx.params;          // 👈 await params

  const form = await req.formData();
  const nome = String(form.get('nome') ?? '').trim();
  const descricao = form.get('descricao') ? String(form.get('descricao')) : null;

  if (!nome) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });

  const admin = supabaseAdminOnly();
  const { error } = await admin.from('categorias').update({ nome, descricao }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.redirect(new URL('/admin/categorias', req.url));
}
