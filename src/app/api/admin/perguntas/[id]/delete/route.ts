import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdminOnly } from '@/lib/supabaseAdminOnly';
import { requireAdmin } from '@/lib/adminGuard';

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  // Autenticação + autorização
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.res;

  // Next 15: params é assíncrono
  const { id } = await ctx.params;

  const admin = supabaseAdminOnly();
  const { error } = await admin.from('perguntas').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Redireciona para a lista após excluir
  return NextResponse.redirect(new URL('/admin/perguntas', req.url));
}
